FROM python:3.13-slim AS db-migration

WORKDIR /app/backend/db-migration

COPY backend/db-migration/pyproject.toml backend/db-migration/uv.lock /app/backend/db-migration/
COPY backend/src/ /app/backend/src/

RUN pip install --no-cache-dir uv==0.9.0
RUN uv venv && uv sync --no-install-project --no-dev

COPY backend/db-migration/ /app/backend/db-migration/