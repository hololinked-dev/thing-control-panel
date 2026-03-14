# Self Hosting

To simplify development as well as deployment, kubernetes is the preferred setup for
self-hosting this repository. A single-machine kubernetes cluster would be sufficient for many use-cases.

## Install Kubernetes

Install `k3s` or `k8s` in your machine and export the `KUBECONFIG` environment variable to point to your cluster:

```sh
curl -sfL https://get.k3s.io | sh -
KUBECONFIG=/etc/rancher/k3s/k3s.yaml
# copy the value to your client machine
```

If you are using `k3s`, you may need to disable `traefik` to avoid port conflicts with kubernetes' built-in `ingress-nginx` or `gateway` controller,
which is used by this repository for routing traffic to the services. You can do that by running the following command before installing `k3s`:

```sh
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable=traefik" sh -
```

or

```
sudo nano /etc/rancher/k3s/config.yaml
# add the following line to the file
# disable:
#  - traefik
# save and exit
sudo systemctl restart k3s
```

## Install tools/CLIs

You also need to install if you deploying by hand:

- [`skaffold`](https://skaffold.dev/docs/install/) to build, deploy and develop the application further.
- [`helm`](https://helm.sh/docs/intro/install/), used by skaffold to deploy the application. 
- [`kubectl`](https://kubernetes.io/docs/tasks/tools/), as a general-purpose CLI for managing your kubernetes cluster.
- [`docker`](https://docs.docker.com/get-docker/) to build the application

The other option would be to fork the repository and deploying using the CI CD pipeline by feeding the KUBECONFIG as a secret in the repository.
This will be updated soon.

## Additional Setup 

create a `skaffold.env` file in the root of the repository and export the required secrets as environment variables:

```sh
NAMESPACE=default
SKAFFOLD_DEFAULT_REPO=docker.io/username
DOMAIN_NAME=example.com
DEPLOYMENT_ENV=prod
```

Ensure that firewall rules are functional. Mainly the ports 80, 443 must be open for traffic, and optionally kubernetes API port (6443).

For k3s, additional rules may be necessary, a guide can be found [here](https://docs.k3s.io/installation/requirements?os=suse#operating-systems).
## Deploy the application

```sh
skaffold run -m backend
skaffold run -m frontend
```
