from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    reminder_time: Optional[datetime] = None
    status: Optional[str] = "To Do"


class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    reminder_time: Optional[datetime]
    status: Optional[str]


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    reminder_time: Optional[datetime]
    status: str
    creator_id: int
    assigned_users: List[int] = []

    class Config:
        orm_mode = True
