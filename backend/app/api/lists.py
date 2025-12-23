from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.core import database, security
from app import models, schemas
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.models import Collaborator, User
from pydantic import BaseModel

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --- Dependency: Get Current User ---
# This acts as a security guard. It checks the Token in the header
# and finds the user who owns it.
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# --- Routes ---

@router.post("/", response_model=schemas.TodoListResponse)
def create_list(
    list_data: schemas.TodoListCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # We automatically assign the list to the user who is logged in
    new_list = models.TodoList(**list_data.model_dump(), owner_id=current_user.id)
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list

@router.get("/", response_model=List[schemas.TodoListResponse])
def read_lists(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Logic: Get lists where I am the OWNER -OR- where I am a COLLABORATOR
    owned_lists = db.query(models.TodoList).filter(models.TodoList.owner_id == current_user.id).all()
    
    shared_lists = (
        db.query(models.TodoList)
        .join(models.Collaborator)
        .filter(models.Collaborator.user_id == current_user.id)
        .all()
    )
    
    return owned_lists + shared_lists

class ShareRequest(BaseModel): # Tiny schema just for this request
    email: str

@router.post("/{list_id}/share")
def share_list(
    list_id: UUID,
    share_data: ShareRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # A. Verify I own this list (Security)
    todo_list = db.query(models.TodoList).filter(models.TodoList.id == list_id, models.TodoList.owner_id == current_user.id).first()
    if not todo_list:
        raise HTTPException(status_code=404, detail="List not found or you are not the owner")

    # B. Find the user we want to invite
    target_user = db.query(models.User).filter(models.User.email == share_data.email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User with this email does not exist")

    # C. Check if already shared
    exists = db.query(models.Collaborator).filter(models.Collaborator.list_id == list_id, models.Collaborator.user_id == target_user.id).first()
    if exists:
        return {"message": "Already shared"}

    # D. Create the link
    new_collab = models.Collaborator(list_id=list_id, user_id=target_user.id)
    db.add(new_collab)
    db.commit()
    
    return {"message": "List shared successfully"}

@router.delete("/{list_id}", status_code=204)
def delete_list(
    list_id: UUID,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Find List
    todo_list = db.query(models.TodoList).filter(models.TodoList.id == list_id).first()
    if not todo_list:
        raise HTTPException(status_code=404, detail="List not found")
    
    # 2. Check Ownership (Strict: Only Owner can delete)
    if todo_list.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can delete this list")

    # 3. Delete (Cascades will handle items/collaborators)
    db.delete(todo_list)
    db.commit()
    return Response(status_code=204)