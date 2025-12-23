FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (better Docker caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Command is handled by docker-compose, but good to have a default
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]