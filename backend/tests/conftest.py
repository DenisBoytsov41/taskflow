import os
import base64
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from alembic.config import Config
from alembic import command
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

from app.database import get_db, Base
from app.main import app

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://test_user:test_password@db_test:5432/test_db")

engine = create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
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
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def client():
    return TestClient(app)


@pytest.fixture
def encrypt_password():
    def _encrypt_password(password: str) -> str:
        SECRET_KEY = os.getenv("ENCRYPTION_KEY", "thisisasecretkey").encode("utf-8")
        key = SECRET_KEY[:16] 
        iv = get_random_bytes(16)
        cipher = AES.new(key, AES.MODE_CBC, iv)

        pad_len = 16 - (len(password.encode("utf-8")) % 16)
        padded = password.encode("utf-8") + bytes([pad_len] * pad_len)

        encrypted = cipher.encrypt(padded)
        encrypted_data = iv + encrypted
        return base64.b64encode(encrypted_data).decode("utf-8")

    return _encrypt_password
