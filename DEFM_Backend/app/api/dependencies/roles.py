from fastapi import Depends, HTTPException
from app.api.dependencies.auth import get_current_user

def require_role(role: str):
    def checker(user = Depends(get_current_user)):
        if user.role != role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return checker
