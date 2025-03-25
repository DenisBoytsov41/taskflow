from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from app.auth import get_db, get_current_user, get_password_hash
from app.models import User
from app.responses import (
    success_response,
    bad_request_response,
    deleted_response,
    internal_error_response
)
from app.utils.crypto import decrypt_password
from loguru import logger

router = APIRouter()


@router.get("/profile")
def get_profile(user: User = Depends(get_current_user)):
    try:
        return success_response({
            "username": user.username,
            "telegram_id": user.telegram_id,
            "full_name": user.full_name,
            "avatar": user.avatar_url
        }, "Профиль пользователя получен")
    except Exception as e:
        logger.error(f"[GET /profile] Ошибка: {e}")
        return internal_error_response("Не удалось получить профиль пользователя")


@router.patch("/update-fullname")
def update_full_name(data: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    full_name = data.get("full_name")
    if not full_name:
        return bad_request_response("Поле full_name обязательно")

    try:
        user.full_name = full_name
        db.commit()
        return success_response({}, "ФИО успешно обновлено")
    except Exception as e:
        logger.error(f"[PATCH /update-fullname] Ошибка: {e}")
        return internal_error_response("Не удалось обновить ФИО")


@router.patch("/update-avatar")
def update_avatar(data: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    avatar_base64 = data.get("avatar")
    if not avatar_base64:
        return bad_request_response("Поле avatar обязательно")

    try:
        user.avatar_url = avatar_base64
        db.commit()
        return success_response(
            {"avatar": user.avatar_url},
            "Аватар успешно обновлён"
        )
    except Exception as e:
        logger.error(f"[PATCH /update-avatar] Ошибка: {e}")
        return internal_error_response("Не удалось обновить аватар")


@router.patch("/change-password")
async def change_password(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        data = await request.json()
        encrypted_password = data.get("password")

        if not encrypted_password:
            return bad_request_response("Поле 'password' обязательно")

        try:
            decrypted_password = decrypt_password(encrypted_password)
        except Exception as e:
            logger.error(f"[change-password] Ошибка расшифровки пароля: {e}")
            return bad_request_response("Некорректный зашифрованный пароль")

        hashed_password = get_password_hash(decrypted_password)
        user.password_hash = hashed_password
        db.commit()

        logger.info(f"🔐 [change-password] Пароль пользователя {user.username} обновлён")
        return success_response({}, "Пароль успешно обновлён")

    except Exception as e:
        logger.error(f"[PATCH /change-password] Ошибка: {e}")
        return internal_error_response("Ошибка при смене пароля")


@router.delete("/delete-profile")
def delete_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        db.delete(user)
        db.commit()
        return deleted_response("Профиль успешно удален")
    except Exception as e:
        logger.error(f"[DELETE /delete-profile] Ошибка: {e}")
        return internal_error_response("Не удалось удалить профиль")
