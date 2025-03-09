import os
import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth import get_db, create_access_token, authenticate_user, get_password_hash
from app.models import User
from app.responses import success_response, created_response, bad_request_response, unauthorized_response, not_found_response
from pydantic import BaseModel

router = APIRouter()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


@router.get("/", response_model=dict)
def get_users(db: Session = Depends(get_db)):
    """Получение списка всех пользователей"""
    users = db.query(User).all()
    return success_response(
        data=[{"id": user.id, "username": user.username} for user in users],
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
def subscribe_telegram(username: str, telegram_id: str, db: Session = Depends(get_db)):
    """Привязка Telegram к пользователю"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return not_found_response("Пользователь не найден")

    user.telegram_id = telegram_id
    db.commit()

    return success_response({}, "Telegram успешно привязан")


@router.post("/send-message")
def send_telegram_message(username: str, message: str, db: Session = Depends(get_db)):
    """Отправка сообщения пользователю в Telegram"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return not_found_response("Пользователь не найден")

    if not user.telegram_id:
        return bad_request_response("У пользователя не привязан Telegram")

    payload = {
        "chat_id": user.telegram_id,
        "text": message
    }

    response = requests.post(TELEGRAM_API_URL, json=payload)
    
    if response.status_code == 200:
        return success_response({}, "Сообщение успешно отправлено")
    else:
        return bad_request_response("Ошибка при отправке сообщения")
