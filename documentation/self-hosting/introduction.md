# Self Hosting

To simplify development as well as deployment, kubernetes is the preferred setup for
self-hosting this repository. A single-machine kubernetes cluster would be sufficient for most use-cases.

Install k3s or k8s in your machine and export the `KUBECONFIG` environment variable to point to your cluster:

```sh
curl -sfL https://get.k3s.io | sh -
KUBECONFIG=/etc/rancher/k3s/k3s.yaml
# copy the value to your client machine
```

You also need to install `skaffold`, `helm` and `kubectl` CLIs in your machine.

```sh
skaffold run -m backend
skaffold run -m frontend
```
