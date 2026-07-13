from datetime import datetime, timedelta, timezone
import secrets


def create_access_token(subject: str, expires_minutes: int = 60) -> dict[str, str]:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    return {
        "access_token": f"brk_{secrets.token_urlsafe(32)}",
        "token_type": "bearer",
        "subject": subject,
        "expires_at": expires_at.isoformat(),
    }
