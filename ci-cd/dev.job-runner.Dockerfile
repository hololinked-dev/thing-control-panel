FROM ubuntu:24.04 AS base

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    git \
    build-essential \
    python3 \
    python3-pip \
    software-properties-common

RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs    

RUN npm install -g semantic-release @semantic-release/exec

RUN npm install -g prettier@3.8.1

RUN curl -LsSf https://github.com/astral-sh/uv/releases/download/0.9.0/uv-installer.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

RUN uv venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

COPY backend/pyproject.toml /backend/pyproject.toml
RUN . /opt/venv/bin/activate && \ 
    uv sync --no-install-project --no-cache-dir \
    --only-group scanning --only-group dev \
    --project /backend/pyproject.toml --active

RUN curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.18.2/gitleaks_8.18.2_linux_x64.tar.gz -o /tmp/gitleaks.tar.gz \
    && tar -xzf /tmp/gitleaks.tar.gz -C /usr/local/bin gitleaks \
    && rm /tmp/gitleaks.tar.gz \
    && chmod +x /usr/local/bin/gitleaks

RUN rm -rf /var/lib/apt/lists/*