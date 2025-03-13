import os
import requests
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.auth import get_db, create_access_token, authenticate_user, get_password_hash, get_current_user
from app.models import User
from app.responses import (
    success_response, created_response, bad_request_response, 
    unauthorized_response, not_found_response
)

router = APIRouter()

TELEGRAM_BOT_URL = os.getenv("TELEGRAM_BOT_URL", "http://telegram-bot:8001/send-message")


class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class SendMessageRequest(BaseModel):
    username: str
    message: str

class TokenRequest(BaseModel):
    token: str  # Теперь токен передаётся в теле запроса


@router.get("/")
def get_users(db: Session = Depends(get_db)):
    """Получение списка всех пользователей"""
    users = db.query(User).all()
    return success_response(
        data=[{"id": user.id, "username": user.username, "telegram_id": user.telegram_id} for user in users],
        message="Список пользователей"
    )


@router.post("/register", response_model=Token)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        return bad_request_response("Пользователь с таким именем уже существует")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(username=user_data.username, password_hash=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token({"sub": new_user.username})
    return created_response(
        {"access_token": access_token, "token_type": "bearer"},
        "Пользователь успешно зарегистрирован"
    )


@router.post("/login", response_model=Token)
def login_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Авторизация пользователя"""
    user = authenticate_user(db, user_data.username, user_data.password)
    if not user:
        return unauthorized_response()
    
    access_token = create_access_token({"sub": user.username})
    return success_response(
        {"access_token": access_token, "token_type": "bearer"},
        "Вход выполнен успешно"
    )


@router.delete("/{username}")
def delete_user(username: str, db: Session = Depends(get_db)):
    """Удаление пользователя"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return not_found_response("Пользователь не найден")
    
    db.delete(user)
    db.commit()
    return success_response({}, "Пользователь успешно удален")


@router.post("/subscribe")
def subscribe_telegram(data: dict, db: Session = Depends(get_db)):
    """Привязка Telegram к пользователю"""
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
    """Получение списка пользователей, у которых привязан Telegram"""
    users = db.query(User).filter(User.telegram_id.isnot(None)).all()
    return success_response(
        data=[{"id": user.id, "username": user.username, "telegram_id": user.telegram_id} for user in users],
        message="Список подписанных пользователей"
    )


@router.post("/me")
def get_current_user_info(token_data: TokenRequest, db: Session = Depends(get_db)):
    """Возвращает данные текущего авторизованного пользователя, принимает токен в теле запроса"""
    token = token_data.token
    current_user = get_current_user(db, token) 

    if not current_user:
        return not_found_response("Пользователь не найден")

    return success_response(
        data={
            "id": current_user.id,
            "username": current_user.username,
            "telegram_id": current_user.telegram_id
        },
        message="Данные пользователя"
    )


@router.post("/send-message")
def send_message_to_user(request: SendMessageRequest, db: Session = Depends(get_db)):
    """Отправка сообщения пользователю через Telegram-бота"""
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
