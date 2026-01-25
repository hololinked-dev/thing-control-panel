FROM ubuntu:24.04 AS base

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    apt-transport-https \
    software-properties-common \
    ca-certificates \
    jq \
    wget \
    lsb-release \
    docker.io 

COPY --from=docker/buildx-bin:latest /buildx /usr/libexec/docker/cli-plugins/docker-buildx
RUN docker buildx version

ARG ARCH=amd64

ARG YQ_VERSION=v4.44.3
RUN curl -fsSL "https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_${ARCH}" -o /usr/local/bin/yq; \
    chmod +x /usr/local/bin/yq; \
    yq --version

ARG K8S_VERSION=v1.31
RUN mkdir -p /etc/apt/keyrings && \
    echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/${K8S_VERSION}/deb/ /" | tee /etc/apt/sources.list.d/kubernetes.list && \
    curl -fsSL https://pkgs.k8s.io/core:/stable:/${K8S_VERSION}/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg && \
    apt-get update && \
    apt-get install -y kubectl

ARG HELM_VERSION=v4.1.0
RUN curl -fsSL https://get.helm.sh/helm-${HELM_VERSION}-linux-${ARCH}.tar.gz -o /tmp/helm.tar.gz && \
    tar -zxvf /tmp/helm.tar.gz -C /tmp && \
    mv /tmp/linux-${ARCH}/helm /usr/local/bin/helm && \
    chmod +x /usr/local/bin/helm && \
    helm version

ARG SKAFFOLD_VERSION=v2.17.1
RUN curl -fsSL "https://storage.googleapis.com/skaffold/releases/${SKAFFOLD_VERSION}/skaffold-linux-${ARCH}" -o /usr/local/bin/skaffold && \
    chmod +x /usr/local/bin/skaffold && \
    skaffold version

RUN rm -rf /var/lib/apt/lists/*