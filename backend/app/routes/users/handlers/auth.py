import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from loguru import logger

from app.auth import (
    get_db, get_password_hash, create_access_token, create_refresh_token,
    verify_password, refresh_access_token, restore_session
)
from app.models import User, RefreshToken
from app.responses import success_response, created_response
from ..schemas import UserCreate
from app.utils.crypto import decrypt_password 

router = APIRouter()

@router.post("/register")
async def register_user(user_data: UserCreate, request: Request, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    try:
        decrypted_password = decrypt_password(user_data.password) 
    except Exception as e:
        logger.error(f"❌ Ошибка расшифровки пароля при регистрации: {str(e)}")
        raise HTTPException(status_code=400, detail="Некорректный зашифрованный пароль")

    hashed_password = get_password_hash(decrypted_password)
    new_user = User(username=user_data.username, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token({"sub": new_user.username})
    refresh_token = create_refresh_token({"sub": new_user.username})
    expires_at = datetime.utcnow() + timedelta(days=7)

    client_ip = request.client.host  
    db.add(RefreshToken(user_id=new_user.id, token=refresh_token, expires_at=expires_at, ip_address=client_ip))
    db.commit()

    logger.info(f"✅ [register] Пользователь {new_user.username} зарегистрирован с IP {client_ip}")

    return created_response(
        {"access_token": access_token, "token_type": "bearer"},
        "Пользователь зарегистрирован"
    )

@router.post("/login")
async def login_user(user_data: UserCreate, request: Request, db: Session = Depends(get_db)):
    try:
        decrypted_password = decrypt_password(user_data.password)  
    except Exception as e:
        logger.error(f"❌ Ошибка расшифровки пароля при входе: {str(e)}")
        raise HTTPException(status_code=400, detail="Некорректный зашифрованный пароль")

    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(decrypted_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")

    access_token = create_access_token({"sub": user.username})
    refresh_token = create_refresh_token({"sub": user.username})
    expires_at = datetime.utcnow() + timedelta(days=7)

    client_ip = request.client.host  

    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).delete()
    db.add(RefreshToken(user_id=user.id, token=refresh_token, expires_at=expires_at, ip_address=client_ip))
    db.commit()

    logger.info(f"🔓 [login] Пользователь {user.username} вошел в систему с IP {client_ip}")

    return success_response(
        {"access_token": access_token, "token_type": "bearer"},
        "Вход выполнен успешно"
    )

@router.post("/refresh")
async def refresh_token(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    username = data.get("username")

    if not username:
        raise HTTPException(status_code=400, detail="Необходимо передать username")

    new_access_token = refresh_access_token(db, username)

    return success_response(
        {"access_token": new_access_token, "token_type": "bearer"},
        "✅ Access Token успешно обновлен"
    )

@router.post("/restore-session")
async def restore_session_api(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    username = data.get("username")

    if not username:
        raise HTTPException(status_code=400, detail="❌ Необходимо передать username")

    client_ip = request.client.host

    new_access_token = restore_session(db, username, client_ip)

    return success_response(
        {"access_token": new_access_token, "token_type": "bearer"},
        "✅ Сессия успешно восстановлена"
    )

@router.post("/logout")
async def logout_user(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    username = data.get("username")

    if not username:
        raise HTTPException(status_code=400, detail="Отсутствует имя пользователя")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).delete()
    db.commit()

    return success_response({}, "Выход выполнен успешно")
