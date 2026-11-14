# ==========================================
# Stage 1: Build React/Vite Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY ["Recreate Dark Enterprise Dashboard/package.json", "Recreate Dark Enterprise Dashboard/package-lock.json*", "./"]
RUN npm install

COPY ["Recreate Dark Enterprise Dashboard/", "./"]
RUN npm run build

# ==========================================
# Stage 2: Python Backend & Static Host
# ==========================================
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend files (including pre-seeded fire_intelligence.db)
COPY backend/ ./backend/

# Copy built frontend from Stage 1 into dist
COPY --from=frontend-builder /app/frontend/dist ./dist

EXPOSE 8000

WORKDIR /app/backend
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
