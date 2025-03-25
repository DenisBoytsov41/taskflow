import os
import requests
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.auth import get_db, get_current_user
from app.models import Task, User
from app.responses import (
    success_response, created_response, not_found_response, bad_request_response
)
from app.routes.schemas.task import TaskCreate, TaskUpdate, TaskOut
from typing import List

router = APIRouter(tags=["tasks"])
TELEGRAM_BOT_URL = os.getenv("TELEGRAM_BOT_URL", "http://telegram-bot:8001/send-message")


# Создать задачу
@router.post("/", response_model=TaskOut)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    task = Task(
        title=task_data.title,
        description=task_data.description,
        start_time=task_data.start_time,
        end_time=task_data.end_time,
        reminder_time=task_data.reminder_time,
        status=task_data.status,
        creator_id=user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return task


# Обновить задачу
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

    for field, value in updates.dict(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


# Удалить задачу
@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.creator_id == user.id).first()
    if not task:
        return not_found_response("Задача не найдена")

    db.delete(task)
    db.commit()
    return success_response({}, "Задача удалена")


# Назначить пользователя на задачу
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


# Удалить пользователя из задачи
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


# Мои задачи
@router.get("/my", response_model=List[TaskOut])
def get_my_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(
        or_(Task.creator_id == user.id, Task.assigned_users.any(id=user.id))
    ).all()
    return tasks


# Завершенные задачи
@router.get("/completed", response_model=List[TaskOut])
def get_completed_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.status == "Done", Task.creator_id == user.id).all()
    return tasks


# Актуальные задачи
@router.get("/active", response_model=List[TaskOut])
def get_active_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    tasks = db.query(Task).filter(
        and_(Task.status != "Done", Task.end_time > now, Task.creator_id == user.id)
    ).all()
    return tasks


# Просроченные задачи
@router.get("/overdue", response_model=List[TaskOut])
def get_overdue_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    tasks = db.query(Task).filter(
        and_(Task.status != "Done", Task.end_time < now, Task.creator_id == user.id)
    ).all()
    return tasks


# Задачи, которые скоро просрочатся
@router.get("/expiring", response_model=List[TaskOut])
def get_expiring_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    soon = now + timedelta(minutes=30)
    tasks = db.query(Task).filter(
        and_(
            Task.status != "Done",
            Task.end_time <= soon,
            Task.end_time > now,
            Task.creator_id == user.id
        )
    ).all()
    return tasks
