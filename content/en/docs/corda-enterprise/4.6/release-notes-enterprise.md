---
date: '2020-04-07T12:00:00Z'
menu:
  corda-enterprise-4-6:
    identifier: "corda-enterprise-4-6-release-notes"
    name: "Release notes"
tags:
- release
- notes
- enterprise
title: Corda Enterprise release notes
weight: 1

---


# Corda Enterprise release notes




## Corda Enterprise 4.6 release executive summary

This release extends the [Corda Enterprise 4.5 release](../4.5/release-notes-enterprise.md) with further performance, resilience, and operational improvements.

Corda Enterprise 4.6 supports Linux for production deployments, with Windows and macOS support for development and demonstration purposes only. See the Corda Enterprise [platform support matrix](platform-support-matrix.md) for more information.

Corda Enterprise 4.6 is operationally compatible with Corda (open source) 4.x and 3.x, and Corda Enterprise 4.5, 4.4, 4.3, 4.2, 4.1, 4.0, and 3.x. See the [Corda (open source) release notes](../../corda-os/4.6/release-notes.md) for more information.

{{< warning >}}

**Important note about running the initial node registration command**

In Corda Enterprise 4.6, database migrations are run on initial node registration **by default**.

To prevent this, use the `--skip-schema-creation` flag alongside the `--initial-registration` command.

The `initial-registration` command is described in [Node command-line options](node/node-commandline.md#sub-commands) and [Joining a compatibility zone](joining-a-compatibility-zone.md#joining-an-existing-compatibility-zone).

{{< /warning >}}


## New features and enhancements

### Ability to access new, remote RPC interfaces via Multi RPC Client

A new RPC Client, called the Multi RPC Client, has been added in Corda Enterprise 4.6.

Node operators can now use the Multi RPC client to interact with a Corda Enterprise node via any of the following custom, remote RPC interfaces:

* `net.corda.client.rpc.proxy.AuditDataRPCOps`: enables you to audit the log of RPC activity.
* `net.corda.client.rpc.proxy.FlowRPCOps`: enables you to retry a previously hospitalised flow.
* `net.corda.client.rpc.proxy.NodeFlowStatusRpcOps`: enables external applications to query and view the status of the flows which are currently under monitoring by the Flow Hospital.
* `net.corda.client.rpc.proxy.NodeHealthCheckRpcOps`: enables you to get a report about the health of the Corda Enterprise node.
* `net.corda.client.rpc.proxy.notary.NotaryQueryRpcOps`: enables you to perform a spend audit for a particular state reference.

All of these interfaces are located in the `:client:extensions-rpc` module. Corda Enterprise customers can extend these interfaces to add custom, user-defined functionality to help manage their Corda Enterprise nodes.

{{< note >}}
`COMPLETED`, `FAILED` and `KILLED` flows can only be queried when started by the `startFlowWithClientId` or `startFlowDynamicWithClientId` APIs.
{{< /note >}}

For more information, see the [Interacting with a node](../4.6/node/operating/clientrpc.md) documentation section or see [MultiRPCClient](https://api.corda.net/api/corda-enterprise/4.6/html/api/javadoc/net/corda/client/rpc/ext/MultiRPCClient.html) in the API documentation.

### Ability to query flow data via RPC and via the node shell

Corda Enterprise 4.6 introduces the ability to query flow checkpoint data. This helps node operators manage the set of flows currently in execution on their node, by giving operators the ability to a) identify one or more flows that did not complete as expected and b) retrieve status information relating to one or more flows.

Node operators can use one of the following methods to query flow status:

* They can use the new `net.corda.client.rpc.proxy.NodeFlowStatusRpcOps` interface to interact with their node and query flow status via RPC.
* They can query the node manually via the node shell, using the new `flowstatus` command.

Querying the node using either method enables node operators to:

