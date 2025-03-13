import os
import requests
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.auth import get_db
from app.models import Task, User
from app.responses import success_response, created_response, not_found_response

router = APIRouter()

TELEGRAM_BOT_URL = os.getenv("TELEGRAM_BOT_URL", "http://telegram-bot:8001/send-message")

@router.get("/")
def get_tasks(db: Session = Depends(get_db)):
    """Получить список всех задач"""
    tasks = db.query(Task).all()
    return success_response(
        data=[{"id": task.id, "title": task.title, "status": task.status} for task in tasks],
        message="Список задач"
    )

@router.post("/")
def create_task(title: str, user_id: int, db: Session = Depends(get_db)):
    """Создать новую задачу"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return not_found_response("Пользователь не найден")

    task = Task(title=title, user_id=user_id)
    db.add(task)
    db.commit()
    db.refresh(task)

    if user.telegram_id:
        try:
            requests.post(TELEGRAM_BOT_URL, json={"chat_id": user.telegram_id, "message": f"📝 Новая задача: {title}"})
        except requests.RequestException as e:
            print(f"Ошибка при отправке уведомления: {e}")

    return created_response(
        data={"id": task.id, "title": task.title},
        message="Задача успешно создана"
    )

@router.put("/{task_id}/status")
def update_task_status(task_id: int, status: str, db: Session = Depends(get_db)):
    """Обновить статус задачи"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return not_found_response("Задача не найдена")

    task.status = status
    db.commit()

    if task.user.telegram_id:
        try:
            requests.post(TELEGRAM_BOT_URL, json={"chat_id": task.user.telegram_id, "message": f"✅ Задача обновлена: {task.title} → {status}"})
        except requests.RequestException as e:
            print(f"Ошибка при отправке уведомления: {e}")

    return success_response({}, "Статус задачи обновлен")
