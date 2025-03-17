from datetime import datetime, timedelta
from typing import Optional
import jwt as pyjwt 
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
import os

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

def refresh_access_token(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Отсутствует Refresh Token")

    payload = decode_refresh_token(refresh_token)
    username = payload.get("sub")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    new_access_token = create_access_token({"sub": user.username})
    return {"access_token": new_access_token}
