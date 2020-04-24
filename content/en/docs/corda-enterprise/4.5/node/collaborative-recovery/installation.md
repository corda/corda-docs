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

title: Installing the Corda Collaborative Recovery CorDapps
weight: 100
---

# Install Collaborative Recovery CorDapps

To begin the process of enabling your Corda node for collaborative recovery with other Corda nodes, you must first install the provided Disaster Recovery CorDapps.

For the collaborative recovery process to be effective when it’s needed, you should install the required CorDapps as early as possible. You may be able to install them during a disaster  
scenario, but it saves valuable time to prepare in advance.

If you are part of an operating Business Network, Corda Network or Segregated Sub-Zone that is NOT currently mandating all nodes run disaster recovery, you should recommend
these measures are taken. Collaborative recovery can only be successful if all nodes on the network are able to participate (meaning that they have the appropriate CorDapps installed).

In this guide:

* Check the requirements for Corda Collaborative Recovery - both on your local environment and your network.
* Check that you have received the correct .JAR files
* 

## Requirements

Corda nodes must be running Corda Enterprise NOT Corda Open Source in order to initiate or participate in Collaborative Recovery.
- Corda Enterprise

Collaborative recovery requires operative Corda nodes to have a Corda Platform Version (CPV) of 6 or greater. This version number is related to the version of Corda a node is running.
- Node MPV > 6

In addition to a CPV of greater than 6, the Corda Work itself must have a sufficient Minimum Platform Version.
- Network MPV > 6

## Database requirements

Collaborative Recovery CorDapps are tested against Corda Enterprise and will work according to the support matrix defined in the documentation found [here](https://docs.corda.net/docs/corda-enterprise/4.3.1/platform-support-matrix.html).

## Install the CorDapps

### Step 0: File Check

The first step in installation of Disaster Recovery CorDapps is to obtain the Jar files (distributable binaries that the Corda node will run). These should be provided by your Corda Representative.
Once you have obtained the software in a distributable format, you are ready to install them into your operating Corda node.

    :warning: This process will require your node to be down for a small period of time. This means your node will be unable to receive or sign incoming transaction for the duration of the installation process
    It is recommended that you perform this installation in a maintenance window or other prescheduled and communicated time slot.

You should have access to three individual jar files - representing LedgerSync, LedgerRecover, and LedgerGraph respectively. You should be able to access these files readily on the machine from
which you will be performing the installation.

### Step 1: Flow Draining Mode

In order to safely install the Collaborative Recovery software, all pending Corda Flows must finish executing. This can be accomplished by enabling `flowDrainingMode` - which is a configuration
setting that causes the node to no longer accept any incoming instructions to initiate new flows or accept newly initiated incoming flows. Instead, only currently checkpointed flows will continue
to execute until the node is `drained` of any pending activity. This can be done in one of two ways:

1. RPC - By RPC using the setFlowsDrainingModeEnabled method with the parameter true.
2. CRaSH Shell - Via the shell by issuing the following command run setFlowsDrainingModeEnabled enabled: true.

### Step 2: Shut Down The Node

Once the node has been successfully drained of any pending activity you will be able to shut it down safely. Use the command:

    `checkpoints dump`

To output a JSON representation of remaining checkpoints. If this list is empty, the node has been successfully drained. If the list contains representations of in-flight flows, and continues
to do so for an unreasonable amount of time, the flows may have become stuck. At this point you may wish to kill the flows explicitly using the `killFlow` api. To learn more about this and the
associated risks you can review the documentation found [here](https://docs.corda.net/docs/corda-enterprise/4.4/cordapps/upgrading-cordapps.html#flow-drains).

### Step 3: Install the CorDapps

Using the file transfer protocol of your choice, add the three previously mentioned JAR files to the CorDapps directory of the Corda node.

Before proceeding, check and ensure that your transfer was complete and that the files are present in the CorDapps director AND of the
appropriate size (the same size as the source JAR files you received).

### Step 4: Run Database Migrations (As Necessary)

If you are using Corda with a permissioned database you may need to perform database migrations. This process has been well-documented and
is undifferentiated from the standard process of installing a CorDapp as defined in this [documentation](https://docs.corda.net/docs/corda-enterprise/4.3.1/node-operations-cordapp-deployment.html#database-update).

### Step 5: Restart the Node

Restart the node in the same manner originally started by the node operator. For more information on running Corda on a remote server refer to this
[documentation](https://docs.corda.net/docs/corda-os/4.4/deploying-a-node.html).

Congratulations! You've successfully enabled your Corda node for collaborative recovery in the event of a disaster scenario.

### Step 6: Verify

Now that you have successfully installed the Disaster Recovery CorDapps, let's verify that they are available for use. To do so, we will attempt to
list out the flows available for initiating via the CRaSH shell.

In the CRaSH shell, run the following command:

    `flow list`

You should now see a list of flows printed to the console, including those required to initiate Disaster Recovery. Disaster Recovery contains many
initiating flows, described in detail in this documentation. Verify that the list printed includes:

- `ScheduleReconciliationFlow`
- `AutomaticLedgerRecoverFlow`
- `InitiateManualRecoveryFlow`

## Next Steps

Now that you have successfully installed and verified your Disaster Recovery CorDapps, you should familiarize yourself with their use and configuration.
First, please review the [ledger sync](./ledger-sync.md) documentation and then both [automatic ledger recover](./ledger-recovery-automatic.md) and
[manual ledger recover](./ledger-recovery-manual.md).
