from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_projects():
    return {"message": "List of projects"}
