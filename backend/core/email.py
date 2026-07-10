from email.message import EmailMessage
import aiosmtplib
from core.config import settings

async def send_email(
    subject: str,
    recipients: list[str],
    body: str,
    attachments: list[dict] = None  # [{"filename": "x.jpg", "content": bytes}]
) -> None:
    # Guard: skip if SMTP is not configured
    if not settings.SMTP_HOST:
        print("Email alert skipped: SMTP_HOST not configured.")
        return

    message = EmailMessage()
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = recipients
    message["Subject"] = subject
    message.set_content(body)

    if attachments:
        for attachment in attachments:
            if attachment.get("content"):
                message.add_attachment(
                    attachment["content"],
                    maintype="image",
                    subtype="jpeg",
                    filename=attachment["filename"]
                )

    smtp = aiosmtplib.SMTP(
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        use_tls=settings.SMTP_PORT == 465,
        start_tls=settings.SMTP_PORT == 587,
    )
    
    try:
        await smtp.connect()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            await smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        await smtp.send_message(message)
    except Exception as e:
        print(f"Failed to send email: {e}")
    finally:
        try:
            await smtp.quit()
        except Exception:
            pass

