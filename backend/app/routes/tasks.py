import os
import requests
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, TIMESTAMP
from sqlalchemy.sql import cast

from app.auth import get_db, get_current_user
from app.models import Task, User
from app.responses import (
    success_response, created_response, not_found_response, bad_request_response
)
from app.routes.schemas.task import TaskCreate, TaskUpdate, TaskOut
from app.utils.notifier import notify_users_about_expiring_tasks
from loguru import logger
from typing import List, Optional

router = APIRouter(tags=["tasks"])

TELEGRAM_BOT_URL = os.getenv("TELEGRAM_BOT_URL", "http://telegram-bot:8001/send-message")
MSK = timezone(timedelta(hours=3))


def now_utc():
    return datetime.now(timezone.utc)


def to_utc_from_local(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=MSK)
    return dt.astimezone(timezone.utc)


@router.post("/", response_model=TaskOut)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    task = Task(
        title=task_data.title,
        description=task_data.description,
        start_time=to_utc_from_local(task_data.start_time),
        end_time=to_utc_from_local(task_data.end_time),
        reminder_time=to_utc_from_local(task_data.reminder_time),
        status=task_data.status,
        creator_id=user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    updates: TaskUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id, Task.creator_id == user.id).first()
    if not task:
        return not_found_response("Задача не найдена")

    update_data = updates.dict(exclude_unset=True, exclude_none=True)

    for field in ["start_time", "end_time", "reminder_time"]:
        if field in update_data:
            update_data[field] = to_utc_from_local(update_data[field])

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.creator_id == user.id).first()
    if not task:
        return not_found_response("Задача не найдена")

    db.delete(task)
    db.commit()
    return success_response({}, "Задача удалена")


@router.post("/{task_id}/assign/{user_id}")
def assign_user(task_id: int, user_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    user = db.query(User).filter(User.id == user_id).first()
    if not task or not user:
        return not_found_response("Задача или пользователь не найдены")

    if user not in task.assigned_users:
        task.assigned_users.append(user)
        db.commit()

    return success_response({}, "Пользователь назначен на задачу")


@router.post("/{task_id}/unassign/{user_id}")
def unassign_user(task_id: int, user_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    user = db.query(User).filter(User.id == user_id).first()
    if not task or not user:
        return not_found_response("Задача или пользователь не найдены")

    if user in task.assigned_users:
        task.assigned_users.remove(user)
        db.commit()

    return success_response({}, "Пользователь отвязан от задачи")


@router.get("/my", response_model=List[TaskOut])
def get_my_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(
        or_(
            Task.creator_id == user.id,
            Task.assigned_users.any(id=user.id)
        )
    ).all()
    return tasks


@router.get("/completed", response_model=List[TaskOut])
def get_completed_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(
        Task.status == "Завершено",
        or_(
            Task.creator_id == user.id,
            Task.assigned_users.any(id=user.id)
        )
    ).all()
    return tasks


@router.get("/active", response_model=List[TaskOut])
def get_active_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    now = now_utc()
    tasks = db.query(Task).filter(
        and_(
            Task.status != "Завершено",
            cast(Task.end_time, TIMESTAMP(timezone=True)) > now,
            or_(
                Task.creator_id == user.id,
                Task.assigned_users.any(id=user.id)
            )
        )
    ).all()
    return tasks


@router.get("/overdue", response_model=List[TaskOut])
def get_overdue_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    now = now_utc()
    tasks = db.query(Task).filter(
        and_(
            Task.status != "Завершено",
            cast(Task.end_time, TIMESTAMP(timezone=True)) < now,
            or_(
                Task.creator_id == user.id,
                Task.assigned_users.any(id=user.id)
            )
        )
    ).all()
    return tasks


@router.get("/expiring", response_model=List[TaskOut])
def get_expiring_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    now = now_utc()
    soon = now + timedelta(minutes=30)

    logger.info("🔍 Проверка задач с дедлайном <= 30 минут")
    logger.info(f"🕒 now UTC: {now.isoformat()} | MSK: {now.astimezone(MSK).isoformat()}")
    logger.info(f"⏳ Deadline должен быть между {now.isoformat()} и {soon.isoformat()}")

    tasks = db.query(Task).filter(
        and_(
            Task.status != "Завершено",
            cast(Task.end_time, TIMESTAMP(timezone=True)) > now,
            cast(Task.end_time, TIMESTAMP(timezone=True)) <= soon,
            or_(
                Task.creator_id == user.id,
                Task.assigned_users.any(id=user.id)
            )
        )
    ).all()

    logger.info(f"✅ Найдено задач с приближающимся дедлайном: {len(tasks)}")
    return tasks


@router.post("/notify-expiring")
def trigger_notifications(db: Session = Depends(get_db)):
    notify_users_about_expiring_tasks(db)
    return success_response({}, "🔔 Уведомления отправлены")
