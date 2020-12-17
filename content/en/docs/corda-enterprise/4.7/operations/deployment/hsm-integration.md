---
date: '2020-12-16T01:00:00Z'
menu:
  corda-enterprise-4-7:
    identifier: corda-enterprise-4-7-operations-guide-deployment-hsm-integration
    parent: corda-enterprise-4-7-operations-guide-deployment-hsm
    name: "Integrating an HSM"
tags:
- operations
- deployment
- hsm
- integration
title: Integrating an HSM
weight: 60
---

# Integrating an HSM

When integrating an HSM for use with Corda Enterprise, there are specific interfaces that

The example HSM is available in the Corda Enterprise utilities package `com.r3.corda:corda-enterprise-utils:4.7`, and contains four main files:

  - A configuration file, `AWSCloudConfiguration.java`
  - A configuration parser, `AWSCloudConfigurationParser.java`
  - A factory class `AWSCloudCryptoServiceProvider.java`
  - The HSM integration, `AWSCloudCryptoService.java`
  - A file specifying the java class that implements the `CryptoServiceProvider` interface, `resources/META-INF/services/com.r3.corda.utils.CryptoServiceProvider`

We'll go through each of these files and use them as a basis for explaining how to integrate an HSM with Corda Enterprise.

## The HSM configuration file

In the example HSM implementation the HSM configuration file `AWSCloudConfiguration.java` contains the following code:

{{< codesample file="/content/en/docs/corda-enterprise/codesamples/AWSCloudConfiguration.java" >}}

The HSM configuration contains the basic configuration information required by the HSM, and implements `CryptoServiceCredentials`. When implementing `CryptoServiceCredentials` the only argument should be the configuration class itself.

Ensure that the configuration options required by the HSM correspond to the configuration options in this file.

The `samePartition` section is required by Corda Enterprise tools to manage multiple public keys being used to access shared HSMs.

## The configuration parser

The configuration parser file `AWSCloudConfigurationParser.java` implements the `ConfigParser` interface, and contains the following code:

{{< codesample file="/content/en/docs/corda-enterprise/codesamples/AWSCloudConfigurationParser.java" >}}

The configuration parser will be unique to the HSM implementation, and is used to deserialise HSM configuration to a java class.

## The factory class

The factory class `AWSCloudCryptoServiceProvider` implements the `CryptoServiceProvider` interface, and contains the following code:

{{< codesample file="/content/en/docs/corda-enterprise/codesamples/AWSCloudCryptoServiceProvider.java" >}}

The class takes the configuration information and creates an instance of the `CryptoService` - in this case `AWSCloudCryptoService` - including an X500 identifier and the configuration information defined in `AWSCloudConfiguration.java`.

## Java class specification file

This file is required in any implementation of an HSM. It must have the following filepath: `src/main/resources/META-INF/services/com.r3.corda.utils.cryptoservice.CryptoServiceProvider`.

The file must contain the fully qualified name of the Java class that implements the `CryptoServiceProvider` interface. In this example implementation, the contents of the file is:

{{< codesample file="/content/en/docs/corda-enterprise/codesamples/com.r3.corda.utils.CryptoServiceProvider" >}}

## The HSM integration

The HSM integration will differ depending on the mechanics of any given HSM, but in this example we've used a Java helper class `JCACryptoService` to reduce the complexity. This class was created to facilitate the integration of further HSM vendors that provide a JCA provider.

```java
public class AWSCloudCryptoService extends JCACryptoService implements CryptoServiceAdmin {
    public static String NAME = "AWS_CLOUD_SAMPLE";
    private static Logger logger = LoggerFactory.getLogger(AWSCloudCryptoService.class);
    private LoginManager loginManager = LoginManager.getInstance();
    private AWSCloudConfiguration config;

    AWSCloudCryptoService(KeyStore keyStore, Provider provider, X500Principal x500Principal, AWSCloudConfiguration config) {
        super(keyStore, provider, x500Principal);
        this.config = config;
    }
```

The above code block also includes the HSM configuration, and defines the HSM class, including `keyStore`, `Provider`, `X500Principal`, and `config` arguments. For full details, see the [JCACryptoService definition](../../../codesamples/JCACryptoService.kt).

The HSM integration must include code the creating keypairs, retrieving keys, signing, creating wrapping keys, wrapping private keys, and error handling.

The example HSM integration includes code to create a keypair:

```java
public PublicKey generateKeyPair(String alias, SignatureScheme scheme) throws CryptoServiceException {
    return withAuthentication(() -> {
        String publicAlias = toPublic(alias);
        String privateAlias = toPrivate(alias);
        logger.trace("CryptoService(action=generate_key_pair_start;alias='" + alias + "';scheme='" + scheme + "'");
        // Multiples keys can be stored under the same alias, so we need to check existing keys first
        Key publicKey;
        try {
            publicKey = getKeyStore().getKey(publicAlias, null);
        } catch (Exception e) {
            throw new CryptoServiceException("Exception getting public key from key store for alias '" + alias + "'", e, false);
        }

        if (publicKey != null) {
            throw new CryptoServiceException("Public key already exists in key store for alias '" + publicAlias + "'", null, false);
        }

        Key privateKey;
        try {
            privateKey = getKeyStore().getKey(privateAlias, null);
        } catch (Exception e) {
            throw new CryptoServiceException("Exception getting private key from key store for alias '" + alias + "'", e, false);
        }

        if (privateKey != null) {
            throw new CryptoServiceException("Private key already exists in key store for alias '" + publicAlias + "'", null, false);
        }

        KeyPairGenerator keyPairGenerator = keyPairGeneratorFromScheme(scheme, publicAlias, privateAlias, false, true);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        try {
            getKeyStore().setKeyEntry(privateAlias, keyPair.getPrivate(), null, selfSign(scheme, keyPair));
        } catch (Exception e) {
            throw new CryptoServiceException("Exception setting private key in key store", e, false);
        }

        logger.trace("CryptoService(action=generate_key_pair_end;alias='" + alias + "';scheme='" + scheme + "'");
        return Crypto.toSupportedPublicKey(keyPair.getPublic());
    });
}
```

The example integration includes error handling and authentication with the HSM.

The full HSM integration example is as follows:

{{< codesample file="/content/en/docs/corda-enterprise/codesamples/AWSCloudCryptoService.java" >}}
