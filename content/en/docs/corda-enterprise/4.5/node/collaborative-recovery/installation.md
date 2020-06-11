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

title: Install Collaborative Recovery
weight: 700
---

# Install Collaborative Recovery CorDapps

**Who this documentation is for:**
* Node operators
* Business Network Operators (BNOs)
* Corda developers

For the collaborative recovery process to be effective if it’s ever needed, you should install the required CorDapps as early as possible. You may be able to install them during a disaster scenario, but it saves valuable time to prepare in advance. This also allows other nodes in the network to reconcile/recover from you.

If you are part of an operating business network, Corda Network or Segregated Sub-Zone that does not currently mandate all nodes run disaster recovery, you should recommend these measures are taken. Collaborative recovery can only be successful if all nodes on the network have the appropriate CorDapps installed and up to date.

Outline of steps for installation:

1.  Check the requirements for Corda Collaborative Recovery - both on your local environment and your business network.

2.  Database requirements and operations outline.

3.  Prepare your node for installation.

4.  Install and check the CorDapps.

5.  Run database migrations.

6. Verify installation.


## Requirements

* **Corda Enterprise** Corda nodes must be running Corda Enterprise in order to initiate or participate in Collaborative Recovery. This feature is not available for Corda Open Source nodes.

* **Node Minimum Platform Version (MPV) > 6** Collaborative recovery requires operative Corda nodes to have a Corda Platform Version (CPV) of 6 or greater. This version number is related to the version of Corda a node is running.

* **Network MPV > 6** In addition to a CPV of greater than 6, the network itself must have a sufficient MPV.

* **Database requirements** Collaborative Recovery CorDapps are tested against Corda Enterprise and will work according to the [platform support matrix](../../platform-support-matrix.html).

## Install the CorDapps

### Pre-installation check

The first step in installation of Disaster Recovery CorDapps is to obtain the Jar files (distributable binaries that the Corda node will run). These should be provided by your Corda Representative.
Once you have obtained the software in a distributable format, you are ready to install them into your operating Corda node.

{{< attention >}}
If possible, you should perform this installation in a maintenance window or other prescheduled and communicated time slot as the process requires your node to be down for a short period of time. This means your node will be unable to receive or sign incoming transaction for the duration of the installation process.
{{< /attention >}}

You should have access to two individual jar files - representing `LedgerSync` and `LedgerRecovery` respectively. You should be able to access these files readily on the machine from which you will be performing the installation.

### Step 1: Initiate flow draining mode

In order to safely install the Collaborative Recovery software, all pending Corda Flows must finish executing. This can be accomplished by enabling `flowDrainingMode` - which is a configuration
setting that causes the node to no longer accept any incoming instructions to initiate new flows or accept newly initiated incoming flows. Instead, only currently checkpointed flows will continue
to execute until the node is `drained` of any pending activity. This can be done in one of two ways:

1. RPC - By RPC using the setFlowsDrainingModeEnabled method with the parameter true.
2. CRaSH Shell - Via the shell by issuing the following command:
    `run setFlowsDrainingModeEnabled enabled: true`.

### Step 2: Shut down the node

Once the node has been successfully drained of any pending activity you will be able to shut it down safely. Use the command:
`checkpoints dump`

To output a JSON representation of remaining checkpoints. If this list is empty, the node has been successfully drained. If the list contains representations of in-flight flows, and continues to do so for an unreasonable amount of time, the flows may have become stuck. At this point you may wish to kill the flows explicitly using the [`killFlow` api](../cordapps/api-flows#killing-flows).

### Step 3: Install the CorDapps

Using the file transfer protocol of your choice, add the three previously mentioned JAR files to the CorDapps directory of the Corda node.

Before proceeding, check and ensure that your transfer was complete and that the files are present in the CorDapps director AND of the
appropriate size (the same size as the source JAR files you received).

### Step 4: Run any necessary database migrations

If you are using Corda with a permissioned database you may need to [perform database migrations](../operating/node-operations-cordapp-deployment).

### Step 5: Restart the node

Restart the node in the same manner [originally started by the node operator](../deploy/deploying-a-node).

You have enabled your Corda node for collaborative recovery in the event of a disaster scenario.

### Step 6: Verify installation

Now that you have successfully installed the Disaster Recovery CorDapps, you can verify that they are available for use. You can do this by
requesting a list of the flows available for initiating via the CRaSH shell.

In the CRaSH shell, run the following command:
`flow list`

You should now see a list of flows printed to the console, including those required to initiate Disaster Recovery. Disaster Recovery contains many
initiating flows, described in detail in this documentation. Verify that the list printed includes:

- `ScheduleReconciliationFlow`
- `AutomaticLedgerRecoverFlow`
- `InitiateManualRecoveryFlow`

## Next steps

Now that you have successfully installed and verified your Disaster Recovery CorDapps, you should familiarize yourself with their use and configuration.
First, please review the documentation for [LedgerSync](ledger-sync), [automatic LedgerRecover](ledger-recovery-automatic) and
[manual LedgerRecover](ledger-recovery-manual).
