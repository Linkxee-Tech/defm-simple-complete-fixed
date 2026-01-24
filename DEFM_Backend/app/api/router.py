from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.services.initial_data import create_initial_data, get_user_by_username, verify_password
from app.api.endpoints import (
    auth_router,
    users_router,
    cases_router,
    evidence_router,
    chain_of_custody_router,
    reports_router,
    audit_logs_router,
    admin_router,
    dashboard_router,
    acquisition_router,
    search_router,
    bulk_router,
    notifications_router
)
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.core.config import settings

api_router = APIRouter()

# Ensure initial admin exists
create_initial_data()  # This will create admin user if not already present

# JWT settings
SECRET_KEY = settings.SECRET_KEY if hasattr(settings, "SECRET_KEY") else "mysecretkey123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@api_router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.warning(f"Login attempt: {form_data}")
    username = form_data.username
    password = form_data.password


    user = get_user_by_username(username)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value}
    )

    return {"access_token": access_token, "token_type": "bearer"}


# Include routers with prefixes
# api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(cases_router, prefix="/cases", tags=["cases"])
api_router.include_router(evidence_router, prefix="/evidence", tags=["evidence"])
api_router.include_router(chain_of_custody_router, prefix="/chain-of-custody", tags=["chain-of-custody"])
api_router.include_router(reports_router, prefix="/reports", tags=["reports"])
api_router.include_router(audit_logs_router, prefix="/audit-logs", tags=["audit-logs"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
api_router.include_router(dashboard_router, tags=["dashboard"])
api_router.include_router(acquisition_router, tags=["acquisition"])
api_router.include_router(search_router, tags=["search"])
api_router.include_router(bulk_router, tags=["bulk"])
api_router.include_router(notifications_router, tags=["notifications"])
