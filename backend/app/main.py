from fastapi import FastAPI
from lib.utils.logger import setup_logging
from app.routes import users, projects, tasks
from loguru import logger

setup_logging(level="DEBUG")

app = FastAPI(title="Project Management API")

app.include_router(users.router, prefix="/users")
app.include_router(projects.router, prefix="/projects")
app.include_router(tasks.router, prefix="/tasks")

@app.get("/health")
def health_check():
    logger.info("Health check route called")
    return {"status": "ok"}
