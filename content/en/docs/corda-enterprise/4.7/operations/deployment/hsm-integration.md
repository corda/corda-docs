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
    - The HSM implementation, `AWSCloudCryptoService.java`

We'll go through each of these files and use them as a basis for explaining how to integrate an HSM with Corda Enterprise.

## The HSM configuration file

In the example HSM implementation the HSM configuration file `AWSCloudConfiguration.java` contains the following code:

```java
package com.r3.corda.hsm.sample.aws;

import com.r3.corda.utils.cryptoservice.CryptoServiceCredentials;
import net.corda.nodeapi.internal.config.CustomConfigParser;

@CustomConfigParser(parser = AWSCloudConfigurationParser.class)
public class AWSCloudConfiguration implements CryptoServiceCredentials<AWSCloudConfiguration> {
    private String username;
    private String password;
    private String partition;

    public AWSCloudConfiguration(
            String username,
            String password,
            String partition) {
        this.username = username;
        this.password = password;
        this.partition = partition;
    }

    public boolean samePartition(AWSCloudConfiguration other) {
        // Public keys are shared between multiple HSM users, so we have to use different aliases within the same HSM instance.
        return partition.equals(other.partition);
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getPartition() {
        return partition;
    }
}
```

The HSM configuration contains the basic configuration information required by the HSM, and implements `CryptoServiceCredentials`. When implementing `CryptoServiceCredentials` the only argument should be the configuration class itself.

Ensure that the configuration options required by the HSM correspond to the configuration options in this file.

The `samePartition` section is required by Corda Enterprise tools to manage multiple public keys being used to access shared HSMs.

## The configuration parser

The configuration parser file `AWSCloudConfigurationParser.java` implements the `ConfigParser` API, and contains the following code:

```java
package com.r3.corda.hsm.sample.aws;

import com.typesafe.config.Config;
import net.corda.nodeapi.internal.config.ConfigParser;
import org.jetbrains.annotations.NotNull;

public class AWSCloudConfigurationParser implements ConfigParser<AWSCloudConfiguration> {
    @Override
    public AWSCloudConfiguration parse(@NotNull Config config) {
        return new AWSCloudConfiguration(
                config.getString("username"),
                config.getString("password"),
                config.getString("partition")
        );
    }
}
```

The configuration parser will be unique to the HSM implementation, and is used to deserialise HSM configuration to a java class.

## The HSM implementation



## The factory class

```java
package com.r3.corda.hsm.sample.aws;

import com.r3.corda.utils.cryptoservice.CryptoServiceProvider;
import net.corda.nodeapi.internal.cryptoservice.CryptoService;
import net.corda.nodeapi.internal.cryptoservice.CryptoServiceException;
import org.jetbrains.annotations.NotNull;

import javax.security.auth.x500.X500Principal;

public class AWSCloudCryptoServiceProvider implements CryptoServiceProvider<AWSCloudConfiguration> {
    private Class configurationType = AWSCloudConfiguration.class;

    @NotNull
    @Override
    public String getName() {
        return AWSCloudCryptoService.NAME;
    }

    @NotNull
    @Override
    public Class getConfigurationType() {
        return configurationType;
    }

    public CryptoService createCryptoService(X500Principal x500Principal, AWSCloudConfiguration configuration) throws CryptoServiceException {
        return AWSCloudCryptoService.fromConfiguration(x500Principal, configuration);
    }
}
```
