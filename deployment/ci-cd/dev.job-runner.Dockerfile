FROM ubuntu:24.04 AS base

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    python3 \
    python3-pip \
    software-properties-common

RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs    

RUN npm install -g semantic-release @semantic-release/exec

RUN curl -LsSf https://github.com/astral-sh/uv/releases/download/0.9.0/uv-installer.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

RUN uv venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

RUN rm -rf /var/lib/apt/lists/*

