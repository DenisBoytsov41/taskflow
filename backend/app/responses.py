from fastapi.responses import JSONResponse

def success_response(data: dict, message: str = "Операция выполнена успешно"):
    return JSONResponse(
        status_code=200,
        content={
            "code": 200,
            "message": message,
            "data": data
        },
    )

def created_response(data: dict, message: str = "Успешно создано"):
    return JSONResponse(
        status_code=201,
        content={
            "code": 201,
            "message": message,
            "data": data
        },
    )

def deleted_response(message: str = "Успешно удалено"):
    return JSONResponse(
        status_code=200,
        content={
            "code": 200,
            "message": message
        },
    )

def bad_request_response(message: str = "Некорректный запрос"):
    return JSONResponse(
        status_code=400,
        content={
            "code": 400,
            "error": "Неверный запрос",
            "message": message
        },
    )

def unauthorized_response():
    return JSONResponse(
        status_code=401,
        content={
            "code": 401,
            "error": "Ошибка авторизации",
            "message": "Неверные учетные данные"
        },
    )

def forbidden_response():
    return JSONResponse(
        status_code=403,
        content={
            "code": 403,
            "error": "Доступ запрещен",
            "message": "У вас нет прав для выполнения данного действия"
        },
    )

def not_found_response(message: str = "Запрашиваемый ресурс не найден"):
    return JSONResponse(
        status_code=404,
        content={
            "code": 404,
            "error": "Не найдено",
            "message": message
        },
    )

def internal_server_error_response():
    return JSONResponse(
        status_code=500,
        content={
            "code": 500,
            "error": "Внутренняя ошибка сервера",
            "message": "Произошла непредвиденная ошибка"
        },
    )
def internal_error_response(message: str = "Внутренняя ошибка сервера"):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Ошибка сервера", 
            "message": message
        },
    )