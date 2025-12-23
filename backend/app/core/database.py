from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# 1. Create the engine (The connection to Postgres)
engine = create_engine(settings.DATABASE_URL)

# 2. Create the SessionLocal class
# Each request will create a new session instance from this factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. The Base class
# All our data models will inherit from this
Base = declarative_base()

# 4. Dependency Injection
# This function ensures every API request gets a DB session and closes it afterwards
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()