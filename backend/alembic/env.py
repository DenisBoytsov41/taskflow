from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Импортируем модели и базу
from app.database import Base, engine
from app.models import User, Project, Task  # Импортируем все модели

# Настройки из Alembic config
config = context.config

# Настройка логирования
if config.config_file_name:
    fileConfig(config.config_file_name)

# Подключаем метаданные моделей
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Запуск миграций в оффлайн-режиме."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Запуск миграций в онлайн-режиме."""
    connectable = engine

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
