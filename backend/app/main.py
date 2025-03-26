from sqlalchemy.sql import text
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from loguru import logger
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.routes import tasks
from app.routes.users.router import router as users_router

from lib.utils.logger import setup_logging
from app.exception_handlers import (
    http_exception_handler,
    internal_server_error_handler,
    integrity_error_handler
)
from app.responses import internal_error_response
from app.scheduler import start_scheduler

setup_logging(level="DEBUG")

app = FastAPI(title="TaskFlow API")
start_scheduler()
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      
    allow_credentials=True,
    allow_methods=["*"],       
    allow_headers=["*"],   
)

app.include_router(users_router, prefix="/users")
app.include_router(tasks.router, prefix="/tasks")

print("\n📌 [FastAPI] Зарегистрированные маршруты:")
for route in app.routes:
    methods = ",".join(route.methods or [])
    print(f"  {methods:10} {route.path}")

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, internal_server_error_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    logger.info("Проверка соединения с базой данных...")
    try:
        db.execute(text("SELECT 1"))
        logger.debug("Соединение с базой данных установлено успешно")
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Ошибка при проверке соединения с БД: {str(e)}")
        return internal_error_response("Ошибка соединения с базой данных")
