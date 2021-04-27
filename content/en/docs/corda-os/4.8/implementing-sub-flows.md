---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-implementing-sub-flows
    parent: corda-os-4-8-flow-state-machines
    weight: 1260
tags:
- flow
- state
- machines
title: Implementing sub-flows
---


## Implementing sub-flows

Flows can be composed via nesting. Invoking a sub-flow looks similar to an ordinary function call:

{{< tabs name="tabs-4" >}}
{{% tab name="kotlin" %}}
```kotlin
@Suspendable
fun call() {
    val unnotarisedTransaction = ...
    subFlow(FinalityFlow(unnotarisedTransaction))
}
```
{{% /tab %}}

{{% tab name="java" %}}
```java
@Suspendable
public void call() throws FlowException {
    SignedTransaction unnotarisedTransaction = ...
    subFlow(new FinalityFlow(unnotarisedTransaction))
}
```
{{% /tab %}}

{{< /tabs >}}

Let’s take a look at the three subflows we invoke in this flow.


### FinalityFlow

On the buyer side, we use `FinalityFlow` to finalise the transaction. It will:

* Send the transaction to the chosen notary and, if necessary, satisfy the notary that the transaction is valid.
* Record the transaction in the local vault, if it is relevant (that is, involves the owner of the node).
* Send the fully signed transaction to the other participants for recording as well.

On the seller side we use `ReceiveFinalityFlow` to receive and record the finalised transaction.


{{< warning >}}
If the buyer stops before sending the finalised transaction to the seller, the buyer is left with a
valid transaction but the seller isn’t, so they don’t get the cash! This sort of thing is not
always a risk (as the buyer may not gain anything from that sort of behaviour except a lawsuit), but if it is, a future
version of the platform will allow you to ask the notary to send you the transaction as well, in case your counterparty
does not. This is not the default because it reveals more private info to the notary.

{{< /warning >}}


We simply create the flow object via its constructor, and then pass it to the `subFlow` method which
returns the result of the flow’s execution directly. Behind the scenes all this is doing is wiring up progress
tracking (discussed more below) and then running the object’s `call` method. Because the sub-flow might suspend,
we must mark the method that invokes it as suspendable.

Within FinalityFlow, we use a further sub-flow called `ReceiveTransactionFlow`. This is responsible for downloading
and checking all the dependencies of a transaction, which in Corda are always retrievable from the party that sent you a
transaction that uses them. This flow returns a list of `LedgerTransaction` objects.

{{< note >}}
Transaction dependency resolution assumes that the peer you got the transaction from has all of the
dependencies itself. It must do, otherwise it could not have convinced itself that the dependencies were themselves
valid. It’s important to realise that requesting only the transactions we require is a privacy leak, because if
we don’t download a transaction from the peer, they know we must have already seen it before. Fixing this privacy
leak will come later.
{{< /note >}}

#### Finalizing transactions with only one participant

In some cases, transactions will only have one participant, the initiator. In these instances, there are no other
parties to send the transactions to during `FinalityFlow`. In these cases, the `counterpartySession` list must exist,
but be empty.


### CollectSignaturesFlow/SignTransactionFlow

We also invoke two other subflows:


* `CollectSignaturesFlow`, on the buyer side
* `SignTransactionFlow`, on the seller side

These flows communicate to gather all the required signatures for the proposed transaction. `CollectSignaturesFlow`
will:


* Verify any signatures collected on the transaction so far.
* Verify the transaction itself.
* Send the transaction to the remaining required signers and receive back their signatures.
* Verify the collected signatures.

`SignTransactionFlow` responds by:


* Receiving the partially-signed transaction off the wire.
* Verifying the existing signatures.
* Resolving the transaction’s dependencies.
* Verifying the transaction itself.
* Running any custom validation logic.
* Sending their signature back to the buyer.
* Waiting for the transaction to be recorded in their vault.

We cannot instantiate `SignTransactionFlow` itself, as it’s an abstract class. Instead, we need to subclass it and
override `checkTransaction()` to add our own custom validation logic:

{{< tabs name="tabs-5" >}}
{{% tab name="kotlin" %}}
```kotlin
val signTransactionFlow = object : SignTransactionFlow(otherSideSession, VERIFYING_AND_SIGNING.childProgressTracker()) {
    override fun checkTransaction(stx: SignedTransaction) {
        // Verify that we know who all the participants in the transaction are
        val states: Iterable<ContractState> = serviceHub.loadStates(stx.tx.inputs.toSet()).map { it.state.data } + stx.tx.outputs.map { it.data }
        states.forEach { state ->
            state.participants.forEach { anon ->
                require(serviceHub.identityService.wellKnownPartyFromAnonymous(anon) != null) {
                    "Transaction state $state involves unknown participant $anon"
                }
            }
        }

        if (stx.tx.outputStates.sumCashBy(myParty.party).withoutIssuer() != price)
            throw FlowException("Transaction is not sending us the right amount of cash")
    }
}

val txId = subFlow(signTransactionFlow).id

```
{{% /tab %}}

{{% tab name="java" %}}
```java
public class signTransactionFlow extends FlowLogic<SignedTransaction> {

    ProgressTracker progressTracker = new ProgressTracker();


    public SignTransactionFlow(otherSideSession, VERIFYING_AND_SIGNING.childProgressTracker()) {}




    @Override
    public void checkTransaction(SignedTransaction stx) {

        List<States> states = getServiceHub().loadStates(stx.tx.inputs.toSet()).stream().map( it -> it.getState.getData).collect(Collectors.toList());

        states.addAll(stx.getTx().getOutputs().stream().map(it -> it.getData()).collect(Collectors.toList()));

        for(State state: states){

            for(AbstractParty anon: state.getParticipants()){
                // "Transaction state $state involves unknown participant $anon"
                assertNotNull(getServiceHub().getIdentityService().getWellKnownPartyFromAnonymous(anon));
            }
        }

    }


    if (stx.getTx().getOutputs().sumCashBy(myParty.getParty()).withoutIssuer() != price) {
        throw new FlowException("Transaction is not sending us the right amount of cash");
    }

    SignedTransaction txId = subFlow(signTransactionFlow).getId();

}
```
{{% /tab %}}


[TwoPartyTradeFlow.kt](https://github.com/corda/corda/blob/release/os/4.8/finance/workflows/src/main/kotlin/net/corda/finance/flows/TwoPartyTradeFlow.kt) | ![github](/images/svg/github.svg "github")

{{< /tabs >}}

In this case, our custom validation logic ensures that the amount of cash outputs in the transaction equals the
price of the asset.
