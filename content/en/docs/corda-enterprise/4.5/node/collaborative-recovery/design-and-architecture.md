# Collaborative Recovery

Corda's Collaborative Recovery solution helps you retrieve data lost in a 'disaster scenario' where nodes on a network are not protected by synchronous database replication.

With a coordinated approach to disaster recovery across your network, you and other node operators can use the Collaborative Recovery CorDapps to rebuild and synchronise missing ledger data.

If you plan to use Collaborative recovery on your network, you must ensure that yours and all other nodes you will need to recover data from (potentially the entire network) have the following:

* Full and incremental database backups
* Synchronous or Asynchronous database replication
* Replicated and fault-tolerant filesystem (to prevent loss of MQ data)

## Your disaster recovery planning in Corda

Because Corda doesn't have a built-in gossip synchronisation protocol and does not propagate a single shared "view" of the state of the ledger across all peers, if a node loses ledger data due to a disaster, you may need a way to  automatically recover ledger data from the rest of the network. In order to deliver on the "What I See Is What You See" promise Corda relies on fault-tolerant infrastructure components, such as enterprise-grade databases and durable message queues.

However, this is not enforced. If your network is not supported by synchronous database replication on all nodes, you may use asynchronous replication combined with incremental backups instead. This setup does not give a 100% recovery guarantee in a disaster recovery scenario. By definition, your asynchronous
replica would be behind the master node by definition.  

Another case to consider is a malicious admin scenario. A user with administrator privileges for a node might physically
log into the database and wipe out a number of transactions from the ledger. Because of the way the transaction chains are
structured in Corda (multiple Directed Acyclic Graphs), it might take a while for the node operator to discover that
the tampering has happened at all (especially if data has been removed only from transaction backchains).

----------

*LedgerSync* and *LedgerRecover* are CorDapp-level solutions that aim to help detect potential ledger inconsistencies and recover any missing
 *ledger data* (including transactions, attachments and historical network parameters) from other
counterparts on the Business Network. They're collectively called *"Collaborative Recovery"* in the rest of this document.

**It's important to emphasise that even though Collaborative Recovery provides tools to detect and recover missing ledger data, it's
not sufficient as a DR strategy on its own. Collaborative Recovery has been designed to be used in conjunction with conventional DR approaches
such as backups and replication, as will be explained later in the sections.**  

## Scope of Collaborative Recovery

Collaborative Recovery is meant to support Corda nodes to retrieve missing ledger data from other peers on the network.
Hence, only data that was shared in the first place can be recovered. Recovery of the following assets is in scope:

* Transactions
* Attachments
* Historical network parameters

Recovery of the following assets is out of scope:

* **Confidential identities**. Private keys can't be recovered from other peers by definition. The states, that belong to those keys
can be recovered though, but only if the proof of owning the key has been shared with the counterparty when the transaction happened.
* **Node identity / TLS keys**.
* **Node and CorDapp configuration files**.
* **CorDapp jars**.
* **MQ data**.
* **Self issued but never transacted states**. However such states can be unilaterally reissued onto the ledger, as issuances
don't require notarization.
* **Off-ledger tables**.
* **Observed transactions**. Transactions that have been shared as a part of *Observers* functionality
will have to be reprovisioned separately.
* **Scheduled states**.
* **Any ledger data that has been shared with parties that are not available on the network anymore**.  

## RPO (Recovery Point Objective) and RTO (Recovery Time Objective) Guarantees

Due to the nature of decentralised systems, Collaborative Recovery **doesn't provide any RPO / RTO guarantees**. For example,
some data might be unrecoverable due to a counterparty not being a part of the network anymore. The amount of time required
for recovery can't be guaranteed either as peers might be temporarily unavailable or have low bandwidth.

Collaborative Recovery policies that mandate the SLAs for the participants' nodes to respond to the DR requests
should be enforced at the Business Network governance level.

## Compatibility With Other R3 Libraries

### Tokens and Accounts

