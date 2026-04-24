from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.models.models import User
from app.services.audit_service import AuditService
import logging

# Use auto_error=False so we can return consistent 401 responses instead of
# default 403 from HTTPBearer when token/header is missing.
security = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)

# async def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     db: Session = Depends(get_db)
# ) -> User:
#     """Get current authenticated user."""
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
    
#     try:
#         # Extract token from credentials
#         token = credentials.credentials
#         username = verify_token(token)
        
#         if username is None:
#             raise credentials_exception
            
#     except Exception as e:
#         logger.error(f"Token verification failed: {str(e)}")
#         raise credentials_exception
    
#     # Get user from database
#     user = db.query(User).filter(User.username == username).first()
#     if user is None:
#         raise credentials_exception
        
#     if not user.is_active:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Inactive user"
#         )
    
#     return user

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if credentials is None or not credentials.credentials:
        logger.warning("Missing Authorization bearer token")
        raise credentials_exception

    try:
        token = credentials.credentials
        token_data = verify_token(token)
        if not token_data:
            raise credentials_exception
        username = token_data.get("sub")
        
        if username is None:
            logger.warning(f"Token decoded but username not found: {token_data}")
            raise credentials_exception
            
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        logger.warning(f"Token decoded but username not found: {token_data}")
        raise credentials_exception
        
    if not user.is_active:
        logger.warning("User not active")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role."""
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def require_admin_or_manager(current_user: User = Depends(get_current_user)) -> User:
    """Require admin or manager role."""
    if current_user.role.value not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def get_audit_service(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> AuditService:
    """Get audit service with current user context."""
    return AuditService(db, current_user)
