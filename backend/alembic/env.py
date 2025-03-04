import os
from logging.config import fileConfig
from sqlalchemy import create_engine, pool
from alembic import context
from app.database import Base
from app.models import User, Project, Task  # Подключаем все модели

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/project_db")

engine = create_engine(DATABASE_URL, poolclass=pool.NullPool)

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline():
    """Запуск миграций в оффлайн-режиме (без подключения к БД)."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Запуск миграций в онлайн-режиме (с подключением к БД)."""
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
