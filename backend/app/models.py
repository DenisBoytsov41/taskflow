from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    projects = relationship("Project", back_populates="user")
    tasks = relationship("Task", back_populates="user")


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("public.users.id"))

    user = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project")


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    project_id = Column(Integer, ForeignKey("public.projects.id"))
    user_id = Column(Integer, ForeignKey("public.users.id"))

    project = relationship("Project", back_populates="tasks")
    user = relationship("User", back_populates="tasks")
