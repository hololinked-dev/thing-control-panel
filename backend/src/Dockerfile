FROM python:3.13-slim AS base

WORKDIR /app/backend/src

COPY backend/src/pyproject.toml backend/src/uv.lock /app/backend/src/

RUN pip install --no-cache-dir uv==0.9.0
RUN uv venv && uv sync --no-install-project --no-dev

EXPOSE 5000

# ---- development stage ----
FROM base AS dev

RUN uv sync --no-install-project --group dev
COPY backend/src/ /app/backend/src/

EXPOSE 5678

CMD ["/bin/bash", "-c", ". .venv/bin/activate && python -Xfrozen_modules=off -m debugpy --listen 0.0.0.0:5678 -m uvicorn --app-dir backend main:app --host 0.0.0.0 --port 5000 --reload --log-level info"]

# ---- staging stage ----
FROM base AS staging

COPY backend/src/ /app/backend/src/

CMD ["/bin/bash", "-c", ". .venv/bin/activate && uvicorn --app-dir backend main:app --host 0.0.0.0 --port 5000"]

# ---- production stage ----
FROM base AS prod

COPY backend/src/ /app/backend/src/

CMD ["/bin/bash", "-c", ". .venv/bin/activate && uvicorn --app-dir backend main:app --host 0.0.0.0 --port 5000"]