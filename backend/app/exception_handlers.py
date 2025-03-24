from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

def http_exception_handler(request: Request, exc: HTTPException):
    status = exc.status_code
    default_message = exc.detail

    message_map = {
        400: ("Неверный запрос", default_message),
        401: ("Ошибка авторизации", "Неверные учетные данные"),
        403: ("Доступ запрещен", default_message),
        404: ("Не найдено", default_message),
    }

    error, message = message_map.get(status, ("Ошибка", default_message))

    return JSONResponse(
        status_code=status,
        content={
            "error": error,
            "message": message,
            "code": status
        },
    )


def internal_server_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Внутренняя ошибка сервера",
            "message": str(exc),
            "code": 500
        },
    )


def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=400,
        content={
            "error": "Ошибка базы данных",
            "message": "Дублирующая запись или нарушение ограничения",
            "code": 400
        },
    )
