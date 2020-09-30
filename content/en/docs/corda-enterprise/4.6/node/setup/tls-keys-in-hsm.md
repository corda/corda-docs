---
date: '2020-05-03T12:00:00Z'
menu:
  corda-enterprise-4-6:
    parent: corda-enterprise-4-6-corda-nodes-configuring
tags:
- hsm
- tls
- keys
title: Storing node TLS keys in HSM without running the Corda Enterprise Firewall
weight: 40
---

# Storing node TLS keys in HSM without running the Corda Enterprise Firewall

You can store node TLS keys in HSM by using the optional `tlsCryptoServiceConfig` and `tlsKeyAlias` configuration fields in the `enterpriseConfiguration` [configuration block](corda-configuration-fields.md#enterpriseConfiguration) of the [node configuration file](corda-configuration-file.md).

## Configuration

### Configuration fields in `node.conf`

* `tlsCryptoServiceConfig` is an optional crypto service configuration to store node's TLS private key in HSM. If this option is missing, the TLS private key will be stored in the file-based `sslkeystore.jks`. Parameters:
  * `cryptoServiceName`: the name of the CryptoService provider to be used.
  * `cryptoServiceConf`: the path to the configuration file for the CryptoService provider.

* `tlsKeyAlias` is the alias of the TLS key. It can consist of up to 100 lowercase alphanumeric characters and the hyphen (-). Default value: `cordaclienttls`.


### Related configuration options

You should also consider the following related configuration options in the node configuration file, as follows:

* `messagingServerSslConfiguration`: TLS configuration used to connect to external P2P Artemis message server. Required when `messagingServerExternal` = `true`. Also, it can be optionally used with embedded Artemis when external Bridge is configured.

* `artemisCryptoServiceConfig`: an optional crypto service configuration which will be used for HSM TLS signing when interacting with the Artemis message server. This option only makes sense when `messagingServerSslConfiguration` is specified: either to connect to a standalone Artemis messaging server, or when external Bridge is configured. If this option is missing, the local file system will be used to store private keys inside JKS key stores, as defined by `messagingServerSslConfiguration`.

* `messagingServerConnectionConfiguration`, `messagingServerBackupAddresses`, and `artemisCryptoServiceConfig` must be inside the `enterpriseConfiguration` section, but not inside `messagingServerSslConfiguration`.

### HA Utilities and self-signed internal Artemis SSL keystore

The HA Utilities tool produces the following files:

* `artemisbridge.jks`: used by the standalone bridge. The path to this file should be specified in the `artemisSSLConfiguration` section in `firewall.conf`.
* `artemisnode.jks`: optionally used by the node. When used, the path to this file should be specified in the `messagingServerSslConfiguration` section in `node.conf`.
* `artemis.jks`: used by the standalone P2P Artemis broker.
* `artemis-truststore.jks`: must be placed together with any of the above keystore files.

### Storing TLS certificates in HSM

A file-based keystore is still required to store TLS certificates, even if corresponding TLS keys are stored in CryptoService.

{{< table >}}

| CryptoService config       | Certificate store|
|:---------------------------|:----------------|
| tlsCryptoServiceConfig     | sslkeystore.jks|
| artemisCryptoServiceConfig | as configured by `messagingServerSslConfiguration.sslKeystore`|

{{< /table >}}


## Migration notes

To migrate from a file-based node's TLS keystore to HSM:

1. Add a `tlsCryptoServiceConfig` section the node configuration file.
2. Renew the TLS certificate and keys, as described in  the [Renewing TLS certificates](../../ha-utilities.md#renewing-tls-certificates) section in [HA Utilities](../../ha-utilities.md).
