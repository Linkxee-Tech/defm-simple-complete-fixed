from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import User, UserRole
from app.schemas.schemas import User as UserSchema, UserCreate, UserUpdate
from app.core.security import get_password_hash
from app.api.dependencies import get_current_user, require_admin
from app.services.audit_service import AuditService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user

@router.get("/", response_model=List[UserSchema])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all users (admin only)."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserSchema)
async def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user by ID."""
    # Users can only see their own profile unless they're admin
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/", response_model=UserSchema)
async def create_user(
    user_create: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    audit_service: AuditService = Depends()
):
    """Create new user (admin only)."""
    # Check if username already exists
    db_user = db.query(User).filter(User.username == user_create.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    db_user = db.query(User).filter(User.email == user_create.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    db_user = User(
        username=user_create.username,
        email=user_create.email,
        full_name=user_create.full_name,
        hashed_password=get_password_hash(user_create.password),
        role=user_create.role,
        is_active=user_create.is_active
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Log the action
    await audit_service.log_action(
        action="user_created",
        entity_type="user",
        entity_id=db_user.id,
        details=f"Created user: {db_user.username} ({db_user.role.value})"
    )
    
    logger.info(f"User created: {db_user.username} by {current_user.username}")
    return db_user

@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_service: AuditService = Depends()
):
    """Update user."""
    # Users can only update their own profile unless they're admin
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    
    # Log the action
    await audit_service.log_action(
        action="user_updated",
        entity_type="user",
        entity_id=db_user.id,
        details=f"Updated user: {db_user.username}"
    )
    
    logger.info(f"User updated: {db_user.username} by {current_user.username}")
    return db_user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    audit_service: AuditService = Depends()
):
    """Delete user (admin only)."""
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deletion
    if db_user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    username = db_user.username
    db.delete(db_user)
    db.commit()
    
    # Log the action
    await audit_service.log_action(
        action="user_deleted",
        entity_type="user",
        entity_id=user_id,
        details=f"Deleted user: {username}"
    )
    
    logger.info(f"User deleted: {username} by {current_user.username}")
    return {"message": "User deleted successfully"}