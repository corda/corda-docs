---
date: '2020-04-24T12:00:00Z'
menu:
  corda-enterprise-4-5:
    parent: corda-enterprise-4-5-corda-nodes-collaborative-recovery
tags:
- disaster recovery
- collaborative recovery
- install
- node operator

title: Deploy and operate Collaborative Recovery
weight: 300
---

# Deploy and operate Collaborative Recovery

**Who this documentation is for:**
* Node operators
* Business Network Operators (BNOs)
* Corda developers

You can use the Collaborative Recovery CorDapps to automate the process of recovering or reconciling data in a disaster recovery scenario. This section gives you an overview of the practical deployment and operation of Collaborative Recovery.

Use this guide to help you establish effective schedules for data reconciliation, and best practices for retrieving data in a disaster scenario.


## Schedule Reconciliation

You need to schedule regular reconciliation checks using the LedgerSync CorDapp. To do this, you can implement a small layer for scheduling and integration with your business network services. For practical steps on scheduling recovery, use the [LedgerSync guide](ledger-sync.md).

You should run reconciliations on a scheduled basis at appropriate intervals (at least once a day).

Recovery flows have been designed to be run manually. We recommend that you set up alerting (as explained in the next section)
for reconciliation differences and then start recovery manually with each of the highlighted parties.

## Monitor reconciliation and receive alerts

