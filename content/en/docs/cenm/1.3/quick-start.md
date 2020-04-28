---
aliases:
- /quick-start.html
- /releases/release-1.2/quick-start.html
date: '2020-01-08T09:59:25Z'
menu:
  cenm-1-2:
    identifier: cenm-1-2-quick-start
    parent: cenm-1-2-operations
    weight: 120
tags:
- quick
- start
title: Enterprise Network Manager Quick Start Guide
---


# Enterprise Network Manager Quick Start Guide



## Introduction

This guide provides a set of simple steps for creating a permissioned network which consists of the following:
* Identity Manager service
* Network Map service
* [Notary Service](https://docs.corda.net/docs/corda-enterprise/4.4/notary/)

### Targeted Audience
This guide is targeted at:
* anyone wanting to operate a permissioned network on Corda.
* software developers who wish to run a representative network in their dev cycle
<mark> check with Kat, Gabe and Ross about the audiences and whether this guide will be used in Prod) </mark>

### Pre-Requisites
* You should have read and understood [Networks | Corda Documentation
Networks](https://docs.corda.net/docs/corda-os/4.4/corda-networks-index.html)
* The following zip files need to be downloaded from <mark>[where]??</mark>  and installed on your device before you start creating your network:
    * Identity Manager distribution zip
    * Network Map distribution zip
    * PKI Tool distribution zip *(for PKI generation)*
    * A Corda jar *(for the Notary node)*
    * 3 Machines set up with Java 8 installed *(if not running locally).*

{{< note >}}
Throughout this guide, placeholder values for external endpoints are used (for example, `<IDENTITY_MANAGER_ADDRESS>`).
They depend on the machine in which the service is running and should be replaced with the correct values.

If you are running the network locally, this value will be the exact value of the `address` parameter
within the Identity Manager config file but if you are deploying the network in a cloud environment, this value should be the external address of your machine along with any port defined in the `address` config parameter.

{{< /note >}}

## Steps
Follow the steps below to create your permissioned network:

### Generate the PKI

 * Generate the PKI first before starting any services. 
 To do that, you have to:
    * create the certificates and key pairs for all Corda Enterprise Network Manager (CENM) services
    * decide what entities the nodes will trust  <mark>How do you do that? Any action needed here?</mark>


{{ < note > }} For more information on the certificate hierarchy, see [Certificate Hierarchy Guide](pki-guide.md). 
{{ < /note > }} 


#### Example Configuration

In the example below, the configuration file (`pki-generation.conf`) uses a placeholder value for 
`<IDENTITY_MANAGER_ADDRESS>` which you should replace with an actual value.

```guess
certificates = {
    "::CORDA_TLS_CRL_SIGNER" = {
        crl = {
            crlDistributionUrl = "http://<IDENTITY_MANAGER_ADDRESS>/certificate-revocation-list/tls"
            indirectIssuer = true
            issuer = "CN=Test TLS Signer Certificate, OU=Corda, O=R3 HoldCo LLC, L=New York, C=US"
            file = "./crl-files/tls.crl"
        }
    },
    "::CORDA_ROOT" = {
        crl = {
            crlDistributionUrl = "http://<IDENTITY_MANAGER_ADDRESS>/certificate-revocation-list/root"
            file = "./crl-files/root.crl"
        }
    }
    "::CORDA_SUBORDINATE" = {
        crl = {
            crlDistributionUrl = "http://<IDENTITY_MANAGER_ADDRESS>/certificate-revocation-list/subordinate"
            file = "./crl-files/subordinate.crl"
        }
    },
    "::CORDA_IDENTITY_MANAGER",
    "::CORDA_NETWORK_MAP"
}
```

This configuration is useful if you want to generate the certificates in the PKI without CRL extensions, in which case you cannot update them later or use certificate revocation. If you do not need to use certificate revocation, use the following configuration:

```guess
certificates = {
    "::CORDA_TLS_CRL_SIGNER",
    "::CORDA_ROOT",
    "::CORDA_SUBORDINATE",
    "::CORDA_IDENTITY_MANAGER",
    "::CORDA_NETWORK_MAP"
}
```

{{< note >}}
The passwords for the key stores are defaulted to “password” and the passwords for the trust stores are defaulted to “trustpass”. To change them in the configuration setting, see [Public Key Infrastructure (PKI) Tool](pki-tool.md)).