* Return a list of all flows that have not completed as expected (suspended flows)
* Return all suspended flows that meet particular search criteria such as the following:
	* The flow is or is not compatible with the current Corda runtime environment.
	* The flow relates to a particular CorDapp.
	* The flow includes a particular flow class.
	* The flow was executed within a specific time window.
	* The flow is in a particular state.
	* The flow did not proceed beyond a specific progress step.
	* The flow remained stuck at a checkpoint for a particular length of time.
* Retrieve status information for one or more suspended flows

See the [Querying flow data](../4.6/node/operating/querying-flow-data.md) documentation section for more information.

### Host to Container SSH port mapping for Dockerform

When creating a Docker container, you can now map the SSH port on the host to the same port on the container. For more information, see [Optional configuration](node/deploy/generating-a-node.md#optional-configuration) in [Creating nodes locally](node/deploy/generating-a-node.md).

### Metering client for the Metering Collection Tool

You can now collect metering data from Corda Enterprise Nodes remotely. For information, see [Metering client for the Metering Collection Tool](metering-rpc.md).

### Hotloading of notaries list

The notaries list can now be hotloaded. For more information see [Hotloading](network/network-map.md#hotloading) in [Network map](network/network-map.md).

### LedgerGraph available as a stand-alone CorDapp

LedgerGraph enables other CorDapps, such as the set of [Collaborative Recover CorDapps](node/collaborative-recovery/introduction-cr.md), to have near real-time access to data concerning all of a node’s transactions and their relationships. LedgerGraph has been in use in some solutions already, but is now available as a CorDapp in its own right.

### Collaborative Recovery upgraded to V1.1

As LedgerGraph is now available as a stand alone CorDapp, the Collaborative Recovery CorDapps have been upgraded to reflect this change. In order [to use Collaborative Recovery V1.1](node/collaborative-recovery/introduction-cr.md) you must have a corresponding LedgerGraph CorDapp installed. If you use Confidential Identities with Collaborative Recovery, in V1.1 you must configure LedgerGraph to handle this. In V1.0, Confidential Identities configuration needed to be added to the **LedgerSync** CorDapp.

### Migrating Notary data to CockroachDB

Notary data stored in a Percona database can now be migrated to Cockroach DB. For more information, see [Upgrading a notary](notary/upgrading-a-notary.md).

### Notary identity configuration

When registering a notary, the new field `notary.serviceLegalName` must be defined, this allows single-node notaries to be upgraded to HA notaries. For more information, see [Running a notary](notary/running-a-notary.md).

### Improved CockroachDB performance

A new configuration flag has been introduced, enabling native SQL for CockroachDB with multi-row insert statements. See [Node configuration reference](node/setup/corda-configuration-fields.md)

### Database Management Tool improvements

We have improved the [Database Management Tool](database-management-tool.md) in order to facilitate database migrations from Corda to Corda Enterprise.

The changes are briefly described below.

* A new `sync-app-schemas` command has been added. It updates the migration changelog for all available CorDapps.
* The `dry-run` command has two new parameters: `--core-schemas` (the tool outputs DB-specific DDL to apply the core node schema migrations) and `--app-schemas` (the tool outputs DB-specific DDL to apply the migrations for custom CorDapp schemas).
* The `execute-migration command` has three new parameters: `--core-schemas` (the tool will attempt to run the node Liquibase core schema migrations), `--app-schemas` (the tool will attempt to run Liquibase migrations for custom CorDapp schemas), and `--db-admin-config <path/to/adminconfigfile>` (this parameter specifies the location on disk of a config file holding elevated access credentials for the DB - the tool will use the credentials listed in the config file to connect to the node database an apply the changes).
* Obfuscated passwords are now allowed. To enable the tool to de-obfuscate the obfuscated fields, the following command-line options are provided for setting the passphrase and seed if necessary: `--config-obfuscation-passphrase` and `--config-obfuscation-seed`.
* Base directory, which defaults to the current working directory if not set.
* Location of output file when `dry-run` is used. The output file will now be created relative to the current working directory rather than the base directory.

For full details, see [Database Management Tool](database-management-tool.md).

### Other changes

* To reduce the risk of vulnerabilities, we have upgraded the Apache Zookeeper used by the Corda Enterprise [Firewall component](node/corda-firewall-component.md#prerequisites-4) from 3.5.4-Beta to 3.61. See [Apache ZooKeeper setup](operations/deployment/corda-firewall-configuration-file.md#apache-zookeeper-setup) for more information.
* We have upgraded `commons-beanutils` to version 1.9.4 for improved security.
* As of Corda Enterprise 4.6, support for [DemoBench](demobench.md) is deprecated.
* We have released a new minor version of [Accounts SDK](https://github.com/corda/accounts/blob/master/docs.md) - version 1.0.2. This version includes database improvements that make it compatible with Corda Enterprise 4.6. If you are planning to use the Accounts SDK with Corda Enterprise 4.6, you must use Accounts SDK V 1.0.1.
* We have released a new minor version of [Tokens SDK](token-sdk-introduction.md) - version 1.2.1. This version includes database improvements that make it compatible with Corda Enterprise 4.6. If you are planning to use the Tokens SDK with Corda Enterprise 4.6, you must use Tokens SDK V 1.2.1.

## Platform version change

The platform version of Corda 4.6 has been bumped up from 7 to 8.

For more information about platform versions, see [Versioning](cordapps/versioning.md).

## Fixed issues

* We have fixed an issue where the FutureX provider threw a `javax.security.auth.login.LoginException` when trying to establish a connection with the HSM.
* We have fixed an issue where a Corda node in dev mode did not start up without the Network Map Service running.
* We have fixed an issue with failing `flows continue despite errors – net.corda.node.flows.FlowRetryTest` tests.
* We have fixed an issue where an unexpected error with unique constraints in the `node_metering_data_pkey` occurred following an upgrade from Corda Enterprise 4.5.1 with the Database Management Tool.
* We have fixed an issue where the RPC `startFlow` could not reattach to existing client id flows when flow draining mode was enabled.
* We have fixed an issue where the Health Survey Tool could not verify the connection to the node's Artemis broker.
* We have fixed an issue where the `FlowSessionCloseTest.flow` could not access a closed session unless it was a duplicate close that was handled gracefully.
* We have fixed an issue where the `RetryFlowMockTest - flakey test` returned flakey due to restart not setting `senderUUID` and the early end session message not hanging the receiving flow.
* We have fixed an issue where `--allow-hibernate-to-manage-app-schema` could not manage app schemas when running a node.
* We have fixed an issue where Corda did not write the error message for a start-up error into the log file.
* We have fixed an issue where the expected `error_code="5"` error was missing in logs run with custom CorDapps without the Liquibase schema.
* We have fixed an issue where a flow could fail with a null error and stack trace if the counterparty was busy.
* We have fixed an issue with inconsistent behaviour between killed client ID flows and flows with other statuses.
* We have fixed an issue where restarting the Corda node without the `--pause-all-flows` flag would cause the node to remain in flow draining mode, pausing flow processing until the mode was manually disabled.
* We have fixed an issue where it was not possible to register multiple notaries configured to use TLS keys in one HSM.
* We have fixed an issue where the HA Utilities did not log information about the used `tlsCryptoServiceConfig` configuration.
* We have fixed an issue where months and years were not supported values in `rpcAuditDataRetentionPeriod`.
* We have fixed an issue where a node failed to shut down when the `senderRetentionPeriodInDays` was set to a negative integer.
* We have fixed an issue where IVNO CorDapps that were working on Corda 4.3 were not registered when Corda was upgraded to version 4.5.
* We have fixed an issue where the configuration file path for TLS crypto was resolved incorrectly, leading to an error when registering the node.
* The Corda Health Survey Tool now displays a warning message when network information is resolved and an HTTP redirect occurs.
* We have fixed an issue where an error occurred on node shutdown with the message: `The configuration values provided for message cleanup are invalid`.
* We have fixed an issue where the Corda Health Survey Tool was hanging after performing all checks when Artemis was shut down during the Health Survey Tool test.
* There is now an informative error message if HSM is unavailable.
* CRaSH Flow query now displays `Data` and `Time` information correctly.
* We fixed an issue where the optional `file:prefix` was stripped from the classpath element passed to the `ClassGraph()` filter function, resulting in the filter function not recognising the element.
* We fixed an issue were flows would start executing when the `StateMachineManager.start` database transaction had not started yet.
* We have reverted to Jackson 2.9.7 to resolve an issue where R3 Tools could not work properly with the upgraded version.
* We have fixed an issue where `Paths.get("")` returns `null` instead of the current working directory.
* We have fixed an issue where the sample web app for IRS demo could not be run due to the following error: `no main manifest attribute, in web-4.6-RC05-thin.jar`.
* A warning now appears after sleep task execution because the next maintenance event was not triggered due to a long execution of the current event.
* A previously unhandled exception when the password for an RPC user was wrong is now handled correctly.
* A previously unhandled exception with problems accessing DB is now treated as a `HikariPool.PoolInitializationException`.
* We have fixed an issue where the Classloader failed to find the class when a CorDapp class was used.
* The path for network parameters is now configurable and the network parameters file is stored in the location specified by the node configuration.

## Known issues
* The HA Utilities tool and the Health Survey Tool do not process configuration `include` commands correctly if the configuration is located in the tool's root directory.
* It is currently not possible to build a Kotlin CorDapp template against Corda Enterprise 4.6.
* There are inconsistencies in code stubs and actual code between the Kotlin and Java CorDapp templates.
* The Database Management Tool and Corda Enterprise do not run with the same configuration in the Command-line Interface options and configuration files.
* The node does not connect to the HSM on the second registration attempt if the first attempt was not successful due to HSM inaccessibility.
* Using the local network bootstrapper takes longer than in previous versions of Corda.
* The "new" operation on the `FlowRPCOps` RPC interface takes a `StateMachineID` as an argument, leading to repetitive invocations of the form.
* An SSL connection cannot be established between two nodes when one of the nodes does not have access to the Identity Manager Service and, as a result, to CRL distribution points.
* A node cannot be run with the `--dev-mode` option unless `devModeOptions.allowCompatibilityZone=true` is added to the node configuration.
* Corda throws an exception instead of producing a clear error message when a log cannot be created.
* In HA Utilities, the `notary-registration` option does not write CSR details to the log file.
* In the Attachment Demo, the `runSender` task uses `myLegalName` instead of `serviceLegalName` for notarisation.
* Some samples cannot be run on Windows due to an issue with long file names.
* The Database Management Tool does not work with Corda Enterprise 4.6 when `dataSourceProperties` is in a separate file.
* Business Network roles are not displayed when `MembershipState` is queried via the Shell Command-line Interface. It is also not possible to change the participant roles via the Shell Command-line Interface.
* Filtering flows by `FlowStart` using the constants `Instant.MAX` and `Instant.MIN` returns an exception.
* The SSH Client returns inconsistent exit codes after `gracefulShutdown` is run, indicating that an error has occurred.
* The Docker node does not generate configuration and certificates against Testnet.
* The node rejects the incoming P2P connection from a node with a revoked certificate, with warnings and errors, but does not block any attempts to re-establish it. This leads to a quick accumulation of warnings and errors in the node log.
* The error text is repeated in the console when trying to register a node with forbidden characters in the Organisation (`O`) name.
* The ``<install-shell-extensions>`` sub-command of Corda node creates log files in the home folder, while all other sub-commands create log files the `logs` subfolder.
* In Corda Enterprise 4.6, if a CorDapp's `minimumPlatformVersion` is higher than the platform version of the node, the CorDapp is not loaded and the node fails to start. This is a change in behaviour compared to Corda Enterprise 4.5 where under these conditions the node would start up and log that the CorDapp could not be loaded. See [Versioning](cordapps/versioning.md) for more information.
