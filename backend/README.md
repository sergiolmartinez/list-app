# List App Backend (FastAPI)

## Development

The backend is best run via Docker (see root README), but you can run it locally for debugging.

### Local Setup (Non-Docker)

1. Create venv: `python -m venv venv`
2. Activate: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows)
3. Install: `pip install -r requirements.txt`
4. Run: `uvicorn app.main:app --reload`

## Database Migrations (Alembic)

We use Alembic for schema changes. Run these commands inside the Docker container:

**Generate Migration:**

```bash
docker-compose exec backend alembic revision --autogenerate -m "Describe your change"
```

**Apply Migration:**

```bash
docker-compose exec backend alembic upgrade head
```
