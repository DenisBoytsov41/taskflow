from sqlalchemy.sql import text
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from loguru import logger
from app.database import SessionLocal
from app.routes import users, projects, tasks
from lib.utils.logger import setup_logging
from fastapi import FastAPI, HTTPException
from app.exception_handlers import (
    bad_request_handler, unauthorized_handler, forbidden_handler, 
    not_found_handler, internal_server_error_handler, integrity_error_handler
)
from sqlalchemy.exc import IntegrityError
from app.responses import internal_error_response
from app.database import get_db

setup_logging(level="DEBUG")

app = FastAPI(title="TaskFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users")
app.include_router(projects.router, prefix="/projects")
app.include_router(tasks.router, prefix="/tasks")
app.add_exception_handler(HTTPException, bad_request_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)
app.add_exception_handler(HTTPException, unauthorized_handler)
app.add_exception_handler(HTTPException, forbidden_handler)
app.add_exception_handler(HTTPException, not_found_handler)
app.add_exception_handler(Exception, internal_server_error_handler)

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    logger.info("Проверка соединения с базой данных...")
    try:
        db.execute(text("SELECT 1")) 
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Ошибка проверки здоровья: {str(e)}")
        return internal_error_response("Ошибка проверки соединения с базой данных")
