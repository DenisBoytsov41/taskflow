import logging
import sys
from types import FrameType
from typing import cast
from loguru import logger

class InterceptHandler(logging.Handler):
    """Перехватчик стандартных логов Python и передача их в Loguru"""

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

def setup_logging(level: str = "INFO") -> None:
    """Настройка логирования для FastAPI, Uvicorn, SQLAlchemy и других библиотек"""
    logging.root.handlers = []
    logging.root.setLevel(logging.INFO)

    for name in ["uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"]:
        logging.getLogger(name).handlers = [InterceptHandler()]

    logger.configure(
        handlers=[
            {
                "sink": sys.stdout,
                "format": "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
                          "<level>{level: <8}</level> | "
                          "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
                          "<level>{message}</level>",
                "colorize": True,
                "level": level
            }
        ]
    )
