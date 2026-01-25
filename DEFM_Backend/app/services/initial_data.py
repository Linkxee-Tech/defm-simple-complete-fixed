from sqlalchemy.orm import Session
from app.core.database import SessionLocal, create_tables
from app.models.models import User, UserRole
from app.core.security import get_password_hash, verify_password
import logging

logger = logging.getLogger(__name__)


def create_initial_data():
    """Create initial data for the application after tables exist."""
    create_tables()
    db: Session = SessionLocal()
    try:
        if db.query(User).count() > 0:
            logger.info("Initial users already exist, skipping creation")
            return

        users_data = [
            {"username": "admin", "password": "admin123", "full_name": "System Administrator",
             "role": UserRole.admin, "email": "admin@defm.com"},
            {"username": "investigator1", "password": "inv111", "full_name": "Solomon John",
             "role": UserRole.investigator, "email": "solomon.john@defm.com"},
            {"username": "investigator2", "password": "inv122", "full_name": "Ahmad Lawal",
             "role": UserRole.investigator, "email": "ahmad.lawal@defm.com"},
            {"username": "investigator3", "password": "inv133", "full_name": "Mike Davis",
             "role": UserRole.investigator, "email": "mike.davis@defm.com"},
            {"username": "manager", "password": "mgr123", "full_name": "Ibrahim Isa",
             "role": UserRole.manager, "email": "ibrahim.isa@defm.com"}
        ]

        for u in users_data:
            user = User(
                username=u["username"],
                email=u["email"],
                full_name=u["full_name"],
                hashed_password=get_password_hash(u["password"]),
                role=u["role"],
                is_active=True
            )
            db.add(user)
        db.commit()
        logger.info("Initial users created successfully.")
    except Exception as e:
        logger.error(f"Failed to create initial data: {str(e)}")
        db.rollback()
    finally:
        db.close()


def get_user_by_username(username: str) -> dict | None:
    """Get user by username and return as dict to avoid detached ORM issues."""
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return None
        return {
            "id": user.id,
            "username": user.username,
            "hashed_password": user.hashed_password,
            "role": user.role.value if user.role else None,
            "is_active": user.is_active
        }
    finally:
        db.close()


def authenticate_user(username: str, password: str) -> dict | None:
    """Verify username/password inside DB session to avoid detached object issues."""
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return {
            "id": user.id,
            "username": user.username,
            "role": user.role.value if user.role else None,
            "is_active": user.is_active
        }
    finally:
        db.close()
