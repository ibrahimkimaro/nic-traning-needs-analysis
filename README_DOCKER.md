# Docker Setup Guide for TNA-NIC

This project is containerized using Docker and Docker Compose.

## Services
- **`db`**: PostgreSQL 16 with `pgvector` extension support on port `5432`.
- **`backend`**: Django REST Framework API on port `8081`.
- **`frontend`**: Vite React Frontend on port `5173`.

## Quick Start with Docker

### 1. Build and Start All Containers
```bash
docker compose up --build -d
```

### 2. Check Logs
```bash
# View all logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend
```

### 3. Run Database Migrations (if needed)
```bash
docker compose exec backend python manage.py migrate
```

### 4. Seed Data or Create Superuser
```bash
docker compose exec -it backend python manage.py createsuperuser
```

### 5. Stop All Containers
```bash
docker compose down
```
*(Data in Postgres and uploaded media files are preserved in named Docker volumes: `postgres_data`, `media_data`, `attachments_data`)*
