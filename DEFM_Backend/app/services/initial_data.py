from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import User, UserRole
from app.core.security import get_password_hash
import logging

logger = logging.getLogger(__name__)

def create_initial_data():
    """Create initial data for the application."""
    db: Session = SessionLocal()
    
    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            logger.info("Initial users already exist, skipping creation")
            return
        
        # Create initial users (matching frontend data)
        users_data = [
            {
                "username": "admin",
                "password": "admin123",
                "full_name": "System Administrator",
                "role": UserRole.admin,
                "email": "admin@defm.com"
            },
            {
                "username": "investigator1",
                "password": "inv111",
                "full_name": "Solomon John",
                "role": UserRole.investigator,
                "email": "solomon.john@defm.com"
            },
            {
                "username": "investigator2",
                "password": "inv122",
                "full_name": "Ahmad Lawal",
                "role": UserRole.investigator,
                "email": "ahmad.lawal@defm.com"
            },
            {
                "username": "investigator3",
                "password": "inv133",
                "full_name": "Mike Davis",
                "role": UserRole.investigator,
                "email": "mike.davis@defm.com"
            },
            {
                "username": "manager",
                "password": "mgr123",
                "full_name": "Ibrahim Isa",
                "role": UserRole.manager,
                "email": "ibrahim.isa@defm.com"
            }
        ]
        
        created_users = []
        for user_data in users_data:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"],
                is_active=True
            )
            db.add(user)
            created_users.append(user_data["username"])
        
        db.commit()
        logger.info(f"Created initial users: {', '.join(created_users)}")
        
    except Exception as e:
        logger.error(f"Error creating initial data: {str(e)}")
        db.rollback()
    finally:
        db.close()