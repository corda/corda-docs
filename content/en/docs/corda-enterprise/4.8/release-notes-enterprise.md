---
date: '2020-04-07T12:00:00Z'
menu:
  corda-enterprise-4-8:
    identifier: corda-enterprise-4-8-release-notes
    name: "Release notes"
tags:
- release
- notes
- enterprise
title: Corda Enterprise release notes
weight: 1
---


# Corda Enterprise release notes

## Corda Enterprise 4.8 release overview

This release introduces a number of new features and enhancements, and fixes for known issues from previous releases.

Just as prior releases have brought with them commitments to wire and API stability, Corda 4.8 comes with those same guarantees.

States and apps valid in Corda 3.0 and above are usable in Corda 4.8.

The main new features and enhancements in Corda Enterprise 4.8 are listed below:

* Added support for version 19c of the [Oracle database as a notary database](platform-support-matrix.md).
* Added support for Azure Managed Identities as authentication when using an [Azure Key Vault HSM](node/operating/cryptoservice-configuration.md#Azure-KeyVault).
* Metrics can now be configured to use [time-window reservoirs](node-metrics.md) for data collection.
* Additional metrics have been added for [tracking notary latency](notary/faq/notary-latency-monitoring.md).
* Confidential identities now support [Utimaco and Gemalto Luna HSMs](platform-support-matrix.md).

{{< note >}}
This page only describes functionality specific to Corda Enterprise 4.8. However, as a Corda Enterprise customer, you can also make full use of the entire range of features available as part of Corda open source releases.

See the [Corda open source release notes](../../corda-os/4.8/release-notes.md) for information about new features, enhancements, and fixes shipped as part of Corda 4.8.

{{< /note >}}

## New features and enhancements

### Notary database support updates

The JPA notary now supports Oracle DB version 19c. This database is supported until April 30th, 2027, providing long-term support for this Corda release.

### Azure Managed Identities authentication

When using an Azure Key Vault HSM with Corda Enterprise, you can now use an existing Azure Managed Identities service as authentication.


### Additional notary metrics

Two new metrics have been added that can be used to help calculate notary latency. The `StartupQueueTime` and `BatchSignLatency` metrics can be used to help when calculating notary latency and assessing notary worker performance across a notary cluster.

* The `StartupQueueTime` represents the time a flow has been queued before starting, in milliseconds.
* The `BatchSignLatency` metric represents the time elapsed during a batch signature in milliseconds.

### Time-window metrics gathering

Timer and histogram metrics can now be configured to use time-window data gathering. Time-window data gathering collects all data points for a given time window, allowing outlying data points to be properly represented.

### Other changes and improvements

* Confidential identities now support [Utimaco and Gemalto Luna HSMs](platform-support-matrix.md).
* One of the flow management console parameters has changed.

## Platform version change

The platform version of Corda 4.8 has been bumped up from 9 to 10.

For more information about platform versions, see [Versioning](cordapps/versioning.md).

## Fixed issues

* A security issue has been fixed that affects notary systems that use the JPA notary implementation in an HA configuration, and when the notary backing database has been set up using the Corda database management tool. The new version of the Corda database management tool must be re-run for the fix to take effect.
* We have fixed several issues that caused memory leaks. As a result, we have added a new node configuration field - `enableURLConnectionCache` - and we have modified the `attachmentClassLoaderCacheSize` node configuration field. See the [node configuration fields page](node/setup/corda-configuration-fields.md#enterpriseconfiguration) for details.
* Fixed a bug where the node would be unable to resolve transaction chains that contain states or contracts that it do not relate to installed CorDapps.
* Fixed an issue causing flow state, invocation source, and suspension source filters to break in the node GUI.
* Fixed an issue causing transaction verification to be performed outside of the attachments class loader.
* Fixed an issue where HA utilities did not log a message stating that the master key is not needed when using a native mode HSM.
* Fixed an issue where HA utilities did not log information about the freshIdentitiesConfiguration.
* Fixed an issue where a log message incorrectly stated that a confidential identity key was created.
* Fixed an issue that could cause a node to hang if shut down using SIGTERM.
* Fixed an issue where the attachment presence cache contained the attachment contents.
* Fixed an issue where the Corda Firewall throws an error when retrieving version information.
* Fixed an issue where the HA utilities created erroneous logs when using confidential identities.

## Known issues

* When using the Oracle 12c database, the JDBC driver can hang when it is blocked by an empty entropy pool at random times.


{{< note >}}
The list above contains known issues specific to Corda Enterprise 4.8. See the release notes for previous Corda Enterprise releases for information about known issues specific to those versions.
{{< /note >}}
