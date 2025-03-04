from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from loguru import logger
from app.database import SessionLocal
from app.routes import users, projects, tasks
from lib.utils.logger import setup_logging

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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    logger.info("Checking database connection...")
    return {"status": "ok"}
