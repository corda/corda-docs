---
aliases:
- /config-identity-manager-parameters.html
date: '2020-01-08T09:59:25Z'
menu:
  cenm-1-3:
    identifier: cenm-1-3-config-identity-manager-parameters
    parent: cenm-1-3-configuration
    weight: 220
tags:
- config
- identity
- manager
- parameters
title: Identity Manager Configuration Parameters
---


# Identity Manager Configuration Parameters

The Configuration references for the Identity Manager service are given below:


* **address**:
The host and port on which the service runs


* **database**:
See [CENM Database Configuration](config-database.md)


* **shell**:
*(Optional)* See [Shell Configuration Parameters](config-shell.md)


* **localSigner**:
*(Optional)* Configuration of the local signer for the Identity Manager service. Useful for debugging, testing or when Hardware Security Module (HSM) support is not available.


  * **keyStore**:
  Configuration for key store containing the Identity Manager service key pair.
    * **file**:
    Path to the key store file containing the signing keys for the Identity Manager service.
    * **password**:
    Key store password.
    * **keyAlias**:
    Key alias under which the key can be found in the key store.
    * **keyPassword**:
    Password for the ‘keyAlias’ key entry within the key store.
  * **signInterval**:
  Define the frequency for triggering the signing process (in milliseconds).
  * **timeout**:
  *(Optional)* The maximum time allowed for executing the signing process (in milliseconds). Defaults
  to 30 seconds. If the timeout threshold is reached, then the signing process will abort and wait
  before retrying. The wait time after each failure is determined by an exponential backoff strategy.


* **crlDistributionUrl**:
*(Optional)* REST endpoint under which the certificate revocation list issued by the Identity Manager can be obtained.
It is needed as this URL is encoded in certificates issued by the Identity Manager.




* **workflows**:

  * **workflow-id**:

  * **type**:
  either ISSUANCE or REVOCATION, see below for details of each


  * **enmListener**:
  Info on how the service will communicate with the rest of the ENM deployment.


    * **port**:
    The port that the service will bind to and other ENM components will connect to.


    * **verbose**:
    *(Optional)* Enables verbose logging for the socket layer


    * **reconnect**:
    Determines if a client should attempt to reconnect if the connection is dropped.


    * **ssl**:
    See [SSL Settings](config-ssl.md)




* **plugin**:

  * **pluginClass**:
  The main class of the plugin being loaded.

  {{< note >}}
  For automatic acceptance of requests, set this to the ApproveAll plugin (“com.r3.enmplugins.approveall.ApproveAll”)

  {{< /note >}}

  * **pluginJar**:
  *(Optional)* The absolute path to workflow plugin JAR file.


  * **config**:
  *(Optional)* a free-form map that allows options to be passed to the plugin class






* **“issuance workflow”**:

  * **updateInterval**:
  How often the Issuance Workflow Processor should synchronise Certificate Signing Request (CSR) statuses


  * **versionInfoValidation**:
  *(Optional)* Configuration for the validation of node version info during CSR submission


  * **minimumPlatformVersion**:
  *(Optional - defaults to -1)* The minimum platform version of Corda that a node needs to run, to successfully submit Certificate Signing Requests. The platform
  version is an integer value which increments on any release where any of the public APIs of the entire Corda platform changes. Setting this to a value of <1
  disables this behaviour, where the Identity Manager Service won’t check whether that platform version is passed from the node.


  {{< important >}}
  Whilst this value is optional, picking the correct value is essential for a zone operator as it forms the basis upon which compatibility and consensus are formed on the Network. It also commits potential members to specific versions of the Corda API. The value must be higher or equal to any other value specified in the Network Map and the corresponding Network Parameter configurations.
  {{< /important >}}


  * **newPKIOnly**:
  *(Optional - defaults to false)* A boolean that determines whether Certificate Signing Request (CSR) should be rejected for all nodes running an outdated version of Corda that does not support the new PKI (arbitrary length certificate chains).


* **“revocation workflow”**:
  * **crlCacheTimeout**:
  The number  of times the Revocation Workflow Processor needs to synchronise Certificate Revocation Requests (CRR) statuses, as well as the duration after the CRL cache in Revocation Web Service is cleared.
  * **crlFiles**:
A list of CRLs hosted by the Identity Manager Service, in addition to the CRLs hosted by node operators. This allows the Identity Manager Service to host the CRLs for node operators that will not host their own CRL infrastructure, at the cost of not being able to revoke TLS certificates issued by the node.


* **adminListener**:
To use the RPC API in the Identity Manager Service, you must define a configuration property called `adminListener`.
You can add `port`, `reconnect`, and `verbose`. Also, this property has an SSL field - see: [SSL Settings](config-ssl.md).

{{% important %}}
If the `adminListener` property is present in the configuration, this means that the service must only be used via Admin RPC. In this case, the `shell` configuration property will be disabled. The `shell` and `adminListener` properties cannot be used in the configuration at the same time.
{{% /important %}}


### Admin RPC Interface

To enable the CENM CLI to send commands to the Identity Manager Service,
you must enable the RPC API by defining a configuration property called `adminListener`.
For example, add the following to the service configuration:

```guess
...
adminListener {
    port = 5050
    reconnect = true
    ssl {
        keyStore {
            location = exampleSslKeyStore.jks
            password = "password"
        }
        trustStore {
            location = exampleSslTrustStore.jks
            password = "trustpass"
        }
    }
}
...
```

* **port**:
  Port number to listen to for Admin RPC connections.
* **verbose**:
  *(Optional)* Enables verbose logging for the socket layer. Defaults to false.
* **reconnect**:
  *(Optional)* Determines if a client should attempt to reconnect if the connection is dropped. Defaults to true.
* **ssl**:
  See [SSL Settings](config-ssl.md)


## Obfuscated configuration files

To view the latest changes to the obfuscated configuration files, see [Obfuscation configuration file changes](obfuscated-config-file-changes.md).
