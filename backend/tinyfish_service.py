"""
HabitTwin TinyFish Web Agent & Research Service
Integrates TinyFish's AI web automation and research infrastructure to dynamically
gather real-world behavioral science, habit studies, and campus guidance.
"""

import os
import ssl
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional
from pathlib import Path
from dotenv import load_dotenv

# Load from working directory and backend directory
load_dotenv()
_backend_env = Path(__file__).resolve().parent / ".env"
if _backend_env.exists():
    load_dotenv(dotenv_path=_backend_env, override=False)

logger = logging.getLogger("habittwin.tinyfish")

TINYFISH_API_BASE = os.getenv("TINYFISH_API_BASE", "https://agent.tinyfish.ai/v1")


def get_tinyfish_api_key() -> str:
    """Retrieves the TinyFish API Key from environment."""
    return os.getenv("TINYFISH_API_KEY", "").strip()


def is_tinyfish_configured() -> bool:
    """Returns True if a valid TinyFish API Key is set."""
    key = get_tinyfish_api_key()
    return bool(key and key.startswith("sk-tinyfish-"))


def _create_ssl_context() -> ssl.SSLContext:
    """Creates a resilient SSL context across diverse Windows & Linux environments."""
    ctx = ssl.create_default_context()
    try:
        import certifi
        ctx.load_verify_locations(certifi.where())
    except Exception:
        # Fallback to permissive context if system certificates are missing on Windows
        ctx = ssl._create_unverified_context()
    return ctx


def run_web_agent(url: str, goal: str, timeout: int = 45) -> Dict[str, Any]:
    """
    Executes a goal-driven browser automation task using TinyFish's cloud agent fleet.
    
    Args:
        url: The starting website URL to navigate to.
        goal: Plain-English instructions detailing what information to extract or actions to take.
        timeout: Maximum execution timeout in seconds.
    
    Returns:
        Structured response dictionary containing status, run_id, num_of_steps, and result.
    """
    api_key = get_tinyfish_api_key()
    if not api_key:
        return {
            "success": False,
            "status": "CONFIG_ERROR",
            "message": "TINYFISH_API_KEY is not configured in backend environment variables.",
            "result": None,
        }

    endpoint = f"{TINYFISH_API_BASE}/automation/run"
    payload = {
        "url": url,
        "goal": goal,
    }

    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-API-Key": api_key,
            "User-Agent": "HabitTwin-Backend/2.0",
        },
        method="POST",
    )

    ctx = _create_ssl_context()

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return {
                "success": data.get("status") == "COMPLETED",
                "status": data.get("status", "UNKNOWN"),
                "run_id": data.get("run_id"),
                "num_of_steps": data.get("num_of_steps", 0),
                "started_at": data.get("started_at"),
                "finished_at": data.get("finished_at"),
                "result": data.get("result"),
                "error": data.get("error"),
            }
    except urllib.error.HTTPError as he:
        try:
            err_body = json.loads(he.read().decode("utf-8"))
        except Exception:
            err_body = str(he)
        logger.error("TinyFish HTTP Error %d: %s", he.code, err_body)
        return {
            "success": False,
            "status": f"HTTP_{he.code}",
            "message": f"TinyFish API returned status {he.code}",
            "error": err_body,
            "result": None,
        }
    except Exception as e:
        logger.error("TinyFish execution failed: %s", str(e))
        return {
            "success": False,
            "status": "NETWORK_ERROR",
            "message": str(e),
            "result": None,
        }


def research_habit_topic(
    topic: str,
    target_url: Optional[str] = None,
    timeout: int = 45,
) -> Dict[str, Any]:
    """
    Researches a habit or productivity topic via TinyFish web agents.
    
    Args:
        topic: The subject to research (e.g. 'restorative sleep hygiene', 'active recall study rhythm').
        target_url: Optional starting point. If omitted, uses reputable behavioral science knowledge bases.
        timeout: Execution timeout in seconds.
    """
    if not target_url:
        target_url = "https://en.wikipedia.org/wiki/Habit"

    goal = (
        f"Research the topic '{topic}'. Extract the core definition, 3 actionable science-backed "
        "recommendations, and the primary benefit for daily student consistency. "
        "Return the output as clean structured JSON with keys: 'summary', 'recommendations', and 'key_benefit'."
    )

    return run_web_agent(url=target_url, goal=goal, timeout=timeout)
