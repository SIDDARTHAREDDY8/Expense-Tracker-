import httpx
from urllib.parse import urlencode
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.auth.jwt import create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["OAuth"])

# ── GitHub ──────────────────────────────────────────────────────────────────

GITHUB_AUTH_URL  = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL  = "https://api.github.com/user"
GITHUB_EMAIL_URL = "https://api.github.com/user/emails"


@router.get("/github")
def github_login():
    if not settings.github_client_id or settings.github_client_id == "your_github_client_id_here":
        raise HTTPException(status_code=503, detail="GitHub OAuth not configured")
    url = f"{GITHUB_AUTH_URL}?client_id={settings.github_client_id}&scope=read:user,user:email"
    return RedirectResponse(url)


@router.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    if not settings.github_client_id or settings.github_client_id == "your_github_client_id_here":
        return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_not_configured")

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            GITHUB_TOKEN_URL,
            data={"client_id": settings.github_client_id, "client_secret": settings.github_client_secret, "code": code},
            headers={"Accept": "application/json"},
        )
        gh_token = token_res.json().get("access_token")
        if not gh_token:
            return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_failed")

        headers = {"Authorization": f"Bearer {gh_token}", "Accept": "application/json"}
        gh_user = (await client.get(GITHUB_USER_URL, headers=headers)).json()

        email = gh_user.get("email")
        if not email:
            emails = (await client.get(GITHUB_EMAIL_URL, headers=headers)).json()
            primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
            email = primary["email"] if primary else None

    if not email:
        return RedirectResponse(f"{settings.frontend_url}/login?error=no_email")

    return _upsert_oauth_user(
        db=db,
        provider="github",
        provider_id=str(gh_user["id"]),
        email=email,
        name=gh_user.get("name") or gh_user.get("login", ""),
        avatar=gh_user.get("avatar_url"),
        username_hint=gh_user.get("login", ""),
    )


# ── Google ──────────────────────────────────────────────────────────────────

GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_URL  = "https://www.googleapis.com/oauth2/v3/userinfo"


@router.get("/google")
def google_login():
    if not settings.google_client_id or settings.google_client_id == "your_google_client_id_here":
        raise HTTPException(status_code=503, detail="Google OAuth not configured")
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": f"{settings.backend_url}/api/v1/auth/google/callback",
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
    }
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{urlencode(params)}")


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    if not settings.google_client_id or settings.google_client_id == "your_google_client_id_here":
        return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_not_configured")

    redirect_uri = f"{settings.backend_url}/api/v1/auth/google/callback"

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_failed")

        user_info = (await client.get(GOOGLE_USER_URL, headers={"Authorization": f"Bearer {access_token}"})).json()

    email = user_info.get("email")
    if not email or not user_info.get("email_verified"):
        return RedirectResponse(f"{settings.frontend_url}/login?error=no_email")

    return _upsert_oauth_user(
        db=db,
        provider="google",
        provider_id=user_info["sub"],
        email=email,
        name=user_info.get("name", ""),
        avatar=user_info.get("picture"),
        username_hint=email.split("@")[0],
    )


# ── Shared upsert helper ────────────────────────────────────────────────────

def _upsert_oauth_user(db, provider, provider_id, email, name, avatar, username_hint):
    id_field = f"{provider}_id"

    user = db.query(User).filter(getattr(User, id_field) == provider_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            setattr(user, id_field, provider_id)
            user.avatar_url = avatar
        else:
            base = "".join(c for c in username_hint.lower() if c.isalnum() or c == "_") or "user"
            username, suffix = base, 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base}{suffix}"
                suffix += 1

            user = User(
                email=email,
                username=username,
                full_name=name,
                avatar_url=avatar,
                hashed_password=None,
                **{id_field: provider_id},
            )
            db.add(user)
    else:
        user.avatar_url = avatar

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?token={token}")
