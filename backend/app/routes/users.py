import os
import requests
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.auth import (
    get_db, get_password_hash, create_access_token,
    create_refresh_token, verify_password, decode_refresh_token, get_current_user
)
from app.models import User, RefreshToken
from app.responses import (
    success_response, created_response, bad_request_response,
    unauthorized_response, not_found_response
)

router = APIRouter()
TELEGRAM_BOT_URL = os.getenv("TELEGRAM_BOT_URL", "http://telegram-bot:8001/send-message")

class UserCreate(BaseModel):
    username: str = Field(..., min_length=4, max_length=50, pattern="^[a-zA-Z0-9_]+$")
    password: str = Field(..., min_length=6, max_length=100)

class Token(BaseModel):
    access_token: str
    token_type: str

class SendMessageRequest(BaseModel):
    username: str
    message: str

@router.get("/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return success_response(
        data=[{"id": user.id, "username": user.username, "telegram_id": user.telegram_id} for user in users],
        message="Список пользователей"
    )

@router.post("/register")
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    hashed_password = get_password_hash(user_data.password)
    new_user = User(username=user_data.username, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token({"sub": new_user.username})
    refresh_token = create_refresh_token({"sub": new_user.username})
    expires_at = datetime.utcnow() + timedelta(days=7)

    db.add(RefreshToken(user_id=new_user.id, token=refresh_token, expires_at=expires_at))
    db.commit()

    return created_response(
        {"access_token": access_token, "token_type": "bearer"},
        "Пользователь зарегистрирован"
    )


@router.post("/login")
def login_user(user_data: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")

    access_token = create_access_token({"sub": user.username})
    refresh_token = create_refresh_token({"sub": user.username})
    expires_at = datetime.utcnow() + timedelta(days=7)

    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).delete()
    db.add(RefreshToken(user_id=user.id, token=refresh_token, expires_at=expires_at))
    db.commit()

    return success_response(
        {"access_token": access_token, "token_type": "bearer"},
        "Вход выполнен успешно"
    )


@router.post("/refresh")
async def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    data = await request.json()
    refresh_token = data.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Отсутствует Refresh Token")

    try:
        payload = decode_refresh_token(refresh_token)
        username = payload.get("sub")
    except HTTPException:
        raise HTTPException(status_code=401, detail="Недействительный Refresh Token. Требуется повторный вход.")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    stored_token = db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id, RefreshToken.token == refresh_token
    ).first()

    if not stored_token or stored_token.expires_at < datetime.utcnow():
        db.query(RefreshToken).filter(RefreshToken.user_id == user.id).delete()
        db.commit()
        raise HTTPException(status_code=401, detail="Refresh Token истек или недействителен. Требуется повторный вход.")

    new_access_token = create_access_token({"sub": user.username})
    return success_response({"access_token": new_access_token, "token_type": "bearer"}, "Access Token обновлен")

@router.post("/logout")
def logout_user(request: Request, db: Session = Depends(get_db)):
    data = request.json()
    username = data.get("username") 

    if not username:
        raise HTTPException(status_code=400, detail="Отсутствует имя пользователя")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).delete()
    db.commit()

    return success_response({}, "Выход выполнен успешно")




@router.delete("/{username}")
def delete_user(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return not_found_response("Пользователь не найден")
    
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).delete()
    db.delete(user)
    db.commit()
    
    return success_response({}, "Пользователь успешно удален")

@router.post("/subscribe")
def subscribe_telegram(data: dict, db: Session = Depends(get_db)):
    username = data.get("username")
    telegram_id = data.get("telegram_id")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        return not_found_response("Пользователь не найден")

    user.telegram_id = telegram_id
    db.commit()

    return success_response({}, "Telegram успешно привязан")

@router.get("/subscribed-users")
def get_subscribed_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.telegram_id.isnot(None)).all()
    return success_response(
        data=[{"id": user.id, "username": user.username, "telegram_id": user.telegram_id} for user in users],
        message="Список подписанных пользователей"
    )

@router.post("/me")
def get_current_user_info(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return success_response(
        data={"id": user.id, "username": user.username, "telegram_id": user.telegram_id},
        message="Данные пользователя"
    )

@router.post("/send-message")
def send_message_to_user(request: SendMessageRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        return not_found_response("Пользователь не найден")

    if not user.telegram_id:
        return bad_request_response("У пользователя не привязан Telegram")

    payload = {"chat_id": user.telegram_id, "message": request.message}
    response = requests.post(TELEGRAM_BOT_URL, json=payload)

    if response.status_code == 200:
        return success_response({}, "Сообщение успешно отправлено")
    else:
        return bad_request_response(f"Ошибка при отправке сообщения: {response.text}")