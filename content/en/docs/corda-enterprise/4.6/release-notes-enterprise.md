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



## Fixed issues

### Important fixed issues

### Minor fixed issues

* We have fixed an issue where
* We have fixed an issue where
* We have fixed an issue where
* We have fixed an issue where
* We have fixed an issue where
* We have fixed an issue where

###  Changelog/other fixed issues


## Known issues