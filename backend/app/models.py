from sqlalchemy import (
    Column, Integer, String, ForeignKey, DateTime, Text, Table, Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

task_user_association = Table(
    "task_user_association",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id", ondelete="CASCADE")),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    telegram_id = Column(String, unique=True, nullable=True)
    password_hash = Column(String, nullable=False)

    created_tasks = relationship("Task", back_populates="creator", cascade="all, delete-orphan")
    assigned_tasks = relationship(
        "Task",
        secondary=task_user_association,
        back_populates="assigned_users"
    )

    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="To Do")

    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    reminder_time = Column(DateTime, nullable=True)

    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    creator = relationship("User", back_populates="created_tasks")

    assigned_users = relationship(
        "User",
        secondary=task_user_association,
        back_populates="assigned_tasks"
    )
    notified = Column(Boolean, default=False)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True)
    user_id = Column(ForeignKey("users.id"), unique=True)
    token = Column(String, unique=True, nullable=False)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="refresh_tokens")
