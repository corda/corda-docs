---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-implement-seller
    parent: corda-os-4-8-flow-state-machines
    weight: 1236
tags:
- flow
- state
- machines
title: Implement seller
---


## Implement seller

Implement the `Seller.call` method that will be run when the flow is invoked. Start by sending information about the asset you wish to sell to the buyer.

1. Fill out the initial flow message with the trade info, and then call `otherSideSession.send`. It takes two arguments:

   * The party we wish to send the message to.
   * The payload being sent.

   `otherSideSession.send` will serialise the payload and send it to the other party automatically.

2. Call a *subflow* called `IdentitySyncFlow.Receive` (see [Implementing sub-flows](#subflows)).

   `IdentitySyncFlow.Receive` ensures that your node can de-anonymise any confidential identities in the transaction it’s about to be asked to sign.

3. Call another subflow called `SignTransactionFlow`.

   `SignTransactionFlow` automates the process of:

   * Receiving a proposed trade transaction from the buyer, with the buyer’s signature attached.
   * Checking that the proposed transaction is valid.
   * Calculating and attaching our own signature so that the transaction is now signed by both the buyer and the seller.
   * Sending the transaction back to the buyer.

The transaction then needs to be finalized. This is the the process of sending the transaction to a notary to assert
(with another signature) that the time-window in the transaction (if any) is valid and there are no double spends.
In this flow, finalization is handled by the buyer, the seller just waits for them to send it to them. It will have the same ID as
the one you started with but more signatures.

{{< tabs name="tabs-2" >}}
{{% tab name="kotlin" %}}
```kotlin
@Suspendable
override fun call(): SignedTransaction {
    progressTracker.currentStep = AWAITING_PROPOSAL
    // Make the first message we'll send to kick off the flow.
    val hello = SellerTradeInfo(price, myParty)
    // What we get back from the other side is a transaction that *might* be valid and acceptable to us,
    // but we must check it out thoroughly before we sign!
    // SendTransactionFlow allows seller to access our data to resolve the transaction.
    subFlow(SendStateAndRefFlow(otherSideSession, listOf(assetToSell)))
    otherSideSession.send(hello)

    // Verify and sign the transaction.
    progressTracker.currentStep = VERIFYING_AND_SIGNING

    // DOCSTART 07
    // Sync identities to ensure we know all of the identities involved in the transaction we're about to
    // be asked to sign
    subFlow(IdentitySyncFlow.Receive(otherSideSession))
    // DOCEND 07

    // DOCSTART 5
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
    // DOCEND 5

    return subFlow(ReceiveFinalityFlow(otherSideSession, expectedTxId = txId))
}

```
{{% /tab %}}

{{% tab name="java" %}}
```java

@Suspendable
@Override
public SignedTransaction call() throws FlowException {

    progressTracker.setCurrentStep(AWAITING_PROPOSAL);

    // Make the first message we'll send to kick off the flow.
    SellerTradeInfo hello = new SellerTradeInfo(price, myParty);
    // What we get back from the other side is a transaction that *might* be valid and acceptable to us,
    // but we must check it out thoroughly before we sign!
    // SendTransactionFlow allows seller to access our data to resolve the transaction.
    subFlow(SendStateAndRefFlow(otherSideSession, Arrays.asList(assetToSell)));
    otherSideSession.send(hello);

    // Verify and sign the transaction.
    progressTracker.setCurrentStep(VERIFYING_AND_SIGNING);

    // DOCSTART 07
    // Sync identities to ensure we know all of the identities involved in the transaction we're about to
    // be asked to sign
    subFlow(IdentitySyncFlow.Receive(otherSideSession));

    // DOCEND 07

    // DOCSTART 5
    SignTransactionFlow signTransactionFlow = SignTransactionFlow(otherSideSession, VERIFYING_AND_SIGNING.childProgressTracker())

        @Override
        void checkTransaction(SignedTransaction stx) {
            // Verify that we know who all the participants in the transaction are
            Iterable<ContractState> states = getServiceHub().loadStates(stx.getTx().getInputs().toSet()).stream().map(it -> it.getState.getData).collect(Collectors.toList()) + stx.getTx().getOutputs().stream().map(it -> it.getState.getData).collect(Collectors.toList());


            for(State state: states) {
                for(AbstractParty anon: state.getParticipants()) {
                    // "Transaction state $state involves unknown participant $anon"
                    assertNotNull(getServiceHub().getIdentityService().getWellKnownPartyFromAnonymous(anon), "Transaction state involves unknown participant");
                }
            }

            if (stx.getTx().getOutputStates().sumCashBy(myParty.getParty()).withoutIssuer() != price) {
                throw new FlowException("Transaction is not sending us the right amount of cash");
            }

        }
    }


    SecureHash txId = subFlow(signTransactionFlow).getId();
    // DOCEND 5

    return subFlow(ReceiveFinalityFlow(otherSideSession, txId));
}

{{% /tab %}}


[TwoPartyTradeFlow.kt](https://github.com/corda/corda/blob/release/os/4.8/finance/workflows/src/main/kotlin/net/corda/finance/flows/TwoPartyTradeFlow.kt) | ![github](/images/svg/github.svg "github")

{{< /tabs >}}
