from fastapi import FastAPI
from app.core.config import settings
from app.api import auth, lists, items

app = FastAPI(title="Modern List App API")
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(lists.router, prefix="/lists", tags=["Lists"])
app.include_router(items.router, prefix="/api", tags=["Items"])

@app.get("/")
def read_root():
    return {
        "status": "active",
        "system": "Minimalist List App",
        "database_url": "Connected securely (URL hidden)" 
    }

@app.get("/health")
def health_check():
    # In a real app, we would ping the DB here to ensure connectivity
    return {"status": "ok"}