from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.models import Task, User
from app.routes.schemas.telegram import SendMessageRequest
from app.routes.users.handlers.telegram import send_message_to_user
from loguru import logger

MSK = timezone(timedelta(hours=3))


def to_aware(dt: datetime) -> datetime:
    """Приводит datetime к осведомлённому (aware) UTC"""
    if dt is None:
        return None
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)


def build_task_message(task: Task) -> str:
    end_time_utc = to_aware(task.end_time)
    end_time_msk = end_time_utc.astimezone(MSK) if end_time_utc else None

    return (
        f"⏰ Задача скоро истекает!\n\n"
        f"📌 Название: {task.title}\n"
        f"🧾 Описание: {task.description or '—'}\n"
        f"📅 Дедлайн: {end_time_msk.strftime('%d.%m.%Y %H:%M') if end_time_msk else 'Не указано'}\n"
        f"📌 Статус: {task.status}\n"
        f"🆔 ID: {task.id}"
    )


def notify_users_about_expiring_tasks(db: Session):
    now = datetime.now(timezone.utc)
    soon = now + timedelta(minutes=30)

    logger.info(f"🔔 Проверка задач для уведомления.")
    logger.info(f"🕒 now={now.isoformat()} | soon={soon.isoformat()}")

    tasks = db.query(Task).filter(
        Task.status != "Завершено",
        Task.end_time > now,
        Task.end_time <= soon,
        Task.notified == False
    ).all()

    logger.info(f"🧮 Найдено задач с приближающимся дедлайном: {len(tasks)}")

    for task in tasks:
        end_time = to_aware(task.end_time)
        time_left = end_time - now if end_time else "???"

        logger.debug(
            f"📦 Задача #{task.id} | {task.title} | "
            f"end_time={end_time.isoformat() if end_time else 'None'} | "
            f"до дедлайна: {time_left} | notified={task.notified}"
        )

        message = build_task_message(task)
        recipients = []

        if task.creator and task.creator.telegram_id:
            recipients.append(task.creator)

        for user in task.assigned_users:
            if user.telegram_id and user not in recipients:
                recipients.append(user)

        if not recipients:
            logger.warning(f"⚠️ У задачи #{task.id} нет пользователей с Telegram ID")
            continue

        for user in recipients:
            logger.info(f"📤 Уведомление для @{user.username} (tg_id={user.telegram_id}) по задаче #{task.id}")
            try:
                send_message_to_user(
                    SendMessageRequest(username=user.username, message=message),
                    db=db
                )
            except Exception as e:
                logger.error(f"❌ Ошибка при отправке уведомления @{user.username}: {e}")

        task.notified = True
        db.commit()
        logger.success(f"✅ Задача #{task.id} помечена как уведомлённая")