{{< /note >}}

#### Run The Tool

* Generate the required certificate stores and key pairs using the [Public Key Infrastructure (PKI) Tool](pki-tool.md). 
* Extract the PKI tool distribution zip archive to a chosen location, and run it using the following command:

    ```bash
    java -jar pkitool.jar --config-file pki-generation.conf
    ```
    This will produce the following set of files: <mark>Are these acronyms below described anywhere?</mark>
    * "key-stores/corda-identity-manager-keys.jks` - Contains the key pairs for the Identity Manager service which are used for signing CSRs and CRRs
    * `key-stores/corda-network-map-keys.jks` - Contains the key pairs for the Network Map service which are used for signing the Network Map and Network Parameters
    * `trust-stores/network-root-truststore.jks` - Contains the network root certificate and the TLS CRL signer certificate which are used by nodes to verify that responses from other participants on the network are valid.

If you run the PKI tool with the first example config, a further set of CRL files will be created. Although these files are not required to get a basic network up and running, additional functionalities such as certificate revocation support (CRS), will be available for you to use when required.

### Start the Identity Manager service

Before running the service, copy the Identity Manager jar along with the `corda-identity-manager-keys.jks` file to the 
Identity Manager machine (or directory location if running locally).

#### Example Configuration

This example provides a sample configuration (`identity-manager.conf`) for the Identity Manager service, using automatic
approval and local signing for CSRs:

