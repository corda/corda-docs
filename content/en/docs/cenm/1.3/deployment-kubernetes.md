---
aliases:
- /deployment-kubernetes.html
date: '2020-01-08T09:59:25Z'
menu:
  cenm-1-3:
    identifier: cenm-1-3-deployment-kubernetes
    parent: cenm-1-3-operations
tags:
- config
- kubernetes
title: CENM Deployment with Docker, Kubernetes, and Helm charts
weight: 20
---

# CENM Deployment with Docker, Kubernetes, and Helm charts

## Introduction

This deployment guide provides a set of simple steps for deploying Corda Enterprise Network Manager (CENM)
on a Kubernetes cluster in Azure cloud. The deployment uses Bash scripts and
Helm templates provided with CENM.

You can deploy from your local machine using the provided Bash script along with Docker images of the CENM services, from a suitable Docker registry.

### Who is this deployment guide for?

This deployment guide is intended for use by either of the following types of CENM users:

* Any user with a moderate understanding of Kubernetes who wants to create a CENM network using default configurations.
* Software developers who wish to run a representative network in their development cycle.

### Prerequisites

Before you start:

- You must provision an [Azure Kubernetes Service (AKS) cluster](https://docs.microsoft.com/en-us/azure/aks/).
- The [Kubernetes](https://kubernetes.io/) cluster must be Kubernetes 1.8 or above, and must be able to access the Docker private repository with CENM Docker images.
- The Kubernetes cluster must have at least 10 GB of free memory in order
to run the full suite of CENM services along with Corda nodes.
- You must [set up Azure CLI on your local machine](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).

{{< note >}}
See section [Deploy your network](#Deploy-your-network) further down on this page for instructions on setting up and connecting to a cluster on Azure, as well as for information about cluster requirements (notably memory).
{{< /note >}}

You also need the following tools installed on your machine:

* Linux/Mac OS, or a Unix-compatible environment for Windows (for example, [Cygwin](https://www.cygwin.com/)).
* [Helm](https://helm.sh/) (version 3.1. or above).

### Compatibility

The CENM deployment scripts use Docker images, which are intentionally bare,
and are used as the base for deployed images. The Docker images are based
on the Zulu JDK image `azul/zulu-openjdk`.

All CENM Helm charts use CENM Docker images CENM version 1.3 by default. Notary is based on Corda - see the Docker image tag for information about the Corda version used.

{{< note >}}
The use of different CENM versions on the same network is not supported - all services on a given network must use the same CENM version.
{{< /note >}}

### Helm charts

#### Usage notes

- The charts provide a baseline for creating your own deployment of a permissioned Corda network.
- They allow you to configure several variables related to each CENM service.

These charts are compatible with Corda Enterprise Network Manager (CENM) version 1.3.

{{< note >}}
We do not provide Helm charts for CENM releases prior to 1.2.
{{< /note >}}

## Deployment

### Deployment overview

The provided deployment runs all CENM services run inside a single, dedicated
Kubernetes namespace (default name:`cenm`). Each service runs in its own dedicated Kubernetes pod.

The CENM network is bootstrapped with PKI certificates, and sample X.500 subject names are provided as defaults (for example, the Identity Manager certificate subject is “CN=Test Identity Manager Service Certificate, OU=HQ, O=HoldCo LLC, L=New York, C=US”).
These can be configured in the Signer Helm chart. For more information about Signer
Helm chart refer to [Signer](deployment-kubernetes-signer.md).

There are two ways of bootstrapping a new CENM environment:

- Scripted (`bootstrap.cenm`) with **allocating new** public IP addresses.
- Scripted (`bootstrap.cenm`) with  **reusing** already allocated public IP addresses.

Use the first method for the initial bootstrap process, where there are no
allocated endpoints for the services. The bootstrapping process uses default
values stored in the `values.yaml` file of each Helm chart.

{{< note >}}
The Identity Manager Service requires its public IP address or hostname to be known in advance of certificate generation, as its URL is set as the endpoint for the CRL in certificates.
{{< /note >}}

It could take a few minutes to allocate a new IP address. For subsequent deployments, you should be able to reuse existing external IP addresses.

The Network Map Service and the Signing Services have their public IP addresses allocated while bootstrapping and they do not need to be known ahead of time.

Public IP addresses are allocated as Kubernetes `LoadBalancer` services.

### Deploy your network

The deployment steps are given below:

#### 1. Install dependencies

Install:
* [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
* [helm](https://helm.sh/docs/intro/install/)

Ensure that the value in the `version` field  for `helm version` is equal to or greater than 3.1.1, as shown in the example below:

Example:

```bash
version.BuildInfo{Version:"v3.1.2", GitCommit:"afe70585407b420d0097d07b21c47dc511525ac8", GitTreeState:"clean", GoVersion:"go1.13.8"}
```

#### 2. Set up and connect to a cluster on Azure

- Create a cluster on Azure. Microsoft provides a [quick start guide](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough).


{{< note >}} You will need a Kubernetes cluster with at least 10 GB of free memory available to all CENM services.
{{< /note >}}.

- Ensure that you have [Azure CLI installed](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) on your machine.
- Check that you have your cluster subscription [as your active subscription](https://docs.microsoft.com/en-us/cli/azure/account?view=azure-cli-latest#az-account-set).
- [Connect to your cluster](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough-portal#connect-to-the-cluster).

#### 3. Create storage class and namespace

Run the following instruction once the previous points have been cleared:

`All the examples below use the namespace **cenm**`

```bash
kubectl apply -f deployment/k8s/cenm.yaml
export nameSpace=cenm
kubectl config set-context $(kubectl config current-context) --namespace=${nameSpace}
```

You can verify this with `kubectl get ns`

#### 4. Download Helm charts and installation scripts

You can find the files required for the following steps in [CENM deployment repo](https://github.com/corda/cenm-deployment).

----

#### 5. Bootstrap CENM
**Option 1.** Bootstrap by allocating new external IP addresses

Before bootstrapping CENM you should read the license agreement. You can do by
running `./bootstrap.cenm`. The example below includes the `--ACCEPT_LICENSE Y`
argument, which you should only specify if you accept the license agreement.

Run the following command to bootstrap a new CENM environment by allocating a new external IP:

```bash
cd network-services/deployment/k8s/helm
./bootstrap.cenm `--ACCEPT_LICENSE Y`
```

{{< note >}} It could take up to 10 minutes to obtain your IP addresses.
{{< /note >}}

The script exits after all bootstrapping processes on Kubernetes cluster have been started. The process will continue to run on the cluster after the script has exited. You can monitor the completion of the deployment with:

``` bash
kubectl get pods -o wide
```

 **Option 2.**  Bootstrap by reusing already allocated external IP addresses

If your external IPs have been already allocated you can reuse them by specifying their services names:

```bash
cd network-services/deployment/k8s/helm
./bootstrap.cenm -i idman-ip -n notary-ip
```

## External database support

You can configure the services to use an external database. We strongly recommend this for production deployments. The database used by each service is configured via JDBC URL and defined in the `values.yml` file for the service’s Helm chart, for example, `idman/values.yml` for Identity Manager. Within the `values.yml` file, edit the database section of the configuration to change the JDBC URL, user and password.

{{< note >}}
The bootstrap script cannot be used with an external database. You instead will have to manually run each Helm chart specifying correct database URL.
{{< /note >}}

Example settings for connection to Postgres database:

```guess
database:
  driverClassName: "org.postgresql.Driver"
  url: "jdbc:postgresql://<HOST>:<PORT>/<DATABASE>"
  user: "<USER>"
  password: "<PASSWORD>"
  runMigration: "true"
```

where <HOST> is the host name of the server, <PORT> is the port number the server is listening on (typically 5432 for PostgreSQL),
<DATABASE> is the database name, <USER> and <PASSWORD> are cerdentials for the database user.

## Network operations

Access the interactive shell of the network services and notary

Run the following command to access Identity Manager, Signer, Network Map or Notary:

```bash
ssh -p <shell.sshdPort> -l <shell.user> <IP Address>
```

  - IP addresses are dynamically allocated for each deployment and can be found with `kubectl get svc`.
  - SSH port and user are specified in [Helm charts configurations](#Helm-charts) for each service.
  - You will be asked a password for each service, which can be found [Helm charts configurations](#Helm-charts) for each service.

Use the following command to ensure that you are pointing at the correct namespace:

  ```bash
  kubectl config current-context && kubectl config view --minify --output 'jsonpath={..namespace}' && echo`)
  ```

### Join your network

Edit the following properties in your `node.conf` file to configure Corda node to connect to the CENM services:

```bash
networkServices {
  doormanURL="http://<IDENTITY-MANAGER-IP>:10000"
  networkMapURL="http://<NETWORK-MAP-IP>:10000"
}
```

Replacing placeholder values as follows:
  * the `doormanURL` property is the public IP address and port of the Identity Manager service
  * the `networkMapURL` is the pubic IP address and port of the Network Map service.

Next upload the `network-root-truststore.jks` to your Corda node. You can download it locally from CENM Signer using the following command:

```bash
kubectl cp <namespace>/<signer-pod>:DATA/trust-stores/network-root-truststore.jks network-root-truststore.jks
```

Namespace is typically `cenm` for this deployment.

Run the following command to obtain public IPs of Identity Manager and Network Map:

```bash
kubectl get svc idman-ip notary-ip
```

Run the command below to obtain the pod name for the Signer:

```bash
kubectl get pods -o wide`
```

You will find the truststore password in the `signer/files/pki.conf`, where the default value used in this Helm chart is `trust-store-password`.

{{< note >}} For more details about joining CENM network see: [Joining an existing compatibility zone](https://docs.corda.net/docs/corda-os/joining-a-compatibility-zone.html).
{{< /note >}}

### Display logs

Each CENM service has a dedicated sidecar to display live logs from the ```log/``` folder.

* Use the following command to display logs:

  ```bash
  kubectl logs -c logs <pod-name>
  ```

* Use the following command to display live logs:

  ```bash
  kubectl logs -c logs -f <pod-name>
  ```

Display configuration files used for each CENM service

Each service stores configuration files in ```etc/``` folder in a pod.
* Run the following commands to display what is in the Identity Manager ```etc/``` folder :

```bash
kubectl exec -it <pod name> -- ls -al etc/
Defaulting container name to main.

Use 'kubectl describe pod/idman-7699c544dc-bq9lr -n cenm' to see all of the containers in this pod.
total 10
drwxrwxrwx 2 corda corda    0 Feb 11 09:29 .
drwxr-xr-x 1 corda corda 4096 Feb 11 09:29 ..
-rwxrwxrwx 1 corda corda 1871 Feb 11 09:29 idman.conf

kubectl exec -it <pod name> -- cat etc/idman.conf
Defaulting container name to main.

Use 'kubectl describe pod/idman-7699c544dc-bq9lr -n cenm6' to see all of the containers in this pod.

address = "0.0.0.0:10000"
database {
...
```

### Run flag day

* Run the following in the Network Map ssh console after the set date/time has passed:

  ```bash
  run flagDay
  ```


{{< note >}} For the changes to be advertised to the nodes, the new network map has to be signed by the signer. This is scheduled according to its configuration.
{{< /note >}}
### Update network parameters

CENM allows you to update network parameters without restarting Network Map.
* Follow the steps below to update the network parameters:
  * Login to Network Map pod and edit `etc/network-parameters-update-example.conf` file:

    ```bash
    kubectl exec -it [name of nmap pod] bash
    vim etc/network-parameters-update-example.conf
    [update the file, save and exit]
    ```

  * Connect to Network Map ssh console:

    ```bash
    ssh -p [nmap ssh port] -l nmap [nmap public IP address]
    ```

  * Run the following commands:

    ```bash
    run networkParametersRegistration networkParametersFile: etc/network-parameters-update-example.conf, \
    networkTrustStore: DATA/trust-stores/network-root-truststore.jks, \
    trustStorePassword: trust-store-password, \
    rootAlias: cordarootca
    ```
Visit CENM official documentation for more information about network parameters:

- [Updating Network Parameters](./updating-network-parameters.html)
- [Network Parameters List](./config-network-parameters.html)

### Cancel network parameters update

To cancel a flag day run the following from the service shell:

```bash
run cancelUpdate
```
```bash
etc/network-parameters-update-example.conf
DATA/trust-stores/network-root-truststore.jks
```

## Delete Network
There are two ways to delete your permissioned network (intended for development
environments which are rebuilt regularly):

- delete the whole environment including IPs
- delete all CENM objects without deleting allocated external IP addresses

### Delete the whole environment including IPs

```bash
helm delete nmap notary idman signer notary-ip idman-ip
```

### Delete the whole environment without deleting IPs

If you run several ephemeral test networks in your development cycle, you might want to keep your IP addresses to speed up the process:

```bash
helm delete nmap notary idman signer
```

## Deployment Customisation

The Kubernetes scripts provided are intended to be customised depending on customer requirements.
The following sections describes how to customise various aspects of the deployment.

### Service Chart Settings

There are a number of settings provided on each Helm chart, which allow easy customisation of
common options. Each CENM service has its own dedicated page with more detailed documentation:

* [Identity Manager](deployment-kubernetes-idman.md)
* [Network Map](deployment-kubernetes-nmap.md)
* [Signer](deployment-kubernetes-signer.md)
* [Corda Notary](deployment-kubernetes-notary.md)

### Overriding Service Confiuration

The default settings used in a CENM service's configuration values can be altered as described in
https://helm.sh/docs/chart_template_guide/values_files/

In brief this can be achieved by:

* Create a separate yaml file with new values and pass it with `-f` flag: `helm install -f myvalues.yaml idman`, or;
* Override individual parameters using `--set`, such as `helm install --set foo=bar idman`, or;
* Any combination of the above, i.e. ```helm install -f myvalues.yaml --set foo=bar idman```

### Memory Allocation

Default memory settings used should be adequate for most deployments, but may need to be increased for
networks with large numbers of nodes (over a thousand). The `cordaJarMx` value for each Helm chart
(in `values.yaml`) is passed to the JVM as the `-Xmx` value, and is specified in GB. Each Pod requests
memory sufficient for this value, with a limit 2GB higher than the value.

All services except the Notary use 1GB of RAM as their default `cordaJarMx`, while Notary defaults to 3GB.

## Manual bootstrap

For production deployments the bootstrap script can be used to provide a baseline, however
for additional flexibility you may wish to deploy each Helm chart individually.
There are several Helm commands which are used to bootstrap a new CENM environment,
where each comand creates a CENM service consisting of the following:

* Signer
* Identity Manager
* Network Map
* Notary

They need to be run in the correct order, as shown below:

```bash
cd network-services/deployment/k8s/helm

# These Helm charts trigger public IP allocation
helm install idman-ip idman-ip
helm install notary-ip notary-ip

# Run these commands to display allocated public IP addresses:
kubectl get svc --namespace cenm idman-ip --template "{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}"   # step 1
kubectl get svc --namespace cenm notary-ip --template "{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}"  # step 2

# These Helm charts bootstrap CENM
helm install signer signer --set idmanPublicIP=[use IP from step 1]
helm install idman idman
helm install notary notary --set notaryPublicIP=[use IP from step 2]
helm install nmap nmap

# Run these commands to display allocated public IP addresses for Signer and NetworkMap:
kubectl get svc --namespace cenm signer --template "{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}"
kubectl get svc --namespace cenm nmap --template "{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}"
```

## Appendix A: Docker Images

The Docker images used for the Kubernetes deployment are listed below for reference:

{{< table >}}

| Service       | Image Name                         | Tag |
|---------------|------------------------------------|-----|
| Network Map   | acrcenm.azurecr.io/nmap/nmap       | 1.3 |
| PKI Tool      | acrcenm.azurecr.io/pkitool/pkitool | 1.3 |
| Signer        | acrcenm.azurecr.io/signer/signer   | 1.3 |
| Notary        | acrcenm.azurecr.io/notary/notary   | 1.3 |

{{< /table >}}
