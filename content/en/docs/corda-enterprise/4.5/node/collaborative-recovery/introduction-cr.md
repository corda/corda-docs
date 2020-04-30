---
date: '2020-04-24T12:00:00Z'
menu:
  corda-enterprise-4-5:
    identifier: corda-enterprise-4-5-corda-nodes-collaborative-recovery
    name: "Collaborative Recovery"
    parent: corda-enterprise-4-5-corda-nodes
tags:
- disaster recovery
- collaborative recovery
- install
- node operator

title: Collaborative Recovery
weight: 100
---

# Collaborative Recovery

**Who this documentation is for:**
* Node operators
* Business Network Operators (BNOs)
* Corda developers


## Introducing Collaborative Recovery

Collaborative Recovery is a CorDapp-based solution that helps you retrieve lost data in a disaster recovery scenario where all other strategies have been exhausted.

With a coordinated approach, you can use Collaborative Recovery to detect potential ledger inconsistencies and recover any missing ledger data from parties you have transacted with on the Business Network. For this solution to be effective, the Collaborative Recovery CorDapps must be deployed to every node with which you may transact. This means that as well as installing locally, you must try to make Collaborative Recovery part of the overall disaster recovery policy for your Business Network.

{{< note >}}

**Business Network** refers to a governance system enforced at the application level. This system may govern which nodes are able to transact using a particular CorDapp.

{{< /note >}}

What you need to know before installing and using the Collaborative Recovery CorDapps:

* Your Business Network disaster recovery policy
* The Corda platform requirements
* How the LedgerSync and LedgerRecover CorDapps should be used.

## When to use Collaborative Recovery

Collaborative Recovery is a final, last resort option to recover your data. Whilst it provides tools to detect and recover missing ledger data, it's
not sufficient as a disaster recovery strategy on its own. You must use Collaborative Recovery in conjunction with conventional DR approaches,
such as backups and replication.

Ideally, you should never need to use Collaborative Recovery. To protect the data on your node, each node you transact with should be part of a robust disaster recovery plan, agreed at the Business Network level. This strategy should mean you have backups include the following:

* full and incremental database backups
* synchronous database replication
* replicated and fault-tolerant filesystem (to prevent loss of MQ data).

If your Business Network is not supported by synchronous database replication on all nodes, but uses asynchronous replication combined with incremental backups instead, you do not have a 100% recovery guarantee in a disaster scenario. By definition, your asynchronous replica is behind the master node.  

If you find yourself in this position, or if your other disaster recovery procedures fail, Collaborative Recovery can help you restore and synchronise data across the ledger.

## Who can use Collaborative Recovery

Collaborative Recovery applications have a minimum platform version of 6 and are compatible only with Corda Enterprise nodes.  

Collaborative Recovery is an Enterprise, CorDapp-level solution and is not shipped as a part of Corda itself. Only nodes that have the DR CorDapps installed can participate in Collaborative Recovery. In mixed networks that consist of both Open Source and Enterprise nodes, only the Enterprise nodes of the right version that have the Collaborative Recovery CorDapps installed will be able to participate in Collaborative Recovery.  

## Scope of Collaborative Recovery

Collaborative Recovery allows Corda nodes to retrieve missing ledger data from other peers on the network. This means that only data that was shared in the first place can be recovered. You can use Collaborative Recovery to recover the following assets:

* Transactions
* Attachments
* Historical network parameters

### Out of scope assets

You **cannot** recover these assets using Collaborative Recovery:

* Confidential identities. Private keys can't be recovered from other peers by definition. The states, that belong to those keys
can be recovered though, but only if the proof of owning the key has been shared with the counterparty when the transaction happened.
* Node identity / TLS keys.
* Node and CorDapp configuration files.
* CorDapp jars.
* MQ data.
* Self issued but never transacted states. However such states can be unilaterally reissued onto the ledger, as issuances
don't require notarization.
* Off-ledger tables.
* Observed transactions. Transactions that have been shared as a part of **Observers** functionality
will have to be reprovisioned separately.
* Scheduled states.
* Any ledger data that has been shared with parties that are not available on the network anymore.  

### Out of scope RPO and RTO guarantees

Due to the nature of decentralised systems, Collaborative Recovery cannot provide Recovery Point Objective (RPO) and Recovery Time Objective (RTO) guarantees.

RPOs cannot be guaranteed because of factors beyond Corda's control. For example, some data might be unrecoverable due to a counterparty not being a part of the network anymore.

The amount of time required for recovery can't be guaranteed as peers might be temporarily unavailable or have low bandwidth.

Collaborative Recovery policies that mandate the SLAs for the participants' nodes to respond to the DR requests should be enforced at the Business Network governance level.

## Overview of the Collaborative Recovery CorDapps

Collaborative Recovery is made up of two CorDapps - LedgerSync and LedgerRecover. They are used together to reconcile and recover lost data.

### LedgerSync

LedgerSync is a CorDapp that highlights the differences between the common ledger data held by two nodes in the same Business Network.
A peer running the CorDapp is alerted to any missing transactions. This procedure is called **Reconciliation**.


