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

### Migrating Notary data to CockroachDB

Notary data stored in a Percona database can now be migrated to Cockroach DB. For more information, see [Upgrading a notary](notary/upgrading-a-notary.md).

### Notary identity configuration

When registering a notary, the new field `notary.serviceLegalName` must be defined, this allows single-node notaries to be upgraded to HA notaries. For more information, see [Running a notary](notary/running-a-notary.md).

### Improved CockroachDB performance

A new configuration flag has been introduced, enabling native SQL for CockroachDB with multi-row insert statements. See [Node configuration reference](node/setup/corda-configuration-fields.md)

## Fixed issues

* We have fixed an issue where the FutureX provider threw a `javax.security.auth.login.LoginException` when trying to establish a connection with the HSM.
* We have fixed an issue where a Corda node in dev mode did not start up without NMS running.
* We have fixed an issue with failing `flows continue despite errors – net.corda.node.flows.FlowRetryTest` tests.
* We have fixed an issue where an unexpected error with unique constraints in the `node_metering_data_pkey` occurred following upgrade from CE 4.5.1 with the data management tool.
* We have fixed an issue where the RPC `startFlow` could not reattach to existing client id flows when flow draining mode was enabled.
* We have fixed an issue where the Health Survey Tool could not verify the connection to the node's Artemis broker.
* We have fixed an issue where the `FlowSessionCloseTest.flow` could not access a closed session unless it was a duplicate close which is handled gracefully.
* We have fixed an issue where the `RetryFlowMockTest - flakey test` returned flakey due to restart not setting `senderUUID` and the early end session message not hanging the receiving flow.
* We have fixed an issue where `--allow-hibernate-to-manage-app-schema` could not manage app schemas when running a proper node.
* We have fixed an issue where Corda did not write the error message for a start up error into the log file.
* We have fixed an issue where the expected `error_code="5"` error was missing in logs run with custom CorDapps without the Liquibase schema.
* We have fixed an issue where a flow could fail with a null error and stack trace if the counterparty was busy.
* We have fixed an issue with inconsistent behaviour between killed client ID flows and flows with other statuses.
* We have fixed an issue where restarting the Corda node without the `--pause-all-flows` flag would cause the node to remain in flow draining mode, pausing flow processing until the mode was manually disabled.
* We have fixed an issue where it was not possible to register multiple notaries configured to use tls keys in one HSM.
* We have fixed an issue where the HA Utilities did not log information about the used `tlsCryptoServiceConfig` configuration.
* We have fixed an issue where months and years were not supported values in `rpcAuditDataRetentionPeriod`.
* We have fixed an issue where a node failed to shut down when the `senderRetentionPeriodInDays` was set to a negative integer.
* We have fixed an issue where IVNO CorDapps that were working on Corda 4.3 were not being registered when Corda was upgraded to version 4.5.
* We have fixed an issue where the configuration file path for TLS crypto was resolved incorrectly, leading to error when registering the node.
* The Corda Health Survey now displays a warning message when network information is being resolved and HTTP redirect occurs.
* We have fixed an issue where an error occurred on node shutdown with the message: `The configuration values provided for message cleanup are invalid`.
* We have fixed an issue where the Health-Survey Tool was hanging after performing all checks when Artemis was shut down during the Health Survey test.
* There is now an informative error message if HSM is unavailable.
* CRaSH Flow query now displays `Data` and `Time` information correctly.
* We fixed an issue where the optional `file:prefix` was stripped from the classpath element passed to the `ClassGraph()` filter function, resulting in the filter function not recognising the element.
* We fixed an issue were flows would start executing when the `StateMachineManager.start` database transaction had not started yet.
* We have reverted to Jackson 2.9.7 to resolve r3-tools breaking with the upgraded version.
* We have fixed an issue where `Paths.get("")` returns `null` instead of the current working directory.
* We have fixed an issue where the sample web app for IRS demo could not be run due to the following error: `no main manifest attribute, in web-4.6-RC05-thin.jar`.
* A warning now appears after sleep task execution because the next maintenance event was not triggered due to a long execution of the current event.
* A previously unhandled exception when the password for an RPC user was wrong is now handled correctly.
* A previously unhandled exception with problems accessing DB is now treated as a `HikariPool.PoolInitializationException`.


###  Changelog/other fixed issues


## Known issues
