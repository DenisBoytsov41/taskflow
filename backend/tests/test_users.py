import pytest


def test_print_routes(client):
    print("\n📋 Available routes:")
    for route in client.app.routes:
        if hasattr(route, "methods"):
            print(f"{','.join(route.methods):<10} {route.path}")


def test_register_user(client, encrypt_password):
    encrypted = encrypt_password("testpass")
    client.delete("/users/testuser")
    response = client.post("/users/register", json={"username": "testuser", "password": encrypted})
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data["data"]
    assert "Пользователь" in data["message"]


def test_register_existing_user(client, encrypt_password):
    encrypted = encrypt_password("testpass")
    client.post("/users/register", json={"username": "testuser", "password": encrypted})
    response = client.post("/users/register", json={"username": "testuser", "password": encrypted})
    assert response.status_code == 400
    data = response.json()
    assert data.get("error") == "Неверный запрос"
    assert data.get("message") == "Пользователь уже существует"


def test_login_user(client, encrypt_password):
    encrypted = encrypt_password("testpass")
    client.post("/users/register", json={"username": "testuser", "password": encrypted})
    response = client.post("/users/login", json={"username": "testuser", "password": encrypted})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["data"]
    assert "Вход" in data["message"]


def test_login_invalid_user(client, encrypt_password):
    encrypted = encrypt_password("wrongpass")
    response = client.post("/users/login", json={"username": "wronguser", "password": encrypted})
    assert response.status_code == 401 
    data = response.json()
    assert data.get("error") == "Ошибка авторизации"
    assert data.get("message") == "Неверные учетные данные"


def test_get_users(client, encrypt_password):
    encrypted = encrypt_password("testpass")
    client.post("/users/register", json={"username": "testuser", "password": encrypted})
    response = client.get("/users/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) > 0
    assert "testuser" in [user["username"] for user in data["data"]]


def test_refresh_token(client, encrypt_password):
    encrypted = encrypt_password("testpass")
    client.post("/users/register", json={"username": "testuser", "password": encrypted})
    response = client.post("/users/refresh", json={"username": "testuser"})
    assert response.status_code == 200
    assert "access_token" in response.json()["data"]


def test_restore_session(client, encrypt_password):
    encrypted = encrypt_password("testpass")
    client.post("/users/register", json={"username": "testuser", "password": encrypted})
    response = client.post("/users/restore-session", json={"username": "testuser"})
    assert response.status_code == 200
    assert "access_token" in response.json()["data"]


def test_logout_user(client, encrypt_password):
    encrypted = encrypt_password("testpass")
    client.post("/users/register", json={"username": "testuser", "password": encrypted})
    response = client.post("/users/logout", json={"username": "testuser"})
    assert response.status_code == 200
    assert "успешно" in response.json()["message"]


def test_subscribe_telegram(client, encrypt_password):
    encrypted = encrypt_password("testpass")
    client.post("/users/register", json={"username": "testuser", "password": encrypted})
    response = client.post("/users/subscribe", json={"username": "testuser", "telegram_id": "123456"})
    assert response.status_code == 200
    assert "успешно" in response.json()["message"]


def test_get_subscribed_users(client, encrypt_password):
    encrypted = encrypt_password("testpass")
    client.post("/users/register", json={"username": "testuser", "password": encrypted})
    client.post("/users/subscribe", json={"username": "testuser", "telegram_id": "123456"})
    response = client.get("/users/subscribed-users")
    assert response.status_code == 200
    data = response.json()
    assert any(user["username"] == "testuser" for user in data["data"])


def test_send_message_to_user(client, encrypt_password, monkeypatch):
    encrypted = encrypt_password("testpass")
    client.post("/users/register", json={"username": "testuser", "password": encrypted})
    client.post("/users/subscribe", json={"username": "testuser", "telegram_id": "123456"})

    class MockResponse:
        status_code = 200
        text = "ok"

    monkeypatch.setattr("requests.post", lambda *args, **kwargs: MockResponse())
    response = client.post("/users/send-message", json={"username": "testuser", "message": "hello!"})
    assert response.status_code == 200
    assert "успешно" in response.json()["message"]


def test_delete_user(client, encrypt_password):
    encrypted = encrypt_password("testpass")
    client.post("/users/register", json={"username": "testuser", "password": encrypted})
    response = client.delete("/users/testuser")
    assert response.status_code == 200
    assert "успешно" in response.json()["message"]


def test_delete_nonexistent_user(client):
    response = client.delete("/users/nonexistent")
    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "Не найдено"
    assert data["message"] == "Пользователь не найден"


def test_get_current_user_info(client, encrypt_password):
    encrypted = encrypt_password("testpass")
    client.post("/users/register", json={"username": "testuser", "password": encrypted})
    login_response = client.post("/users/login", json={"username": "testuser", "password": encrypted})
    assert login_response.status_code == 200, login_response.text
    access_token = login_response.json()["data"]["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}
    response = client.post("/users/me", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data["data"]["username"] == "testuser"
    assert data["message"] == "Данные пользователя"