{{< note >}}

LedgerSync relies on the user to provide a list of the parties to reconcile with. This can be used as an integration point with custom membership management systems.

{{< /note >}}

LedgerSync uses Efficient Set Reconciliation Algorithm Without Prior Context for peer-to-peer reconciliations. It has been designed to efficiently reconcile large sets of data with small amount or no differences at all. Generally speaking, the amount of data you can expect to transfer is proportional to the size of the difference and not the total number of items in the data set. For this reason, LedgerSync introduces only a minimal network overhead even for a large data sets.

LedgerSync has been designed with privacy in mind. Parties never share any real data. Instead they share *Invertible Bloom Filters* that contain obfuscated data only and can't be decoded by a party unilaterally. Furthermore, LedgerSync prevents privacy leaks by allowing only parties that participated in a transaction to report that the transaction is missing from the initiator's ledger.

LedgerSync can operate on schedule as well as on demand. It utilises bounded flow pools to limit the number of concurrent
inbound / outbound reconciliations and also supports different throttling techniques to prevent the functionality from being abused.

A high level peer to peer reconciliation flow is depicted in the diagram below. LedgerSync can run multiple of these concurrently
up to the limit configured by the user.

![Peer To Peer Reconciliation Flow](./resources/ledger-sync-flow.png)

### LedgerRecover

LedgerRecover helps to recover missing transactions, attachments and network parameters based on the outputs of LedgerSync.
LedgerRecover can be operated in manual and automatic modes.

> While LedgerSync can be used on its own (for example as a diagnostic utility), LedgerRecover can be used only on top of LedgerSync.

### Automatic

Automatic LedgerRecover has been designed to recover a small amount of ledger data, that would have a little to no impact
on the responding node's performance. Automatic LedgerRecover is built on top of Corda's `SendTransactionFlow` and `ReceiveTransactionFlow`.
These flows handle resolution of attachments, network parameters and transaction backchains out-of-the-box. Before entering recovery,
the responder should always verify the eligibility of the requester seeing the requested transactions. Only the transactions
where both of the parties are participants (along with their backchains) will be allowed for recovery. Automatic LedgerRecover
supports different types of throttling to prevent accidental abuse of the functionality.

A high level peer to peer automatic recovery flow is depicted in the diagram below.

![Peer to Peer Automatic Recovery Flow](./resources/automatic-ledger-recover-flow.png)

> Even though the recovery has the word "automatic" in its name, it can only be started manually.
This is to prevent the participants from abusing this functionality and overloading the network.

### Manual

Manual LedgerRecover has been designed for larger volumes of data and for cases when the recovery request requires manual approval.
During a manual recovery flow, an initiating party would make a request to kick off a manual recovery process.
Each party (the initiator and responder) persists a record of this request. The responder would then manually investigate the recovery request,
export the data to the filesystem, and pass it to the requester. This process would be carried out off-ledger without
relying on the Corda messaging layer, after which the requester would manually import the data into their vault.

Manual LedgerRecover ensures ledger consistency - importing data would not lead to an inconsistent ledger even if
it has been stopped halfway through.

A high level peer to peer manual recovery flow is depicted in the diagram below.

![Peer to Peer Manual Recovery Flow](./resources/manual-ledger-recover-flow.png)

### Supported DR Scenarios

Currently LedgerSync and LedgerRecover reliably support only cases when *the top of the chain is missing*.
For example this might happen when a transaction has not reached the node due to the issues with the infrastructure or when
the node has been recovered from a backup that was behind the current state of the network.

Scenarios such as when a node's database is manually tampered with are not fully supported at the moment.  

## Compatibility with other Corda Enterprise libraries

If you are using other R3 Corda Enterprise libraries, you may need to take extra steps to ensure Collaborative Recovery will work if it is ever needed.

### Tokens SDK - fully compatible

Collaborative Recovery is fully compatible with the [Tokens](https://github.com/corda/token-sdk)
SDK.

### Accounts SDK - compatible with limitations

You can use Collaborative Recovery to recover transactions where a node participated through an identity created with the [Accounts](https://github.com/corda/accounts) SDK, with a few significant limitations.

When using Accounts, remember that each account is still represented by a Confidential Identity. Even though the transactions that the account has participated in *are* recoverable (given that the *AccountInfo* has been shared alongside the transactions), the account key pair itself won't be recovered from other peers.

You need to implement your own key rotation techniques to move the states to a different key if the original one has been lost.  

It is currently not possible to recover the issuance transaction containing an `AccountInfo` state (generated when a new Account is created on a node). The `AccountInfo` transaction is required for Account balances, issuances and payments to work properly. Any Account that has lost the corresponding `AccountInfo` transaction can no longer be considered functional.

### Finance - not compatible

Collaborative Recovery is *not* compatible with the [legacy](https://docs.corda.net/api-stability-guarantees.html) Corda Finance module.
This is due to the way Confidential Identities are used as a part of the `CashPaymentFlow`.
Please consider avoiding Corda Finance in the favour of Tokens and Accounts SDKs.
