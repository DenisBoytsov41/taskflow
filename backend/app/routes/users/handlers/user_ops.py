from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth import get_db, get_current_user
from app.models import User, RefreshToken
from app.responses import success_response, not_found_response
from ..schemas import Token

router = APIRouter()

@router.get("/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return success_response(
        data=[
            {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "telegram_id": user.telegram_id,
                "avatar_url": user.avatar_url
            }
            for user in users
        ],
        message="Список пользователей"
    )


@router.delete("/{username}")
def delete_user(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return not_found_response("Пользователь не найден")

    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).delete()
    db.delete(user)
    db.commit()

    return success_response({}, "Пользователь успешно удален")

@router.post("/me")
def get_current_user_info(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return success_response(
        data={"id": user.id, "username": user.username, "telegram_id": user.telegram_id},
        message="Данные пользователя"
    )
