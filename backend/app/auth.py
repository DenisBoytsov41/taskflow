from datetime import datetime, timedelta
from typing import Optional
import requests
import jwt as pyjwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, RefreshToken
import os
from loguru import logger 

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "superrefreshsecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return pyjwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire})
    return pyjwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        return pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Access Token истек")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Недействительный Access Token")

def decode_refresh_token(token: str):
    try:
        return pyjwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh Token истек")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Недействительный Refresh Token")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    username = payload.get("sub")

    if not username:
        raise HTTPException(status_code=401, detail="Токен некорректен")

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return user

def refresh_access_token(db: Session, username: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    refresh_token_entry = db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id,
        RefreshToken.expires_at > datetime.utcnow()
    ).first()

    if not refresh_token_entry:
        raise HTTPException(status_code=401, detail="Refresh Token отсутствует или истек. Требуется повторный вход.")

    new_access_token = create_access_token({"sub": user.username})

    return new_access_token

def restore_session(db: Session, username: str, client_ip: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        logger.warning(f"[restore_session] Пользователь {username} не найден в БД.")
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    token_entry = db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id
    ).first()

    if not token_entry:
        logger.warning(f"[restore_session] У пользователя {username} отсутствует Refresh Token в БД.")
        raise HTTPException(status_code=401, detail="Refresh Token отсутствует. Требуется повторный вход.")

    logger.info(f"[restore_session] Найден Refresh Token для пользователя {username}.")
    logger.info(f"[restore_session] Данные из БД: user_id={user.id}, username={user.username}, IP={client_ip}")

    if token_entry.ip_address != client_ip:
        logger.warning(f"[restore_session] Несовпадение IP: {token_entry.ip_address} (БД) vs {client_ip} (новый).")
        if user.telegram_id:
            send_telegram_alert(user, client_ip)
        raise HTTPException(status_code=403, detail="Вход с нового IP-адреса. Требуется повторный вход.")

    if token_entry.expires_at < datetime.utcnow():
        logger.warning(f"[restore_session] Refresh Token истек для пользователя {username}.")
        raise HTTPException(status_code=401, detail="Refresh Token истек. Требуется повторный вход.")

    logger.success(f"[restore_session] Сессия успешно восстановлена для пользователя {username}.")
    return create_access_token({"sub": user.username})

def send_telegram_alert(user: User, new_ip: str):
    message = f"Обнаружена попытка входа с нового IP: {new_ip}\nЕсли это не вы, срочно смените пароль!"
    payload = {"chat_id": user.telegram_id, "message": message}
    try:
        requests.post(os.getenv("TELEGRAM_BOT_URL", "http://telegram-bot:8001/send-message"), json=payload)
        logger.info(f"[send_telegram_alert] Оповещение отправлено пользователю {user.username}.")
    except Exception as e:
        logger.error(f"[send_telegram_alert] Ошибка отправки Telegram-оповещения: {e}")
