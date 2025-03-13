import logging
import sys
from types import FrameType
from typing import cast
from loguru import logger

class InterceptHandler(logging.Handler):
    """Перехватывает стандартные логи Python и передает их в Loguru"""

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = cast(FrameType, frame.f_back)
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )

def setup_logging(level: str = "DEBUG") -> None:
    """Настройка логирования для FastAPI, Uvicorn, SQLAlchemy и других библиотек"""
    
    logging.root.handlers = []
    logging.root.setLevel(logging.INFO)

    for name in ["uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"]:
        logging.getLogger(name).handlers = [InterceptHandler()]

    logger.configure(
        handlers=[
            {
                "sink": sys.stdout,
                "format": (
                    "<bold><green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green></bold> | "
                    "<level>{level: <8}</level> | "
                    "<bold><cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan></bold> | "
                    "<level>{message}</level>"
                ),
                "colorize": True,
                "level": level
            },
            {
                "sink": "logs/app.log",
                "format": (
                    "{time:YYYY-MM-DD HH:mm:ss.SSS} | "
                    "{level: <8} | "
                    "{name}:{function}:{line} | "
                    "{message}"
                ),
                "level": level,
                "rotation": "10 MB",
                "compression": "zip",
            },
        ]
    )
