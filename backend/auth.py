"""
HabitTwin Authentication & Security Module
Provides cryptographically secure password hashing (PBKDF2-HMAC-SHA256),
JWT token generation & validation (RFC 7519 HMAC-SHA256),
and FastAPI user session dependencies.
"""

import os
import time
import json
import base64
import hmac
import hashlib
import secrets
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
from .json_db import get_user_db, JsonUserDB, UserRecord

JWT_SECRET = os.getenv("JWT_SECRET", "habittwin_production_secure_token_secret_2026")
TOKEN_EXPIRE_SECONDS = 86400 * 30  # 30 days session persistence


def hash_password(plain_password: str) -> str:
    """Hashes a password with a cryptographically secure random salt using PBKDF2-HMAC-SHA256."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a stored salt$hash string."""
    try:
        salt, key_hex = hashed_password.split("$", 1)
        key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100_000)
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False


def create_access_token(user_id: int, email: str, name: str) -> str:
    """Generates a signed JWT access token valid for 30 days."""
    now = int(time.time())
    payload = {
        "sub": str(user_id),
        "email": email,
        "name": name,
        "iat": now,
        "exp": now + TOKEN_EXPIRE_SECONDS,
    }
    header = {"alg": "HS256", "typ": "JWT"}
    h_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    p_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signature = hmac.new(JWT_SECRET.encode("utf-8"), f"{h_b64}.{p_b64}".encode("utf-8"), hashlib.sha256).digest()
    s_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{h_b64}.{p_b64}.{s_b64}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and cryptographically verifies an access token."""
    try:
        parts = token.strip().split(".")
        if len(parts) != 3:
            return None
        h_b64, p_b64, s_b64 = parts

        # Verify signature
        expected = hmac.new(JWT_SECRET.encode("utf-8"), f"{h_b64}.{p_b64}".encode("utf-8"), hashlib.sha256).digest()
        pad = lambda s: s + "=" * (-len(s) % 4)
        sig = base64.urlsafe_b64decode(pad(s_b64))
        if not hmac.compare_digest(sig, expected):
            return None

        payload_bytes = base64.urlsafe_b64decode(pad(p_b64))
        payload = json.loads(payload_bytes.decode("utf-8"))

        if payload.get("exp") and payload["exp"] < time.time():
            return None  # Token expired

        return payload
    except Exception:
        return None


def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    user_db: JsonUserDB = Depends(get_user_db),
) -> Optional[UserRecord]:
    """
    Extracts the authenticated user from the Authorization: Bearer <token> header.
    Returns None if no token or invalid, allowing guest/demo access.
    """
    if not authorization:
        return None

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None

    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        return None

    user_id = int(payload["sub"])
    return user_db.get_by_id(user_id)


def require_current_user(
    current_user: Optional[UserRecord] = Depends(get_current_user_optional),
) -> UserRecord:
    """Dependency that enforces a logged-in user, raising HTTP 401 if not authenticated."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to your HabitTwin account.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
