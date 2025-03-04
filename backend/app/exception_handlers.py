from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

def bad_request_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=400,
        content={
            "error": "Неверный запрос",
            "message": exc.detail,
            "code": 400
        },
    )

def unauthorized_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=401,
        content={
            "error": "Ошибка авторизации",
            "message": "Неверные учетные данные",
            "code": 401
        },
    )

def forbidden_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=403,
        content={
            "error": "Доступ запрещен",
            "message": exc.detail,
            "code": 403
        },
    )

def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Не найдено",
            "message": exc.detail,
            "code": 404
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
