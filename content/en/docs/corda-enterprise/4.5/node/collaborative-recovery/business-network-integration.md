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


title: Adding Corda Collaborative Recovery across your network
weight: 200
---

# Integrating Collaborative Recovery on your Business Network

**Who this documentation is for:**
* Node operators
* Business Network Operators (BNOs)

In a disaster recovery scenario, you need to be sure you can recover data from the nodes you have transacted with on the Business Network. This is tricky because, with a compromised node, you have no way of determining which other specific nodes you could have transacted with. The only way to ensure you can recover all the required data, you need to be able to collaborate with the entire Business Network.

This is why it's essential that Business Network Operators make Collaborative Recovery part of the disaster recovery plan for their network. If you are a node operator, you need to seek an agreement at the governance level with all relevant Business Netowrk Operators (BNOs) before implementing collaborative recovery on your own node.

Once you have this agreement in place on your Business Network, you need to create the wrapping flows that make recovery possible with all participants.


## Wrapping Flows

To facilitate recovery with parties on a Business Network, you, the Business Network Operator or node operator, must write and distribute simple wrapping flows for:

- [ScheduleReconciliationFlow](./ledger-sync.md#schedule-reconciliation-flow) - this schedules regular reconciliation checks.
- [AutomaticRecoveryFlow](./ledger-recovery-automatic.md#automatic-ledger-recover-flow)
- [InitiateManualRecoveryFlow](./ledger-recovery-manual.md#initiate-manual-recovery-flow)

The purpose of each wrapping flow is to validate the parties specified as input to each Disaster Recovery flow
are members of the Business Network.

## Example Flows

The code snippets in this section are reference implementations of Business Network enabled Disaster Recovery
flows. Use these references to create wrapping flows appropriate to your Business Networks.

### Initiating Business Network Enabled Flows

Each flow in the examples below contains the private function `getMembers`. The implementation of this function is
the responsibility of either the node operator or Business Network operator. It is used throughout the snippets
to demonstrate how membership of a party might be validated using a retrieved list of Business Network members.

### Business Network Initiated Ledger Sync

In order to determine whether or not ledger data is synchronized with the rest of the network after a disaster scenario,
 use `ScheduleReconciliationFlow` to schedule and eventually execute reconciliation with a specified
list of parties. In this case, that list will be verified using a retrieved set of the Business Network members.

{{< note >}}
In order to enable overriding of the ledger-sync reconciliation responder flows, they must be manually specified
in the configuration of the responding node. This can be done by adding the following config block to the node.conf.
{{< /note >}}

```none
flowOverrides {
    overrides=[
        {
            initiator="ReconcileWithPartyFlowInitiator"
            responder="ReconcileWithPartyFlowResponderWithBusinessNetwork"
        }
    ]
}
```

{{< note >}}

After reconciling with all necessary parties, the node operator should then proceed with either automatic or manual recovery.

{{< /note >}}


```kotlin
// Kotlin
    @InitiatingFlow
    @StartableByRPC
    class InitiateReconciliationWithBusinessNetwork(
        private val reconciliationParties: List<Party>
    ): FlowLogic<Unit>() {
        @Suspendable
        override fun call() {
            // Retrieve the list of identities with which we could have shared transaction data
            val businessNetworkMembers: List<Party> = getMembers()

            // Check that all parties we wish to reconcile with are part of the Business Network
            if (businessNetworkMembers.containsAll(reconciliationParties)) {
                throw LedgerSyncException("Only parties in this Business Network are eligible for reconciliation.")    
            }

            // Initiate a subFlow to kick off reconciliation with all parties retrieved
            subFlow(ScheduleReconciliationFlow(reconciliationParties))
        }

        @Suspendable
        private fun getMembers(): List<Party> {
            // Implementation specific retrieval of membership list.
        }
    }

    @InitiatedBy(ReconcileWithPartyFlowInitiator::class)
    class ReconcileWithPartyFlowResponderWithBusinessNetwork(
        private val session: FlowSession
    ): FlowLogic<Unit>() {
        @Suspendable
        override fun call() {
            // Retrieve the list of identities with which we COULD have shared transaction data
            val businessNetworkMembers: List<Party> = getMembers()

            // Check that the counterparty is part of the Business Network
            if (!businessNetworkMembers.contains(session.counterparty)) {
                throw LedgerSyncException("Only parties in this Business Network are eligible for reconciliation.")    
            }

            // Kick off the responding flow to continue to reconcile with the initiating part
            subFlow(ReconcileWithPartyFlowResponder(session))
        }

        @Suspendable
        private fun getMembers(): List<Party> {
            // Implementation specific retrieval of membership list.
        }
    }

```
```java
// Java
    @InitiatingFlow
    @StartableByRPC
    public class InitiateReconciliationWithBusinessNetwork extends FlowLogic<Unit> {

        private final List<Party> reconciliationParties;
        public InitiateReconciliationWithBusinessNetwork(List<Party> reconciliationParties) {
            this.reconciliationParties = reconciliationParties;
        }

        @Suspendable
        @Override
        public void call() throws FlowException {
            // Retrieve the list of identities with which we COULD have shared transaction data
            List<Party> businessNetworkMembers = getMembers();

            // Check that all parties we wish to reconcile with are part of the Business Network
            if (!businessNetworkMembers.containsAll(reconciliationParties)) {
                throw new LedgerSyncException("Only parties in this Business Network are eligible for reconciliation.");
            };

            // Initiate a subFlow to kick off reconciliation with all parties retrieved
            subFlow(new ScheduleReconciliationFlow(reconciliationParties));
        }

        @Suspendable
        public List<Party> getMembers() throws FlowException {
            // Implementation specific retrieval of membership list.
        }
    }

    @InitiatedBy(ReconcileWithPartyFlowInitiator.class)
    public static class ReconcileWithPartyFlowResponderWithBusinessNetwork extends FlowLogic<SignedTransaction> {

        private final FlowSession session;
        public InitiateReconciliationWithBusinessNetworkResponder(session flowSession) {
            this.session = session;
        }

        @Suspendable
        @Override
        public SignedTransaction call() throws FlowException {
            // Retrieve the list of identities with which we COULD have shared transaction data
            List<Party> businessNetworkMembers = getMembers();

            // Check that all parties we wish to reconcile with are part of the Business Network
            if (!businessNetworkMembers.contains(session.counterparty)) {
                throw new LedgerSyncException("Only parties in this Business Network are eligible for reconciliation.");
            }

            // Initiate a subFlow to kick off reconciliation with all parties retrieved
            subFlow(new ReconcileWithPartyFlowResponder(session));
        }

        @Suspendable
        public List<Party> getMembers() throws FlowException {
            // Implementation specific retrieval of membership list.
        }
    }
```

### Business Network enabled automatic recovery

The simplest form of recovering ledger data is executed using `AutomaticLedgerRecover` which on the
basis of a previous reconciliation record or `ReconciliationStatus`, uses built-in Corda processes
to request and retrieve the appropriate transactions from a counter party.

For more information on this process and how it may be further configured please checkout the
[docs](./ledger-recovery-automatic.md).


```kotlin
// Kotlin
    @InitiatingFlow
    @StartableByRPC
    class InitiateAutomaticRecoveryWithBusinessNetwork(
        private val recoveryParty: Party
    ): FlowLogic<Unit>() {
        @Suspendable
        override fun call() {
            // Retrieve the list of identities with which we COULD have shared transaction data
            val businessNetworkMembers: List<Party> = getMembers()

            // Check that all parties we wish to reconcile with are part of the Business Network
            if (businessNetworkMembers.contains(recoveryParty)) {
                throw AutomaticRecoveryException("Only parties in this Business Network are eligible for recovery.")    
            }

            // Initiate a subFlow to kick off recovery with all Business Network members
            subFlow(AutomaticLedgerRecover(recoveryParty))
        }

        @Suspendable
        private fun getMembers(): List<Party> {
            // Implementation specific retrieval of membership list.
        }
    }

    @InitiatedBy(InitiateAutomaticRecoveryWithBusinessNetwork::class)
    class InitiateAutomaticRecoveryResponderWithBusinessNetwork(
        private val session: FlowSession
    ): FlowLogic<Unit>() {
        @Suspendable
        override fun call() {
            // Retrieve the list of identities with which we COULD have shared transaction data
            val businessNetworkMembers: List<Party> = getMembers()

            // Check that the counterparty is part of the Business Network
            if (!businessNetworkMembers.contains(session.counterparty)) {
                throw AutomaticRecoveryException("Only parties in this Business Network are eligible for recovery.")    
            }

            // Kick off the responding flow to continue to reconcile with the initiating part
            subFlow(AutomaticLedgerRecoverFlowResponder(session))
        }

        @Suspendable
        private fun getMembers(): List<Party> {
            // Implementation specific retrieval of membership list.
        }
    }
```
```java
// Java
    @InitiatingFlow
    @StartableByRPC
    public class InitiateAutomaticRecoveryWithBusinessNetwork extends FlowLogic<Unit> {

        private final List<Party> recoveryParties;
        public InitiateReconciliationWithBusinessNetwork(Party recoveryParty) {
            this.recoveryParty = recoveryParty;
        }

        @Suspendable
        @Override
        public void call() throws FlowException {
            // Retrieve the list of identities with which we COULD have shared transaction data
            List<Party> businessNetworkMembers = getMembers();

            // Check that all parties we wish to recover from are part of the Business Network
            if (!businessNetworkMembers.contains(recoveryParty)) {
                throw new AutomaticRecoveryException("Only parties in this Business Network are eligible for recovery.");
            }

            // Initiate a subFlow to kick off recovery with all Business Network members
            subFlow(new AutomaticLedgerRecover(recoveryParty));
        }

        @Suspendable
        public List<Party> getMembers() throws FlowException {
            // Implementation specific retrieval of membership list.
        }
    }

    @InitiatedBy(InitiateAutomaticRecoveryWithBusinessNetwork.class)
    public static class InitiateAutomaticRecoveryResponderWithBusinessNetwork extends FlowLogic<SignedTransaction> {

        private final FlowSession session;
        public InitiateReconciliationWithBusinessNetworkResponder(session flowSession) {
            this.session = session;
        }

        @Suspendable
        @Override
        public SignedTransaction call() throws FlowException {
            // Retrieve the list of identities with which we COULD have shared transaction data
            List<Party> businessNetworkMembers = getMembers();

            // Check that the party who wishes to engage in automatic recovery is part of the Business Network
            if (!businessNetworkMembers.contains(session.counterparty)) {
                throw AutomaticRecoveryException("Only parties in this Business Network are eligible for recovery.");   
            }

            // Initiate a subFlow to kick off reconciliation with all parties retrieved
            subFlow(new ReconcileWithPartyFlowResponder(session));
        }

        @Suspendable
        public List<Party> getMembers() throws FlowException {
            // Implementation specific retrieval of membership list.
        }
    }
```

### Business Network Enabled Manual Recovery

Another option available to node operators is to initiate manual recovery of ledger data. The snippet below
outlines a simple wrapping flow that initiates manual recovery, persisting a record or `RecoveryRequest`
on both the initiating and responding nodes.

The participating nodes may then continue with the processes described [here](./ledger-recovery-manual.md)
to export, transfer and eventually import the missing transaction data.

```kotlin
// Kotlin
    @InitiatingFlow
    @StartableByRPC
    class InitiateManualRecoveryWithBusinessNetwork(
        private val recoveryParty: Party
   ): FlowLogic<Unit>() {
        @Suspendable
        override fun call() {
            // Retrieve the list of identities with which we COULD have shared transaction data
            val businessNetworkMembers: List<Party> = getMembers()

            // Check that all parties we wish to reconcile with are part of the Business Network
            if (!businessNetworkMembers.contains(recoveryParty)) {
                throw ManualRecoveryException("Only parties in this Business Network are eligible for recovery.")    
            }

            // Initiate a subFlow to kick off recovery with all Business Network members
            subFlow(InitiateManualRecoveryFlow(recoveryParty))
        }

        @Suspendable
        private fun getMembers(): List<Party> {
            // Implementation specific retrieval of membership list.
        }
    }

    @InitiatedBy(InitiateManualRecoveryWithBusinessNetwork::class)
    class InitiateManualRecoveryResponderWithBusinessNetwork(
        private val session: FlowSession
    ): FlowLogic<Unit>() {
        @Suspendable
        override fun call() {
            // Retrieve the list of identities with which we COULD have shared transaction data
            val businessNetworkMembers: List<Party> = getMembers()

            // Check that the counterparty is part of the Business Network
            if (!businessNetworkMembers.contains(session.counterparty)) {
                throw ManualRecoveryException("Only parties in this Business Network are eligible for recovery.")    
            }

            // Kick off the responding flow to continue to reconcile with the initiating part
            subFlow(InitiateManualRecoveryFlowResponder(session))
        }

        @Suspendable
        private fun getMembers(): List<Party> {
            // Implementation specific retrieval of membership list.
        }
    }
```
```java
// Java
    @InitiatingFlow
    @StartableByRPC
    public class InitiateManualRecoveryWithBusinessNetwork extends FlowLogic<Unit> {

        private final Party recoveryParties;
        public InitiateReconciliationWithBusinessNetwork(Party recoveryParty) {
            this.recoveryParty = recoveryParty;
        }

        @Suspendable
        @Override
        public void call() throws FlowException {
            // Retrieve the list of identities with which we COULD have shared transaction data
            List<Party> businessNetworkMembers = getMembers();

            // Check that all parties we wish to recover from are part of the Business Network
            if (!businessNetworkMembers.contains(recoveryParty)) {
                throw new ManualRecoveryException("Only parties in this Business Network are eligible for recovery.");
            }

            // Initiate a subFlow to kick off recovery with all Business Network members
            subFlow(new InitiateManualRecoveryFlow(recoveryParty));
        }

        @Suspendable
        public List<Party> getMembers() throws FlowException {
            // Implementation specific retrieval of membership list.
        }
    }

    @InitiatedBy(InitiateAutomaticRecoveryWithBusinessNetwork.class)
    public static class InitiateAutomaticRecoveryResponderWithBusinessNetwork extends FlowLogic<SignedTransaction> {

        private final FlowSession session;
        public InitiateReconciliationWithBusinessNetworkResponder(session flowSession) {
            this.session = session;
        }

        @Suspendable
        @Override
        public SignedTransaction call() throws FlowException {
            // Retrieve the list of identities with which we COULD have shared transaction data
            List<Party> businessNetworkMembers = getMembers();

            // Check that the party who wishes to engage in automatic recovery is part of the Business Network
            if (!businessNetworkMembers.contains(session.counterparty)) {
                throw AutomaticRecoveryException("Only parties in this Business Network are eligible for recovery.");   
            }

            // Initiate a subFlow to kick off reconciliation with all parties retrieved
            subFlow(new ReconcileWithPartyFlowResponder(session));
        }

        @Suspendable
        public List<Party> getMembers() throws FlowException {
            // Implementation specific retrieval of membership list.
        }
    }

```

### Scheduling Recurring Reconciliation

As mentioned previously, a recovering node - or a node that may be missing transaction data - will have no way of knowing which
parties on the network they have previously transacted with. As such, reconciliation should be conducted on a regular basis to
enable the node operator to determine whether or not their vault data is consistent with that of all other parties on the network.

The flow in the snippet below represents a wrapping flow that schedules reconciliation with every member of a Business Network
on a recurring basis. In doing so, a node operator will be informed in a timely manner of any discrepancies between their vault data
and that of counterparties.

It is important to note that communicating with all nodes on the network will impose network load. Smaller networks may be able to
schedule reconciliation more frequently, while larger networks may elect to reconcile less frequently or potentially with a random
subset of available peers. The implementation below reconciles with all parties (likely on a smaller network) once daily. Node operators
must also determine whether or not they wish to recover during operating business hours OR as a routine maintenance activity to be
performed where there is reduced network traffic.

> Note: In general a node's vault is expected to be consistent with the network (such is the major benefit of DLT). This process
> is similar to running database replication technology - an added layer of resiliency and reliability for on-ledger data.

```kotlin
// Kotlin
    @StartableByRPC
    class ScheduleReconciliationWithBusinessNetwork(
        private val stateRef: StateRef
    ): FlowLogic<Unit>() {
        @Suspendable
        override fun call() {
            // PART 1: Scheduling Reconciliation With The Business Network
            // Start by building a transaction to schedule the next reconciliation.
            val input = serviceHub.toStateAndRef<BusinessNetworkReconSchedulerState>(stateRef)
            val output = BusinessNetworkReconSchedulerState(ourIdentity)
            val reconCmd = Command(ReconcileWithNetwork(), ourIdentity.owningKey)

            // Build, sign and finalize the transaction.
            // Note: we are selecting the first notary ONLY for simplicities sake. This should be
            // made explicit in a configuration file for production use.
            val txBuilder = TransactionBuilder(serviceHub.networkMapCache.notaryIdentities.first())
                    .addInputState(input)
                    .addOutputState(output)
                    .addCommand(reconCmd)
            val signedTx = serviceHub.signInitialTransaction(txBuilder)
            subFlow(FinalityFlow(signedTx, listOf()))

            // PART 2: Reconcile With All Members of The Business Network
            // Retrieve the list of identities with which we COULD have shared transaction data
            val businessNetworkMembers: List<Party> = getMembers()

            // Initiate a subFlow to kick off recovery with all Business Network members
            subFlow(InitiateReconciliationWithBusinessNetwork(getMembers()))
        }

        @Suspendable
        private fun getMembers(): List<Party> {
            // Implementation specific retrieval of membership list.
        }
    }

    /**
     * The schedulable state that will be used to kick off reconciliation with all other parties on a Business Network
     * at a regular interval. Defaults to executing once daily.
     */
    @BelongsToContract(BusinessNetworkReconSchedulerContract::class)
    class BusinessNetworkReconSchedulerState(
        private val ourIdentity: Party,
        private val interval: ChronoUnit = ChronoUnit.DAYS,
        private val nextActivityTime: Instant = Instant.now().plus(1, interval)
    ): SchedulableState {
        override val participants get() = listOf(ourIdentity)
        override fun nextScheduledActivity(thisStateRef: StateRef, flowLogicRefFactory: FlowLogicRefFactory): ScheduledActivity? {
            return ScheduledActivity(flowLogicRefFactory.create(ScheduleReconciliationWithBusinessNetwork::class.java), nextActivityTime)
        }
    }

    /**
     * A simple, no-check contract that will be referenced in the issuance of a schedulable state.
     */
    class BusinessNetworkReconSchedulerContract : Contract {
        companion object {
            const val CONTRACT_ID = "com.your.package.name.BusinessNetworkReconSchedulerContract"
        }

        override fun verify(tx: LedgerTransaction) {
            // Omitted for the purpose of this sample.
        }

        interface Commands : CommandData {
            class ReconcileWithNetwork : Commands
        }
    }
```

```java
// Java
    @InitiatingFlow
    @StartableByRPC
    public class ScheduleReconciliationWithBusinessNetwork extends FlowLogic<Unit> {

        private final StateRef stateRef;
        public InitiateReconciliationWithBusinessNetwork(stateRef StateRef) {
            this.stateRef = stateRef;
        }

        @Suspendable
        @Override
        public void call() throws FlowException {
            // PART 1: Scheduling Reconciliation With The Business Network
            // Start by building a transaction to schedule the next reconciliation.
            BusinessNetworkReconSchedulerState input = serviceHub.toStateAndRef<BusinessNetworkReconSchedulerState>(stateRef);
            BusinessNetworkReconSchedulerState output = BusinessNetworkReconSchedulerState(ourIdentity);
            Command<ReconcileWithNetwork> reconCmd = new Command(
                new ReconcileWithNetwork(),
                getOurIdentity.owningKey
            );

            // Build, sign and finalize the transaction.
            // Note: we are selecting the first notary ONLY for simplicities sake. This should be
            // made explicit in a configuration file for production use.
            TransactionBuilder txBuilder = TransactionBuilder(getServiceHub().getNetworkMapCache().getNotaryIdentities().get(0))
                    .addInputState(input)
                    .addOutputState(output)
                    .addCommand(reconCmd);
            val signedTx = getServiceHub.signInitialTransaction(txBuilder);
            subFlow(new FinalityFlow(signedTx, listOf()));

            // PART 2: Reconcile With All Members of The Business Network
            // Retrieve the list of identities with which we COULD have shared transaction data
            List<Party> businessNetworkMembers = getMembers();

            // Initiate a subFlow to kick off recovery with all Business Network members
            subFlow(new InitiateReconciliationWithBusinessNetwork(getMembers()));
        }

        @Suspendable
        public List<Party> getMembers() throws FlowException {
            // Implementation specific retrieval of membership list.
        }
    }

    /**
     * The schedulable state that will be used to kick off reconciliation with all other parties on a Business Network
     * at a regular interval. Defaults to executing once daily.
     */
    @BelongsToContract(BusinessNetworkReconSchedulerContract.class)
    class BusinessNetworkReconSchedulerState implements SchedulableState {
        private final Party ourIdentity;
        private final ChronoUnit interval;
        private final Instant nextActivityTime;

        @ConstructorForDeserialization
        private BusinessNetworkReconSchedulerState(Party ourIdentity, ChronoUnit interval, Instant nextActivityTime) {
            this.ourIdentity = ourIdentity;
            this.interval = interval;
            this.nextActivityTime = nextActivityTime;
        }

        public BusinessNetworkReconSchedulerState(Party ourIdentity, ChronoUnit interval) {
            this.ourIdentity = ourIdentity;
            this.interval = interval;
            this.nextActivityTime = Instant.now().plus(1, interval);
        }

        public BusinessNetworkReconSchedulerState(Party ourIdentity) {
            this.ourIdentity = ourIdentity;
            this.interval = ChronoUnit.DAYS;
            this.nextActivityTime = Instant.now().plus(1, interval);
        }

        @NotNull
        @Override
        public List<AbstractParty> getParticipants() {
            return Collections.singletonList(ourIdentity);
        }

        @Nullable
        @Override
        public ScheduledActivity nextScheduledActivity(@NotNull StateRef thisStateRef, @NotNull FlowLogicRefFactory flowLogicRefFactory) {
            return new ScheduledActivity(flowLogicRefFactory.create(ScheduleReconciliationWithBusinessNetwork.class), nextActivityTime);
        }
    }

    /**
     * A simple, no-check contract that will be referenced in the issuance of a schedulable state.
     */
    class BusinessNetworkReconSchedulerContract implements Contract {
        public static final String CONTRACT_ID = "com.your.package.name.BusinessNetworkReconSchedulerContract";
        public interface Commands extends CommandData {
            class ReconcileWithNetwork extends TypeOnlyCommandData implements Commands{}
        }
        @Override
        public void verify(LedgerTransaction tx) {
            // Omitted for the purpose of this sample.
        }
    }
```
