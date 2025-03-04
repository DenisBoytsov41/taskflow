from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth import get_db, create_access_token, authenticate_user, get_password_hash
from app.models import User
from app.responses import success_response, created_response, bad_request_response, unauthorized_response, not_found_response
from app.exception_handlers import bad_request_handler, unauthorized_handler
from pydantic import BaseModel

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


@router.get("/users", response_model=dict, responses={
    200: {"description": "Успешное получение списка пользователей"},
    500: {"description": "Внутренняя ошибка сервера"},
})
def get_users(db: Session = Depends(get_db)):
    """
    Получение списка всех зарегистрированных пользователей.
    """
    try:
        users = db.query(User).all()
        return success_response(
            data=[{"id": user.id, "username": user.username} for user in users],
            message="Список зарегистрированных пользователей"
        )
    except Exception as e:
        return bad_request_handler(None, e)


@router.post("/register", response_model=Token, responses={
    201: {"description": "Пользователь успешно зарегистрирован"},
    400: {"description": "Пользователь с таким именем уже существует"},
    500: {"description": "Внутренняя ошибка сервера"},
})
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Регистрация нового пользователя.
    """
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        return bad_request_response("Пользователь с таким именем уже существует")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(username=user_data.username, password_hash=hashed_password)
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        return bad_request_handler(None, e)

    access_token = create_access_token({"sub": new_user.username})
    return created_response(
        {"access_token": access_token, "token_type": "bearer"},
        "Пользователь успешно зарегистрирован"
    )


@router.post("/login", response_model=Token, responses={
    200: {"description": "Вход выполнен успешно"},
    401: {"description": "Неверные учетные данные"},
    500: {"description": "Внутренняя ошибка сервера"},
})
def login_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Авторизация пользователя.
    """
    user = authenticate_user(db, user_data.username, user_data.password)
    if not user:
        return unauthorized_response()
    
    access_token = create_access_token({"sub": user.username})
    return success_response(
        {"access_token": access_token, "token_type": "bearer"},
        "Вход выполнен успешно"
    )
@router.delete("/{username}", responses={
    200: {"description": "Пользователь успешно удален"},
    404: {"description": "Пользователь не найден"},
    500: {"description": "Внутренняя ошибка сервера"},
})
def delete_user(username: str, db: Session = Depends(get_db)):
    """
    Удаление пользователя по имени пользователя.
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return not_found_response("Пользователь не найден")
    
    try:
        db.delete(user)
        db.commit()
        return success_response({}, "Пользователь успешно удален")
    except Exception as e:
        db.rollback()
        return bad_request_handler(None, e)