from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserOut(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        orm_mode = True


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    reminder_time: Optional[datetime] = None
    status: Optional[str] = "К выполнению"  


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    reminder_time: Optional[datetime] = None
    status: Optional[str] = None



class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    reminder_time: Optional[datetime]
    status: str
    creator_id: int
    assigned_users: List[UserOut] = []

    class Config:
        orm_mode = True
