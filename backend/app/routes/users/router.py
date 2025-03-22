from fastapi import APIRouter
from .handlers import auth, telegram, user_ops

router = APIRouter()
router.include_router(auth.router, prefix="", tags=["auth"])
router.include_router(user_ops.router, prefix="", tags=["users"])
router.include_router(telegram.router, prefix="", tags=["telegram"])
