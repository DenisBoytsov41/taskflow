import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    client.delete("/users/testuser")     
    response = client.post("/users/register", json={"username": "testuser", "password": "testpass"})
    print(response.json())
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data["data"]
    assert data["message"] == "Пользователь успешно зарегистрирован"


def test_register_existing_user():
    client.post("/users/register", json={"username": "testuser", "password": "testpass"})
    response = client.post("/users/register", json={"username": "testuser", "password": "testpass"})
    assert response.status_code == 400
    assert response.json()["error"] == "Неверный запрос"

def test_login_user():
    client.post("/users/register", json={"username": "testuser", "password": "testpass"})
    response = client.post("/users/login", json={"username": "testuser", "password": "testpass"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["data"]
    assert data["message"] == "Вход выполнен успешно"

def test_login_invalid_user():
    response = client.post("/users/login", json={"username": "wronguser", "password": "wrongpass"})
    assert response.status_code == 401
    assert response.json()["error"] == "Ошибка авторизации"

def test_get_users():
    client.post("/users/register", json={"username": "testuser", "password": "testpass"})
    response = client.get("/users/users")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) > 0
    assert "testuser" in [user["username"] for user in data["data"]]
