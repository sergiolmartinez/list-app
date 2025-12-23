from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

# 1. Base User Schema (Shared properties)
class UserBase(BaseModel):
    email: EmailStr

# 2. What we receive when creating a user
class UserCreate(UserBase):
    password: str

# 3. What we return to the client (NEVER return the password)
class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True # Allows Pydantic to read SQLAlchemy models

# 4. Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str

# --- List Schemas ---

class TodoListBase(BaseModel):
    title: str
    type: str = "simple" # Default to simple list

class TodoListCreate(TodoListBase):
    pass 

class TodoListResponse(TodoListBase):
    id: UUID
    owner_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Item Schemas ---

class TodoItemBase(BaseModel):
    title: str
    is_complete: bool = False

class TodoItemCreate(TodoListBase): # Inherits title
    pass

class TodoItemUpdate(BaseModel):
    title: Optional[str] = None
    is_complete: Optional[bool] = None

class TodoItemResponse(TodoItemBase):
    id: UUID
    todo_list_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True