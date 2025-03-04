import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from alembic.config import Config
from alembic import command
from app.database import get_db, Base
from app.main import app

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://test_user:test_password@db_test:5432/test_db")

engine = create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    """Создаёт новую тестовую БД и применяет миграции Alembic."""

    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", DATABASE_URL)

    command.upgrade(alembic_cfg, "head")

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

def override_get_db():
    """Переопределяем зависимость FastAPI для работы с тестовой БД."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def client():
    """Тестовый клиент FastAPI."""
    return TestClient(app)
