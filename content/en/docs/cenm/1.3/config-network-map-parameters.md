---
aliases:
- /config-network-map-parameters.html
date: '2020-01-08T09:59:25Z'
menu:
  cenm-1-3:
    identifier: cenm-1-3-config-network-map-parameters
    parent: cenm-1-3-configuration
    weight: 230
tags:
- config
- network
- map
- parameters
title: Network Map Configuration Parameters
---


# Network Map Configuration Parameters

Configuration reference for the Network Map Service


* **address**:
The host and port on which the service runs


* **database**:
See [CENM Database Configuration](config-database.md)


* **shell**:
*(Optional)*  See [Shell Configuration Parameters](config-shell.md)


* **enmListener**:
Details on how the service will communicate with the rest of the ENM deployment.
<!-- Is ENM spelt out ealier in this doc?-->


* **port**:
Port that the service will bind to and other ENM components will connect to.


* **verbose**:
*(Optional)* Enables verbose logging for the socket layer


* **reconnect**:
Informs whether a client should attempt to reconnect if the connection is dropped.


* **ssl**:
See [SSL Settings](config-ssl.md)




* **checkRevocation**:
If set to true, the Network Map will check with the Identity Manager’s revocation service to find out if the registering node is revoked.


* **pollingInterval**:
How often nodes registering with the network map should check back for new entries.


* **identityManager**:
Details where the issuance service is on the network


* **host**:
The host the Identity Manager is running on


* **port**:
The port that its enmListener is bound to


* **ssl**:
See [SSL Settings](config-ssl.md)




* **revocation**:
Details where the revocation service is on the network


* **host**:
The host that the Identity Manager is running on


* **port**:
The port that its enmListener is bound to


* **ssl**:
See [SSL Settings](config-ssl.md)




* **localSigner**:
*(Optional)* Configuration of the local signer for the Network Map service. Useful for debugging, testing or when HSM support is not available.
* **keyStore**:
Configuration for key store containing the Network Map key pair.


* **file**:
Path to the key store file containing the signing keys for the Network Map service.


* **password**:
Key store password.




* **keyAlias**:
Key alias under which the key can be found in the key store.


* **keyPassword**:
Password for the ‘keyAlias’ key entry within the key store.


* **signInterval**:
The number of times the signing process should be triggered (in milliseconds).


* **timeout**:
*(Optional)* The maximum time allowed for executing the signing process (in milliseconds). Defaults
to 30 seconds. If the timeout threshold is reached, then the signing process will abort and wait before retrying. The wait time after each failure is determined by an exponential backoff strategy.




* **versionInfoValidation**:
*(Optional)* Configuration for the validation of node version info while publishing node info to the Network Map


* **minimumPlatformVersion**:
*(Optional - defaults to -1)* The minimum platform version of Corda that a node needs to run, to successfully publish its node info to the Network Map. The platform version is an integer value which increments on any release where any of the
public API of the entire Corda platform changes. Setting this to a value of <1 disables this behaviour, where the Network Map Service won’t check that the platform version is passed from the node. However checks against Network Parameters
will still be done.


{{< important >}}
Whilst this value is optional, picking the correct value is essential
for a zone operator as it forms the basis upon which compatibility and consensus
are formed on the Network. It also commits potential members to specific versions
of the Corda API. Value must be equal to the one specified in Network Parameters.


{{< /important >}}


* **newPKIOnly**:
*(Optional - defaults to false)* A boolean that determines whether node info publishing should be rejected for all nodes running an outdated
version of Corda that does not support the new PKI (arbitrary length certificate chains).

* **adminListener**:
To use the RPC API in the Signing Service, you must define a configuration property called `adminListener`.
You can add `port`, `reconnect`, and `verbose`. Also, this property has an SSL field - see: [SSL Settings](config-ssl.md).
If `adminListener` is present, the `shell` property can not be defined. Only one of these properties can be in the configuration.