Collaborative Recovery is compatible with the [Tokens](https://github.com/corda/token-sdk)
SDK.

Collaborative Recovery is also able to recover transactions where a node participated through an identity created with the [Accounts](https://github.com/corda/accounts) SDK, with a few significant limitations.

When using Accounts, it's important to keep in mind that each account is represented by a Confidential Identity under the hood.
Even though the transactions that the account has participated in *are* recoverable (given that the *AccountInfo* has been shared alongside the transactions),
the account key pair itself won't be recovered from other peers. Customers should implement their own key rotation techniques to move the states to a different key
if the original one has been lost.  

Furthermore, it is currently not possible to recover the issuance transaction containing an `AccountInfo` state (generated when a new Account is created on a node). The `AccountInfo` transaction is required for Account balances, issuances and payments to work properly. Any Account that has lost the corresponding `AccountInfo` transaction should not be considered anymore functional.

### Finance

Collaborative Recovery is *not* compatible with the [legacy](https://docs.corda.net/api-stability-guarantees.html) Corda Finance module.
This is due to the way Confidential Identities are used as a part of the `CashPaymentFlow`.
Please consider avoiding Corda Finance in the favour of Tokens and Accounts SDKs.

## Corda Support Matrix

Collaborative Recovery applications have a minimum platform version of 6 and are compatible only with Corda Enterprise nodes.  

It's important to understand, that Collaborative Recovery is a CorDapp level solution and is not shipped as a part of Corda itself.
Only the nodes that have the DR CorDapps installed can participate in Collaborative Recovery. In mixed networks that consist of both Open Source and Enterprise nodes,
only the Enterprise nodes of the right version *and* that have the Collaborative Recovery CorDapps installed will be able to
participate in Collaborative Recovery.   

## Collaborative Recovery CorDapps

This section explains some basic capabilities of the LedgerSync and LedgerRecover CorDapps. There are dedicated
sections for developers and operators further down the document that cover the respective aspects of each CorDapp in depth.

## LedgerSync

LedgerSync is a CorDapp that highlights the differences between the common ledger data held by two nodes in the same Business Network.
A peer running the CorDapp is alerted to any missing transactions. This procedure is called reconciliation in the rest of this document.

> LedgerSync relies on the user to provide a list of the parties to reconcile with. This can be used as an integration
> point with custom membership management systems.  

LedgerSync uses [Efficient Set Reconciliation Algorithm Without Prior Context](https://www.ics.uci.edu/~eppstein/pubs/EppGooUye-SIGCOMM-11.pdf)
for peer-to-peer reconciliations. It has been designed to efficiently reconcile large sets of data with small amount or no differences at all. Generally
speaking, the amount of data one would need to transfer is proportional to the size of the difference and not the total number of
items in the data set. Due to that, LedgerSync introduces only a minimal network overhead even for a large data sets.

LedgerSync has been designed with privacy in mind. Parties never share any real data. Instead they share
*Invertible Bloom Filters* that contain obfuscated data only and can't be decoded by a party unilaterally.
Furthermore, LedgerSync prevents privacy leaks by allowing only parties that participated in a transaction to report
that the transaction is missing from the initiator's ledger.

LedgerSync can operate on schedule as well as on demand. It utilises bounded flow pools to limit the number of concurrent
inbound / outbound reconciliations and also supports different throttling techniques to prevent the functionality from being abused.

A high level peer to peer reconciliation flow is depicted in the diagram below. LedgerSync can run multiple of these concurrently
up to the limit configured by the user.

![Peer To Peer Reconciliation Flow](./resources/ledger-sync-flow.png)

## LedgerRecover

LedgerRecover helps to recover missing transactions, attachments and network parameters based on the outputs of LedgerSync.
LedgerRecover can be operated in manual and automatic modes.

> While LedgerSync can be used on its own (for example as a diagnostic utility), LedgerRecover can be used only on top of LedgerSync.

### Automatic

*Automatic* LedgerRecover has been designed to recover a small amount of ledger data, that would have a little to no impact
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

*Manual* LedgerRecover has been designed for larger volumes of data and for cases when the recovery request requires manual approval.
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
