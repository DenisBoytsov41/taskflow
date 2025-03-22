from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    username: str = Field(..., min_length=4, max_length=50, pattern="^[a-zA-Z0-9_]+$")
    password: str = Field(..., min_length=6, max_length=100)

class Token(BaseModel):
    access_token: str
    token_type: str

class SendMessageRequest(BaseModel):
    username: str
    message: str
