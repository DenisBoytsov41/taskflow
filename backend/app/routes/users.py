import os
import time
import hashlib
import hmac
import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.auth import get_db, create_access_token, authenticate_user, get_password_hash
from app.models import User
from app.responses import success_response, created_response, bad_request_response, unauthorized_response, not_found_response
from pydantic import BaseModel

router = APIRouter()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


def verify_telegram_auth(data: dict) -> bool:
    """ Проверяем подпись данных от Telegram """
    auth_hash = data.pop("hash", None)
    sorted_params = "\n".join(f"{k}={v}" for k, v in sorted(data.items()))
    secret_key = hashlib.sha256(TELEGRAM_BOT_TOKEN.encode()).digest()
    calculated_hash = hmac.new(secret_key, sorted_params.encode(), hashlib.sha256).hexdigest()

    return auth_hash == calculated_hash and time.time() - int(data.get("auth_date", 0)) < 86400  # 24 часа


@router.get("/telegram-auth")
def telegram_auth(
    id: int = Query(...),
    first_name: str = Query(""),
    last_name: str = Query(""),
    username: str = Query(""),
    auth_date: int = Query(...),
    hash: str = Query(...),
    db: Session = Depends(get_db),
):
    """
    Авторизация через Telegram OAuth.
    После авторизации Telegram передает нам данные пользователя.
    """
    data = {
        "id": id,
        "first_name": first_name,
        "last_name": last_name,
        "username": username,
        "auth_date": auth_date,
        "hash": hash,
    }

    if not verify_telegram_auth(data):
        return bad_request_response("Ошибка верификации Telegram")

    user = db.query(User).filter(User.telegram_id == str(id)).first()

    if not user:
        user = db.query(User).filter(User.username == username).first()
        if user:
            user.telegram_id = str(id)
        else:
            user = User(username=username or f"tg_user_{id}", telegram_id=str(id))
            db.add(user)
        
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"sub": user.username})

    return success_response(
        {
            "access_token": access_token,
            "token_type": "bearer",
            "telegram_id": id,
            "first_name": first_name,
            "last_name": last_name,
            "username": username,
        },
        "Telegram авторизация успешна"
    )


@router.get("/", response_model=dict)
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
    url = f"{TELEGRAM_API_URL}/sendMessage"
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        return success_response({}, "Сообщение успешно отправлено")
    else:
        return bad_request_response("Ошибка при отправке сообщения")


@router.get("/get-telegram-user")
def get_telegram_user(telegram_id: str):
    """Получение информации о пользователе через Telegram API"""
    url = f"{TELEGRAM_API_URL}/getChat?chat_id={telegram_id}"
    response = requests.get(url)

    if response.status_code == 200:
        return success_response(response.json(), "Данные пользователя получены")
    else:
        return bad_request_response("Не удалось получить данные пользователя")