The Collaborative Recovery CorDapps expose a number of JMX metric via Jolokia. The full list of the exposed metrics for
[for LedgerSync here](ledger-sync.md), and [LedgerRecover here](ledger-recovery-automatic.md). The metrics are exposed alongside the ones from the node.
You can also [monitor via Jolokia using this guide](operating/node-administration.html#monitoring-via-jolokia).


We recommend setting up alerts for *LedgerSync's* `NumberOfFailedReconciliations` and `NumberOfReconciliationsWithDifferences` metrics.
During normal operations, values for both of these metrics should be equal to zero.

### NumberOfFailedReconciliations Metric

The `NumberOfFailedReconciliations` metric shows how many reconciliations have failed during the last run.
If the value is not zero, then the operator should first obtain a list of parties whose reconciliations have failed via the `FailedParties` metric.

Then for each of the failed parties, fetch their status via the `ReconciliationStatus` metric and investigate the failure reason.
For example, a reconciliation might fail due to the counterpart not having the Collaborative Recovery CorDapps installed on
their node or the counterpart's node might be too busy to reply to the reconciliation requests.
Each failure needs to be investigated and resolved separately.

Once this is done, the metric value will be reset to zero during the next reconciliation cycle.

### NumberOfReconciliationsWithDifferences Metric

The `NumberOfReconciliationsWithDifferences` metric shows how many reconciliations have highlighted actual differences.
If this value is not zero, it might potentially mean that the node's ledger is in an inconsistent state.
Please refer to the following sections for the procedure to follow.

## Database Operations

Collaborative Recovery CorDapps rely on the following DB tables:

* *LedgerSync*
    * `CR_RECONCILIATION_REQUEST`
* *LedgerRecover*
    * `CR_RECOVERY_REQUEST`
    * `CR_RECOVERY_LOG`

The DB tables are managed via Liquibase migrations that are shipped as a part of the Collaborative Recovery CorDapps.
No manual schema alterations should be performed at any time. The table schemas should be managed using the
[Database Management Tool](node/node-database.html#database-management-tool)
that is shipped as a part of Corda Enterprise.

Collaborative Recovery CorDapps are compatible with the full range of the [databases supported by Corda Enterprise](https://docs.corda.r3.com/platform-support-matrix.html#node-databases).

Contents of the Collaborative Recovery tables should *not* be altered manually. The tables are not envisioned to grow large in size.
The space complexities are outlined below:

* `CR_RECONCILIATION_REQUEST` - **O**(**Number of participants in Business Network**).
* `CR_RECOVERY_REQUEST` - **O**(**Number of incoming / outgoing recovery attempts**).
* `CR_RECOVERY_LOG` - **O**(**Number of sent / recovered transactions, attachments and network parameters**).

## Suggested DR Setup

A suggested high level Disaster Recovery setup is shown in the diagram below.

![Suggested Disaster Recovery Setup](./resources/dr-setup.png)

While the exact setup might vary from an organisation to organisation, the key points are:

* Always use synchronous replication for both database and filesystem if it's affordable from the cost and performance perspectives;
* If synchronous replication is not an option, consider using asynchronous, which is usually cheaper and faster;
* Take full and incremental database backups at an appropriate schedule;
* Run LedgerSync at appropriate intervals;
* Set up alerting for the `NumberOfFailedReconciliations` and `NumberOfReconciliationsWithDifferences` metrics as explained in the previous section.

## Suggested Disaster Recovery Procedure

The exact procedure to follow might vary from organisation to organisation. The intention of this section is not to
go through database / filesystem level recovery but rather to explain how to make sure that the ledger is consistent and operational.

If a synchronous replication has **not** been used, then after recovering from a backup / asynchronous replica keep in mind that
some of the flow checkpoints might be stale and resuming them might cause disruption. In an ideal scenario,
all flow checkpoints should be cleaned out manually before starting the node (please see [this](https://docs.corda.net/checkpoint-tooling.html) section).
The same applies to the message queue files, as they most likely won't match the contents of the DB anymore, especially when restoring from a backup.  

After the node has been started, we recommend running LedgerSync to check whether the ledger is missing any transactions.

### What to Do If Ledger Inconsistencies Have Been Detected

> In rare circumstances, the `NumberOfReconciliationsWithDifferences` metric might show a false positive (for example,
if a transaction was still in flight at one side when the reconciliation was run), so before taking any action we recommend
running `RefreshReconciliationStatusesFlow` via the node's shell to sync up reconciliation statuses with the vault.
If, after that, the metric has not zeroed out, further action will need to be taken.

First of all, inconsistencies in the ledger might indicate some serious underlying issues. If there is no obvious reason for them to occur
(i.e. like recovering from a backup), then we recommend:

* verifying whether there are any issues with the underlying messaging infrastructure,
* checking the node's logs for errors,
* analysing the node's database for stuck flow checkpoints,
* verifying whether the node's database has been tampered with manually, or has run out of space, and
* after properly diagnosing the disaster, you may need to trigger the standard Disaster Recovery protocol defined by your organisation.

Once the issue has been debugged and understood, the missing transactions can be recovered from other parties on a peer-to-peer basis.
The list of missing transaction IDs can be obtained from `lastSuccessfulReconciliationStatus` field of a reconciliation status.
`lastSuccessfulReconciliationStatus` is a binary field and can, but doesn't have to, be decoded using [Corda Blob Inspector](https://docs.corda.net/blob-inspector.html).
Depending on the size of the difference, either manual or automatic recovery can be used.
Consider using automatic LedgerRecover and switch to manual in case if automatic fails because of too many transactions.

> It's worth noting that manual recovery creates unencrypted archives with transaction data in clear-text on the filesystem of
the party that supplies the data. If the requesting and responding parties have confidentiality requirements, they should follow best practices to ensure
the data doesn't fall into the wrong hands. As a minimum we advise to use encrypted and secure storage to transmit the data
(or encrypt the data on the supplier side) as well as delete the archive data from the responder and initiator filesystems.

Statuses of running recoveries can be monitored via [LedgerRecover metrics](link to the LedgerRecover metrics).
Once all recoveries have completed successfully, we recommend to re-run reconciliation to confirm that
the differences are gone.

When using Collaborative Recovery it's important to keep in mind that:

* The database backups and replicas should be the the first port of call for recovering the vast majority of the ledger data;
* Self-issued private keys for Confidential Identities keys can't be recovered from other peers;
* Self-issued and never transacted states can't be recovered from other peers and need to be re-issued separately; and
* Any off-ledger data (don't confuse with [State Schemas](https://docs.corda.net/api-persistence.html#schemas)) will not be recovered from other peers.

## Business Network Operator (BNO) Involvement and Responsibilities

Collaborative Recovery was designed to support the resiliency of Corda nodes operating as part of a Business Network. As such,

* it is distributed as a CorDapp-level solution rather than being included in the Corda protocol, and
* it assumes that the Business Network Operator (BNO) will assume some responsibilities in co-ordinating reconciliation
and recovery activities across the network.

BNOs are expected to:

* distribute the Collaborative Recovery CorDapps to all peers (if the BNO is also the developer of the business application(s)
run by peers on the network, they might distribute them in a single bundle alongside the Collaborative Recovery CorDapps),
* make sure that all peers on the network use compatible version(s) of the Collaborative Recovery CorDapps, and to
* coordinate scheduled reconciliation times (e.g. making sure they happen during expected daily downtime to minimise load on the network).

It's important to note that if any node on a BN is not running the Collaborative Recovery CorDapps, all other nodes will
not be able to recover ledger data from it. This undermines the effectiveness of the CorDapps - the only way to ensure
successful recovery is to enforce that all participants run the apps in production.
