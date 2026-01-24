from sqlalchemy.orm import Session
from app.core.database import SessionLocal, create_tables
from app.models.models import User, UserRole
from app.core.security import get_password_hash
from passlib.context import CryptContext
import logging

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_initial_data():
    """Create initial data for the application after tables exist."""
    # Ensure tables are created first
    create_tables()

    db: Session = SessionLocal()
    try:
        # Skip if users already exist
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


# Helper functions for login
def get_user_by_username(username: str) -> User | None:
    db: Session = SessionLocal()
    try:
        return db.query(User).filter(User.username == username).first()
    finally:
        db.close()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