```docker
address = "localhost:10000"

database {
    driverClassName = org.h2.Driver
    url = "jdbc:h2:file:./identity-manager-persistence;DB_CLOSE_ON_EXIT=FALSE;LOCK_TIMEOUT=10000;WRITE_DELAY=0;AUTO_SERVER_PORT=0"
    user = "example-db-user"
    password = "example-db-password"
}

shell {
    sshdPort = 10002
    user = "testuser"
    password = "password"
}

localSigner {
    keyStore {
        file = corda-identity-manager-keys.jks
        password = "password"
    }
    keyAlias = "cordaidentitymanagerca"
    signInterval = 10000
    # This CRL parameter is not strictly needed. However if it is omitted, then revocation cannot be used in the future so it makes sense to leave it in.
    crlDistributionUrl = "http://"${address}"/certificate-revocation-list/doorman"
}

workflows {
    "issuance" {
        type = ISSUANCE
        updateInterval = 10000
        plugin {
            pluginClass = "com.r3.enmplugins.approveall.ApproveAll"
        }
    }
}

```
[identity-manager-test-minimum-valid.conf](https://github.com/corda/network-services/blob/release/1.2/services/src/test/resources/v1.1-configs/identity-manager/identity-manager-test-minimum-valid.conf)

{{< note >}}
The example uses a local h2 database. You can modify this to point to a separate DB instance by modifying the `database` section. 
See the “Database properties” section of [Identity Manager Service](identity-manager.md) for more information.

{{< /note >}}

#### Run The Service
* Run the Identity Manager service via:

```bash
java -jar identitymanager.jar --config-file identity-manager.conf
```
You will see the following message printed to the console if your startup is successful:

```guess
Binding Shell SSHD server on port <SHELL_PORT>
Network management web services started on <IDENTITY_MANAGER_ADDRESS> with [RegistrationWebService, MonitoringWebService]
```

### Register your Notary with the Identity Manager

* Register the Notary nodes with the Identity Manager before the Network Map service can be initialised. This is because the list of trusted notaries is stored within the Network Parameters, which have to be passed to the Network Map service during initialisation.

* Copy the truststore containing the network root certificate (`network-root-truststore.jks`) to the Notary machine along with a valid Corda jar (e.g. Corda OS 4.0).

#### Example Configuration

This is an example `node.conf` file, with dummy values for the end points. As these endpoints are dependent on the setup of the machines, replace them with their true values (e.g. IPs addresses for machines).

```guess
myLegalName="O=NotaryA,L=London,C=GB"
notary {
    validating=false
}

networkServices {
  doormanURL="http://<IDENTITY_MANAGER_ADDRESS>"
  networkMapURL="http://<NETWORK_MAP_ADDRESS>"
}

devMode = false

sshd {
  port = 2222
}

p2pAddress="<NOTARY_HOST>:30000"
rpcUsers=[
  {
    user=testuser
    password=password
    permissions=[
        ALL
    ]
  }
]

rpcSettings {
  address = "<NOTARY_HOST>:30001"
  adminAddress = "<NOTARY_HOST>:30002"
}
```

#### Run Registration

```bash
java -jar corda.jar --initial-registration --network-root-truststore-password trustpass --network-root-truststore network-root-truststore.jks
```

This step should result in the node successfully registering with the Identity Manager, creating a node info file in the
process. 
* Copy the node info file to the Network Map machine as it is needed for initialising the network parameters.

    {{< note >}}
    The `--initial-registration` flag was deprecated in the most recent Corda version in favour of `initial-registration` which may result in a warning being printed.

    {{< /note >}}

### Set the initial network parameters

* Before initialising the parameters, copy the `corda-network-map-keys.jks` and `network-root-truststore.jks` files over to the Network Map machine, along with the Network Map distribution zip which should also be unpacked.

* Set the network parameters before starting the Network Map service.

    {{ < note> }}The network parameters are a set of values that every node participating in the zone needs to agree on and use to
correctly communicate with each other. {{ </ note>}}.

* To set them, run the Network Map jar in a special “set network parameters” mode which requires a parameter configuration file to be passed. This step requires both a Network Map service configuration and a network parameters configuration. See [Updating the network parameters](updating-network-parameters.md) for more information on processing of setting and updating the parameters.

#### Example Configuration

##### Service

This is a sample configuration (`network-map.conf`) for the Network Map service, using automatic approval and local signing for updates to the network map and parameters:

```docker
address = "localhost:20000"

database {
    driverClassName = org.h2.Driver
    url = "jdbc:h2:file:./network-map-persistence;DB_CLOSE_ON_EXIT=FALSE;LOCK_TIMEOUT=10000;WRITE_DELAY=0;AUTO_SERVER_PORT=0"
    user = "example-db-user"
    password = "example-db-password"
}

shell {
    sshdPort = 20002
    user = "testuser"
    password = "password"
}

localSigner {
    keyStore {
        file = corda-network-map-keys.jks
        password = "password"
    }
    keyAlias = "cordanetworkmap"
    signInterval = 10000
}

pollingInterval = 10000
checkRevocation = false

```

[network-map-test-minimum-valid.conf](https://github.com/corda/network-services/blob/release/1.2/services/src/test/resources/v1.1-configs/network-map/network-map-test-minimum-valid.conf)

{{< note >}}
This example uses a local h2 database. You can modify this to point to a separate DB instance by modifying the `database` section. See the “Database properties” section of [Network Map Service](network-map.md) for more information.

{{< /note >}}

##### Network Parameters

This is a sample configuration file (`network-parameters.conf`) that is passed to the service when you set the network parameters. The <NOTARY_NODE_INFO_FILENAME> should correspond to the node info file copied across during the previous step ([Register your Notary with the Identity Manager](#register-your-notary-with-the-identity-manager)).

```guess
notaries : [
  {
    notaryNodeInfoFile: <NOTARY_NODE_INFO_FILENAME>
    validating: false
  }
]
minimumPlatformVersion = 3
maxMessageSize = 10485760
maxTransactionSize = 10485760
eventHorizonDays = 30
```
#### Setting the initial network parameters

The following command should initialise the network parameters, including the Notary node that was registered in the
previous step:

```bash
java -jar networkmap.jar --config-file network-map.conf --set-network-parameters network-parameters.conf --network-truststore network-root-truststore.jks --truststore-password trustpass --root-alias cordarootca
```

Upon successfully setting the initial parameters, you will see the follwing details displayed to the console:

```guess
Saved initial network parameters to be signed:
NetworkParameters {
  minimumPlatformVersion=3
  notaries=[NotaryInfo(identity=O=NotaryA, L=London, C=GB, validating=false)]
  maxMessageSize=10485760
  maxTransactionSize=10485760
  whitelistedContractImplementations {

  }
  eventHorizon=PT720H
  modifiedTime=<ACTUAL_MODIFIED_TIME>
  epoch=1
}
```

### Start the Network Map service

You can run the Network Map service via:

```bash
java -jar networkmap.jar --config-file network-map.conf
```

Upon successful startup, you will see the following details printed to the console:

```guess
Binding Shell SSHD server on port <SHELL_PORT>
Network management web services started on <NETWORK_MAP_ADDRESS> with [NetworkMapWebService, MonitoringWebService]
```

### Start your Notary service

The two main components of the Network should now be fully functional and hence the Notary node can be started:

```bash
java -jar corda.jar
```
## Further steps

Nodes should now be able to register and join the network. To do this they will need to have a node configuration file
similar to the example Notary configuration above (including the correct Network Map and Identity Manager endpoints) as
well as a copy of the `network-root-truststore.jks` file.

You can inspect each service via the interactive shell. For example, for the above configurations, the
Network Map shell can be accessed by connecting to the Network Map service via ssh, using the following:
* username
* password
* port configured
as shown in the example `network-map.conf`. 

Use the following command if running a network locally:

```bash
ssh testuser@localhost -p 20002
```
Note: For the purpose of this exercise, the simplest settings have been used for all the services. However, you can configure them to run with more features, such as the following:

* Certificate revocation support (“Revocation workflow ” section within [Identity Manager Service](identity-manager.md))
* More advanced CSR approval workflows (“Certificate approval mechanism” section within [Identity Manager Service](identity-manager.md))
* External signing of CSRs/Network Map updates including HSM integration ([Signing Services](signing-service.md))

{{< note >}}For more information, see the configuration sections within [Identity Manager Service](identity-manager.md) and [Network Map Service](network-map.md). {{< /note >}}

## Bundled Service alternative

You can simplify the steps mentioned above by using a single service which bundles multiple services together. 
* To do this, download Bundled Service distribution zip. The Service configuration files will remain unchanged.

The standard run command form is generalised for running multiple services:

```bash
java -jar bundled.jar -f <conf_1> ... -f <conf_n> -S <service_1> ... -S <service_n>
```

For instance, you can run Identity Manager and Network Map in parallel:

```bash
java -jar bundled.jar -f identity-manager.conf -f network-map.conf -S IDENTITY_MANAGER -S NETWORK_MAP
```

Upon successful startup, you will see the following details printed to the console:

```guess
Binding Shell SSHD server on port <SHELL_PORT>
Network management web services started on <IDENTITY_MANAGER_ADDRESS> with [RegistrationWebService, MonitoringWebService]
Binding Shell SSHD server on port <SHELL_PORT>
Network management web services started on <NETWORK_MAP_ADDRESS> with [NetworkMapWebService, MonitoringWebService]
```

### Backward compatibility

You could also run this service as a template for one of the services you want to run. The Bundled service deduces which service to run from the configuration file, making this feature backward compatible with CENM 1.1.

For example, you can implicitly run Identity Manager:

```bash
java -jar bundled.jar -f identity-manager.conf
```

Upon successful startup, you should see the following details printed to the console:

```guess
Deduced Identity Manager service from provided config file...
Binding Shell SSHD server on port <SHELL_PORT>
Network management web services started on <IDENTITY_MANAGER_ADDRESS> with [RegistrationWebService, CertificateRevocationWebService, MonitoringWebService]
```

