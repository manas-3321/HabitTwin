"""
HabitTwin Certificate Generation & Automated Email Dispatch Service
Generates official, high-resolution PDF Certificates of Genuine Appreciation
and automatically delivers them with PDF attachments via Resend or SMTP.
"""

import os
import io
import time
import base64
import smtplib
import hashlib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import Optional, Dict, Any

from PIL import Image, ImageDraw, ImageFont

# Local directory where generated certificates are staged/saved
CERTIFICATES_DIR = os.path.join(os.path.dirname(__file__), "certificates_generated")
os.makedirs(CERTIFICATES_DIR, exist_ok=True)


def _get_font(size: int, bold: bool = False):
    """Safely loads standard TrueType fonts on Windows/Linux or falls back to default."""
    font_names = [
        "georgiab.ttf" if bold else "georgia.ttf",
        "timesbd.ttf" if bold else "times.ttf",
        "arialbd.ttf" if bold else "arial.ttf",
        "DejaVuSerif-Bold.ttf" if bold else "DejaVuSerif.ttf",
    ]
    for name in font_names:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    try:
        return ImageFont.load_default()
    except Exception:
        return None


def generate_certificate_pdf(
    user_name: str,
    issue_date_str: Optional[str] = None,
    streak_days: int = 180,
    cert_id: Optional[str] = None,
) -> bytes:
    """
    Renders an official high-resolution landscape Certificate of Genuine Appreciation
    using PIL and exports directly to in-memory PDF bytes.
    """
    if not issue_date_str:
        issue_date_str = datetime.now().strftime("%B %d, %Y")

    if not cert_id:
        hash_seed = f"{user_name}_{issue_date_str}_{streak_days}"
        cert_id = f"HT-CERT-{hashlib.sha256(hash_seed.encode()).hexdigest()[:10].upper()}"

    clean_name = (user_name or "Campus Legend").strip()

    width, height = 1600, 1130
    img = Image.new("RGB", (width, height), "#FCFBF7")
    draw = ImageDraw.Draw(img)

    # 1. Ornate Multi-Tier Gold Borders
    draw.rectangle([32, 32, width - 32, height - 32], outline="#92400E", width=7)
    draw.rectangle([46, 46, width - 46, height - 46], outline="#F59E0B", width=2)
    draw.rectangle([54, 54, width - 54, height - 54], outline="#D97706", width=1)

    # Inner dotted border
    step = 16
    for x in range(65, width - 65, step):
        draw.line([(x, 65), (min(x + 8, width - 65), 65)], fill="#B45309", width=1)
        draw.line([(x, height - 65), (min(x + 8, width - 65), height - 65)], fill="#B45309", width=1)
    for y in range(65, height - 65, step):
        draw.line([(65, y), (65, min(y + 8, height - 65))], fill="#B45309", width=1)
        draw.line([(width - 65, y), (width - 65, min(y + 8, height - 65))], fill="#B45309", width=1)

    # 2. Gold Official Seal Stamp (Concentric Rings)
    cx, cy = width // 2, 175
    draw.ellipse([cx - 52, cy - 52, cx + 52, cy + 52], outline="#D97706", width=4)
    draw.ellipse([cx - 44, cy - 44, cx + 44, cy + 44], outline="#F59E0B", width=2)
    seal_font = _get_font(18, bold=True)
    if seal_font:
        draw.text((cx - 14, cy - 20), "★", fill="#D97706", font=_get_font(28, bold=True))
        draw.text((cx - 24, cy + 10), "SEAL", fill="#92400E", font=_get_font(12, bold=True))

    # 3. Protocol Header
    font_sub = _get_font(15, bold=True)
    draw.text((width // 2, 260), "HABITTWIN DIGITAL FUTURE PROTOCOL", fill="#B45309", font=font_sub, anchor="mm")

    # 4. Title
    font_title = _get_font(42, bold=True)
    draw.text((width // 2, 315), "CERTIFICATE OF GENUINE APPRECIATION", fill="#1E1B4B", font=font_title, anchor="mm")

    # 5. Milestone Subtitle
    font_reason = _get_font(17, bold=False)
    draw.text(
        (width // 2, 370),
        f"Awarded in Honor of an Unbroken {streak_days}-Day Habit Consistency Streak",
        fill="#6B7280",
        font=font_reason,
        anchor="mm",
    )

    # 6. Recipient Banner
    font_to = _get_font(15, bold=True)
    draw.text((width // 2, 450), "PROUDLY PRESENTED TO", fill="#9CA3AF", font=font_to, anchor="mm")

    font_name = _get_font(46, bold=True)
    draw.text((width // 2, 515), clean_name, fill="#4338CA", font=font_name, anchor="mm")
    # Underline
    name_w = len(clean_name) * 24
    draw.line([(width // 2 - name_w // 2, 545), (width // 2 + name_w // 2, 545)], fill="#F59E0B", width=3)

    # 7. Official Citation Text
    font_body = _get_font(17, bold=False)
    citation_lines = [
        f"For demonstrating extraordinary grit, successfully conquering daily fatigue & late-night screen binging,",
        f"prioritizing restorative prefrontal sleep, and maintaining unbroken daily habit logging for an entire",
        f"six consecutive months ({streak_days} days). Awarded alongside the official HabitTwin Stainless Water Bottle.",
        f"100% Certified Built Different • Verified by the Digital Twin Engine.",
    ]
    cur_y = 610
    for line in citation_lines:
        draw.text((width // 2, cur_y), line, fill="#374151", font=font_body, anchor="mm")
        cur_y += 32

    # 8. Signatures & Verification Strip
    line_y = 860
    # Left Signature
    draw.line([(220, line_y), (520, line_y)], fill="#9CA3AF", width=1)
    font_sig = _get_font(18, bold=True)
    font_sig_sub = _get_font(12, bold=False)
    draw.text((370, line_y - 28), "Your Digital Future Self", fill="#1F2937", font=font_sig, anchor="mm")
    draw.text((370, line_y + 20), "HABITTWIN PROTOCOL", fill="#9CA3AF", font=font_sig_sub, anchor="mm")

    # Center Verification ID
    draw.text((width // 2, line_y - 12), f"VERIFICATION ID: {cert_id}", fill="#B45309", font=_get_font(13, bold=True), anchor="mm")
    draw.text((width // 2, line_y + 12), "Tamper-Proof Digital Verification", fill="#9CA3AF", font=_get_font(11, bold=False), anchor="mm")

    # Right Signature / Date
    draw.line([(width - 520, line_y), (width - 220, line_y)], fill="#9CA3AF", width=1)
    draw.text((width - 370, line_y - 28), issue_date_str, fill="#1F2937", font=font_sig, anchor="mm")
    draw.text((width - 370, line_y + 20), "OFFICIAL DATE OF ISSUE", fill="#9CA3AF", font=font_sig_sub, anchor="mm")

    # Footer note
    draw.text(
        (width // 2, height - 90),
        "HabitTwin Lifestyle Architecture • Certified Authentic Student Milestone",
        fill="#9CA3AF",
        font=_get_font(11, bold=False),
        anchor="mm",
    )

    # Save to in-memory PDF buffer
    pdf_buffer = io.BytesIO()
    img.save(pdf_buffer, format="PDF", resolution=150.0)
    pdf_bytes = pdf_buffer.getvalue()

    # Save local copy in certificates_generated/
    try:
        clean_filename = f"HabitTwin_Certificate_{clean_name.replace(' ', '_')}_{cert_id}.pdf"
        local_path = os.path.join(CERTIFICATES_DIR, clean_filename)
        with open(local_path, "wb") as f:
            f.write(pdf_bytes)
    except Exception:
        pass

    return pdf_bytes


def send_certificate_email(
    user_email: str,
    user_name: str,
    streak_days: int = 180,
    cert_id: Optional[str] = None,
    is_test: bool = False,
) -> Dict[str, Any]:
    """
    Generates the certificate PDF and delivers it as an email attachment.
    Supports:
    1. Resend API (if RESEND_API_KEY environment variable is present)
    2. SMTP (if SMTP_HOST environment variable is present)
    3. Simulated delivery (saves to certificates_generated/ with preview file when keys not set)
    """
    clean_email = str(user_email).strip().lower()
    clean_name = (user_name or "Explorer").strip()
    issue_date_str = datetime.now().strftime("%B %d, %Y")

    if not cert_id:
        hash_seed = f"{clean_name}_{clean_email}_{streak_days}_{time.time()}"
        cert_id = f"HT-CERT-{hashlib.sha256(hash_seed.encode()).hexdigest()[:10].upper()}"

    # Generate the official PDF bytes
    pdf_bytes = generate_certificate_pdf(
        user_name=clean_name,
        issue_date_str=issue_date_str,
        streak_days=streak_days,
        cert_id=cert_id,
    )
    pdf_filename = f"HabitTwin_Certificate_{clean_name.replace(' ', '_')}.pdf"

    # HTML Email Template
    email_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your 6-Month Habit Certificate</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .header {{ background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%); padding: 36px 28px; text-align: center; color: #ffffff; }}
        .seal {{ font-size: 48px; margin-bottom: 8px; }}
        .title {{ font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }}
        .subtitle {{ font-size: 13px; opacity: 0.9; margin-top: 6px; }}
        .content {{ padding: 32px 28px; font-size: 14px; line-height: 1.6; color: #334155; }}
        .pill {{ display: inline-block; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; font-weight: 700; font-size: 12px; padding: 4px 12px; rounded-full: 9999px; border-radius: 20px; margin-bottom: 16px; }}
        .reward-box {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0; }}
        .reward-item {{ margin-bottom: 8px; font-weight: 600; font-size: 13px; }}
        .btn {{ display: inline-block; background: #4f46e5; color: #ffffff !important; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 12px; margin-top: 12px; }}
        .footer {{ padding: 20px 28px; background: #f1f5f9; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="seal">🏆</div>
          <h1 class="title">Official Certificate Awarded!</h1>
          <div class="subtitle">HabitTwin Digital Future Protocol • {streak_days} Consecutive Days Logged</div>
        </div>

        <div class="content">
          <span class="pill">✓ 6-Month Discipline Milestone</span>
          <p>Hi <strong>{clean_name}</strong>,</p>
          <p>
            You did it. Showing up every single day for <strong>six consecutive months ({streak_days} days)</strong> is an extraordinary achievement that less than 1% of students accomplish.
          </p>
          <p>
            Attached to this email is your official, high-resolution <strong>Certificate of Genuine Appreciation</strong> (Verification ID: <code>{cert_id}</code>).
          </p>

          <div class="reward-box">
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 10px; color: #0f172a;">
              🎁 Your 6-Month Milestone Goodies:
            </div>
            <div class="reward-item">📜 <strong>Official Certificate</strong> (Attached as PDF)</div>
            <div class="reward-item">💧 <strong>HabitTwin Stainless Steel Water Bottle</strong> (750ml Vacuum-Insulated Flask)</div>
            <div class="reward-item">🎟️ <strong>Campus Swag Voucher:</strong> <code>HT-BOTTLE-6MONTHS</code></div>
          </div>

          <p>
            Keep this PDF for your portfolio, LinkedIn, or print it out as permanent proof that you are built different.
          </p>
        </div>

        <div class="footer">
          HabitTwin Campus Protocol • Dispatched to {clean_email}<br>
          Verification ID: {cert_id} • Date: {issue_date_str}
        </div>
      </div>
    </body>
    </html>
    """

    resend_api_key = os.getenv("RESEND_API_KEY")
    smtp_host = os.getenv("SMTP_HOST")

    # 1. Dispatch via Resend API if key is present
    if resend_api_key:
        try:
            import httpx
            headers = {
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json",
            }
            resend_payload = {
                "from": os.getenv("RESEND_FROM", "HabitTwin Awards <onboarding@resend.dev>"),
                "to": [clean_email],
                "subject": f"🏆 Official Certificate: You achieved a {streak_days}-Day Streak on HabitTwin!",
                "html": email_html,
                "attachments": [
                    {
                        "filename": pdf_filename,
                        "content": base64.b64encode(pdf_bytes).decode("utf-8"),
                    }
                ],
            }
            res = httpx.post("https://api.resend.com/emails", json=resend_payload, headers=headers, timeout=15.0)
            if res.status_code in [200, 201]:
                return {
                    "success": True,
                    "status": "sent",
                    "channel": "resend",
                    "recipient": clean_email,
                    "cert_id": cert_id,
                    "message": f"Official Certificate successfully emailed to {clean_email} via Resend!",
                }
            else:
                print(f"[Resend Error] {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[Resend Dispatch Failed] {e}")

    # 2. Dispatch via SMTP if SMTP credentials are provided
    if smtp_host:
        try:
            smtp_port = int(os.getenv("SMTP_PORT", 587))
            smtp_user = os.getenv("SMTP_USER")
            smtp_pass = os.getenv("SMTP_PASSWORD")
            smtp_from = os.getenv("SMTP_FROM", smtp_user or "awards@habittwin.com")

            msg = MIMEMultipart("mixed")
            msg["Subject"] = f"🏆 Official Certificate: You achieved a {streak_days}-Day Streak on HabitTwin!"
            msg["From"] = smtp_from
            msg["To"] = clean_email

            msg.attach(MIMEText(email_html, "html"))

            att = MIMEApplication(pdf_bytes, _subtype="pdf")
            att.add_header("Content-Disposition", "attachment", filename=pdf_filename)
            msg.attach(att)

            with smtplib.SMTP(smtp_host, smtp_port, timeout=12.0) as server:
                server.starttls()
                if smtp_user and smtp_pass:
                    server.login(smtp_user, smtp_pass)
                server.send_message(msg)

            return {
                "success": True,
                "status": "sent",
                "channel": "smtp",
                "recipient": clean_email,
                "cert_id": cert_id,
                "message": f"Official Certificate successfully emailed to {clean_email} via SMTP!",
            }
        except Exception as e:
            print(f"[SMTP Dispatch Failed] {e}")

    # 3. Simulated Delivery Mode (Saved locally & ready for credentials)
    # Saves an .eml preview file
    try:
        eml_filename = f"Certificate_Email_{clean_name.replace(' ', '_')}_{cert_id}.eml"
        eml_path = os.path.join(CERTIFICATES_DIR, eml_filename)
        with open(eml_path, "w", encoding="utf-8") as f:
            f.write(f"To: {clean_email}\nSubject: 🏆 Official Certificate: {streak_days}-Day Streak\n\n{email_html}")
    except Exception:
        pass

    return {
        "success": True,
        "status": "simulated_sent",
        "channel": "local_simulation",
        "recipient": clean_email,
        "cert_id": cert_id,
        "pdf_saved_at": os.path.join("backend", "certificates_generated", pdf_filename),
        "message": (
            f"Certificate generated for {clean_name} and saved to backend/certificates_generated/! "
            "To send live emails directly to inboxes, add RESEND_API_KEY or SMTP credentials in backend/.env."
        ),
    }
