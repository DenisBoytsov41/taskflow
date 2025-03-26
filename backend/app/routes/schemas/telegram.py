from pydantic import BaseModel

class SendMessageRequest(BaseModel):
    username: str
    message: str

class UnlinkRequest(BaseModel):
    username: str
