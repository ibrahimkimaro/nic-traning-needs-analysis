# Deployment & DevOps Specification - TNA Management System

This document describes the technical infrastructure and deployment pipeline required to host the TNA Management System in a production environment.

---

## 1. Infrastructure Architecture

The system uses a containerized architecture for consistency across development, staging, and production environments.

### 1.1 Technology Stack
- **Frontend**: React (Build optimized for production).
- **Backend**: Django REST Framework (Gunicorn as WSGI server).
- **Database**: PostgreSQL 15+.
- **Cache/Broker**: Redis (For Celery tasks and caching).
- **Async Workers**: Celery (For SMS/Email and Expiry reminders).
- **Web Server**: Nginx (Reverse proxy and Static file serving).
- **OS**: Ubuntu 22.04 LTS / Docker.

### 1.2 Container Orchestration (Docker Compose)
We use a multi-container setup:
1. `tna-web`: React static build served by Nginx.
2. `tna-api`: Django application.
3. `tna-db`: PostgreSQL database.
4. `tna-redis`: Redis instance.
5. `tna-worker`: Celery worker process.
6. `tna-beat`: Celery beat (for scheduled tasks).

---

## 2. CI/CD Pipeline

To ensure stability, we implement a fully automated pipeline.

### 2.1 Pipeline Stages (GitHub Actions / GitLab CI)
1. **Lint & Format**: Run `eslint` for React and `flake8`/`black` for Django.
2. **Unit Tests**: Execute PyTest and Jest suites.
3. **Build**: 
    - Create optimized React production build.
    - Build Docker images for API and Worker.
4. **Security Scan**: Run `bandit` for Django and `npm audit` for React.
5. **Deploy**: Push images to Registry $\to$ Trigger rolling update on production server via SSH/Kubernetes.

---

## 3. Production Configuration

### 3.1 Environment Variables (`.env`)
Sensitive data is never committed to version control.

| Variable | Purpose | Example |
|---|---|---|
| `DEBUG` | Disable debug mode in prod | `False` |
| `SECRET_KEY` | Django signing key | `long-random-string` |
| `DB_NAME` | Postgres database name | `tna_prod` |
| `DB_USER` | Postgres user | `tna_admin` |
| `DB_PASSWORD` | Postgres password | `strong-password` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/0` |
| `JWT_SECRET` | Token signing key | `token-secret-key` |
| `SMS_API_KEY` | Africa's Talking API Key | `api_key_123` |
| `EMAIL_HOST_USER` | Govt Email SMTP User | `notifications@gov.tz` |

### 3.2 Nginx Configuration
Nginx acts as the entry point, handling:
- **SSL Termination**: Using Let's Encrypt for HTTPS.
- **Static Files**: Serving `/static/` and `/media/` directly from volume.
- **Reverse Proxy**: Routing `/api/` requests to the Gunicorn backend.

---

## 4. Backup & Disaster Recovery

### 4.1 Database Backups
- **Daily Backups**: Automated `pg_dump` scheduled at 02:00 AM.
- **Storage**: Backups are encrypted and stored on a separate backup server/S3 bucket.
- **Retention**: 30 days of daily backups; 12 months of monthly archives.

### 4.2 Recovery Procedure
1. Restore the latest PostgreSQL dump.
2. Re-deploy Docker containers via the latest stable image.
3. Verify connectivity to the SMS/Email gateways.
4. Run `python manage.py migrate` to ensure schema alignment.

---

## 5. Monitoring & Logging

- **Log Aggregation**: Django logs and Nginx logs are collected using the **ELK Stack** (Elasticsearch, Logstash, Kibana) or a simple **Syslog** server.
- **Uptime Monitoring**: Use **UptimeRobot** or **Prometheus/Grafana** to monitor API health and response times.
- **Celery Monitoring**: **Flower** is used to track task success/failure rates for notifications.
