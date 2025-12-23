from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.core import database
from app import models, schemas
from app.api.lists import get_current_user

router = APIRouter()

# --- HELPER: Security Guard ---
def verify_access(list_id: UUID, user_id: UUID, db: Session):
    """
    Checks if the user is either the OWNER or a COLLABORATOR.
    Returns True if access is allowed, raises 404/403 if not.
    """
    # 1. Check if the list exists
    todo_list = db.query(models.TodoList).filter(models.TodoList.id == list_id).first()
    if not todo_list:
        raise HTTPException(status_code=404, detail="List not found")

    # 2. Check Ownership
    if todo_list.owner_id == user_id:
        return todo_list

    # 3. Check Collaboration
    is_collaborator = db.query(models.Collaborator).filter(
        models.Collaborator.list_id == list_id,
        models.Collaborator.user_id == user_id
    ).first()

    if is_collaborator:
        return todo_list

    # 4. If neither, deny access
    raise HTTPException(status_code=404, detail="List not found or access denied")


# --- ENDPOINTS ---

# 1. Create Item
@router.post("/{list_id}/items", response_model=schemas.TodoItemResponse)
def create_item(
    list_id: UUID,
    item_data: schemas.TodoItemCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify Owner OR Collaborator
    verify_access(list_id, current_user.id, db)

    new_item = models.TodoItem(title=item_data.title, todo_list_id=list_id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

# 2. Get Items
@router.get("/{list_id}/items", response_model=List[schemas.TodoItemResponse])
def read_items(
    list_id: UUID,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify Owner OR Collaborator
    verify_access(list_id, current_user.id, db)
        
    return db.query(models.TodoItem).filter(models.TodoItem.todo_list_id == list_id).all()

# 3. Toggle/Update Item
@router.patch("/items/{item_id}", response_model=schemas.TodoItemResponse)
def update_item(
    item_id: UUID,
    item_update: schemas.TodoItemUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Find item
    item = db.query(models.TodoItem).filter(models.TodoItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Verify Access to the PARENT LIST
    verify_access(item.todo_list_id, current_user.id, db)

    # Update fields
    if item_update.is_complete is not None:
        item.is_complete = item_update.is_complete
    
    db.commit()
    db.refresh(item)
    return item

# 4. Delete Item
@router.delete("/items/{item_id}", status_code=204)
def delete_item(
    item_id: UUID,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Find item
    item = db.query(models.TodoItem).filter(models.TodoItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Verify Access to the PARENT LIST
    verify_access(item.todo_list_id, current_user.id, db)
    
    db.delete(item)
    db.commit()
    return Response(status_code=204)