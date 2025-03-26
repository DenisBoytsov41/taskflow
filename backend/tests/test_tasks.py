import pytest
from datetime import datetime, timedelta


@pytest.fixture
def task_data():
    now = datetime.now()
    return {
        "title": "Test Task",
        "description": "Test Description",
        "start_time": now.isoformat(),
        "end_time": (now + timedelta(minutes=40)).isoformat(),
        "reminder_time": (now + timedelta(minutes=10)).isoformat(),
        "status": "К выполнению"
    }


def test_create_task(client, access_token, task_data):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = client.post("/tasks/", json=task_data, headers=headers)
    assert response.status_code == 200
    assert response.json()["data"]["title"] == task_data["title"]


def test_get_my_tasks(client, access_token, task_data):
    headers = {"Authorization": f"Bearer {access_token}"}
    client.post("/tasks/", json=task_data, headers=headers)
    response = client.get("/tasks/my", headers=headers)
    assert response.status_code == 200
    tasks = response.json()["data"]
    assert any(task["title"] == task_data["title"] for task in tasks)


def test_update_task(client, access_token, task_data):
    headers = {"Authorization": f"Bearer {access_token}"}
    created = client.post("/tasks/", json=task_data, headers=headers)
    task_id = created.json()["data"]["id"]

    response = client.put(f"/tasks/{task_id}", json={"status": "Завершено"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "Завершено"


def test_delete_task(client, access_token, task_data):
    headers = {"Authorization": f"Bearer {access_token}"}
    created = client.post("/tasks/", json=task_data, headers=headers)
    task_id = created.json()["data"]["id"]

    response = client.delete(f"/tasks/{task_id}", headers=headers)
    assert response.status_code == 200
    assert "удалена" in response.json()["message"]


def test_get_active_tasks(client, access_token, task_data):
    headers = {"Authorization": f"Bearer {access_token}"}
    client.post("/tasks/", json=task_data, headers=headers)
    response = client.get("/tasks/active", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)


def test_get_overdue_tasks(client, access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    now = datetime.now()
    overdue_task = {
        "title": "Overdue Task",
        "description": "Expired",
        "start_time": (now - timedelta(hours=2)).isoformat(),
        "end_time": (now - timedelta(hours=1)).isoformat(),
        "reminder_time": (now - timedelta(hours=1, minutes=30)).isoformat(),
        "status": "К выполнению"
    }
    client.post("/tasks/", json=overdue_task, headers=headers)
    response = client.get("/tasks/overdue", headers=headers)
    assert response.status_code == 200
    assert any(t["title"] == "Overdue Task" for t in response.json()["data"])


def test_get_expiring_tasks(client, access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    now = datetime.now()
    expiring_task = {
        "title": "Expiring Task",
        "description": "Almost due",
        "start_time": now.isoformat(),
        "end_time": (now + timedelta(minutes=20)).isoformat(),
        "reminder_time": (now + timedelta(minutes=10)).isoformat(),
        "status": "К выполнению"
    }
    client.post("/tasks/", json=expiring_task, headers=headers)
    response = client.get("/tasks/expiring", headers=headers)
    assert response.status_code == 200
    assert any(t["title"] == "Expiring Task" for t in response.json()["data"])
