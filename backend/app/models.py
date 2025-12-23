import uuid
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lists = relationship("TodoList", back_populates="owner")

class Collaborator(Base):
    __tablename__ = "collaborators"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    list_id = Column(UUID(as_uuid=True), ForeignKey("todo_lists.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")
    todo_list = relationship("TodoList", back_populates="collaborators")

class TodoList(Base):
    __tablename__ = "todo_lists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    type = Column(String, default="simple")
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    owner = relationship("User", back_populates="lists")
    items = relationship("TodoItem", back_populates="todo_list", cascade="all, delete-orphan")
    collaborators = relationship("Collaborator", back_populates="todo_list", cascade="all, delete-orphan")


class TodoItem(Base):
    __tablename__ = "todo_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    is_complete = Column(Boolean, default=False)
    todo_list_id = Column(UUID(as_uuid=True), ForeignKey("todo_lists.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    todo_list = relationship("TodoList", back_populates="items")