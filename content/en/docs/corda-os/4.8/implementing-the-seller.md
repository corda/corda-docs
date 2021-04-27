---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-implementing-the-seller
    parent: corda-os-4-8-flow-state-machines
    weight: 1240
tags:
- flow
- state
- machines
title: Implementing the seller
---


## Implementing the seller

Let’s implement the `Seller.call` method that will be run when the flow is invoked.

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

We start by sending information about the asset we wish to sell to the buyer. We fill out the initial flow message with
the trade info, and then call `otherSideSession.send`. which takes two arguments:


* The party we wish to send the message to
* The payload being sent

`otherSideSession.send` will serialise the payload and send it to the other party automatically.

Next, we call a *subflow* called `IdentitySyncFlow.Receive` (see [Implementing sub-flows](#subflows)). `IdentitySyncFlow.Receive`
ensures that our node can de-anonymise any confidential identities in the transaction it’s about to be asked to sign.

Next, we call another subflow called `SignTransactionFlow`. `SignTransactionFlow` automates the process of:


* Receiving a proposed trade transaction from the buyer, with the buyer’s signature attached.
* Checking that the proposed transaction is valid.
* Calculating and attaching our own signature so that the transaction is now signed by both the buyer and the seller.
* Sending the transaction back to the buyer.

The transaction then needs to be finalized. This is the the process of sending the transaction to a notary to assert
(with another signature) that the time-window in the transaction (if any) is valid and there are no double spends.
In this flow, finalization is handled by the buyer, we just wait for them to send it to us. It will have the same ID as
the one we started with but more signatures.


## Implementing the buyer

OK, let’s do the same for the buyer side:

{{< tabs name="tabs-3" >}}
{{% tab name="kotlin" %}}
```kotlin
@Suspendable
override fun call(): SignedTransaction {
    // Wait for a trade request to come in from the other party.
    progressTracker.currentStep = RECEIVING
    val (assetForSale, tradeRequest) = receiveAndValidateTradeRequest()

    // Create the identity we'll be paying to, and send the counterparty proof we own the identity
    val buyerAnonymousIdentity = if (anonymous)
        serviceHub.keyManagementService.freshKeyAndCert(ourIdentityAndCert, false)
    else
        ourIdentityAndCert
    // Put together a proposed transaction that performs the trade, and sign it.
    progressTracker.currentStep = SIGNING
    val (ptx, cashSigningPubKeys) = assembleSharedTX(assetForSale, tradeRequest, buyerAnonymousIdentity)

    // DOCSTART 6
    // Now sign the transaction with whatever keys we need to move the cash.
    val partSignedTx = serviceHub.signInitialTransaction(ptx, cashSigningPubKeys)

    // Sync up confidential identities in the transaction with our counterparty
    subFlow(IdentitySyncFlow.Send(sellerSession, ptx.toWireTransaction(serviceHub)))

    // Send the signed transaction to the seller, who must then sign it themselves and commit
    // it to the ledger by sending it to the notary.
    progressTracker.currentStep = COLLECTING_SIGNATURES
    val sellerSignature = subFlow(CollectSignatureFlow(partSignedTx, sellerSession, sellerSession.counterparty.owningKey))
    val twiceSignedTx = partSignedTx + sellerSignature
    // DOCEND 6

    // Notarise and record the transaction.
    progressTracker.currentStep = RECORDING
    return subFlow(FinalityFlow(twiceSignedTx, sellerSession))
}

@Suspendable
private fun receiveAndValidateTradeRequest(): Pair<StateAndRef<OwnableState>, SellerTradeInfo> {
    val assetForSale = subFlow(ReceiveStateAndRefFlow<OwnableState>(sellerSession)).single()
    return assetForSale to sellerSession.receive<SellerTradeInfo>().unwrap {
        progressTracker.currentStep = VERIFYING
        // What is the seller trying to sell us?
        val asset = assetForSale.state.data
        val assetTypeName = asset.javaClass.name

        // The asset must either be owned by the well known identity of the counterparty, or we must be able to
        // prove the owner is a confidential identity of the counterparty.
        val assetForSaleIdentity = serviceHub.identityService.wellKnownPartyFromAnonymous(asset.owner)
        require(assetForSaleIdentity == sellerSession.counterparty){"Well known identity lookup returned identity that does not match counterparty"}

        // Register the identity we're about to send payment to. This shouldn't be the same as the asset owner
        // identity, so that anonymity is enforced.
        val wellKnownPayToIdentity = serviceHub.identityService.verifyAndRegisterIdentity(it.payToIdentity) ?: it.payToIdentity
        require(wellKnownPayToIdentity.party == sellerSession.counterparty) { "Well known identity to pay to must match counterparty identity" }

        if (it.price > acceptablePrice)
            throw UnacceptablePriceException(it.price)
        if (!typeToBuy.isInstance(asset))
            throw AssetMismatchException(typeToBuy.name, assetTypeName)

        it
    }
}

@Suspendable
private fun assembleSharedTX(assetForSale: StateAndRef<OwnableState>, tradeRequest: SellerTradeInfo, buyerAnonymousIdentity: PartyAndCertificate): SharedTx {
    val ptx = TransactionBuilder(notary)

    // Add input and output states for the movement of cash, by using the Cash contract to generate the states
    val (tx, cashSigningPubKeys) = CashUtils.generateSpend(serviceHub, ptx, tradeRequest.price, ourIdentityAndCert, tradeRequest.payToIdentity.party)

    // Add inputs/outputs/a command for the movement of the asset.
    tx.addInputState(assetForSale)

    val (command, state) = assetForSale.state.data.withNewOwner(buyerAnonymousIdentity.party)
    tx.addOutputState(state, assetForSale.state.contract, assetForSale.state.notary)
    tx.addCommand(command, assetForSale.state.data.owner.owningKey)

    // We set the transaction's time-window: it may be that none of the contracts need this!
    // But it can't hurt to have one.
    val currentTime = serviceHub.clock.instant()
    tx.setTimeWindow(currentTime, 30.seconds)

    return SharedTx(tx, cashSigningPubKeys)
}

```
{{% /tab %}}


{{% tab name="java" %}}
```java
@Suspendable
@Override
public SignedTransaction call() throws FlowException{
    progressTracker.setCurrentStep(RECEIVING);

    Pair<StateAndRef<OwnableState>, SellerTradeInfo> p = receiveAndValidateTradeRequest();
    StateAndRef<OwnableState> assetForSale = p.getKey();
    SellerTradeInfotradeRequest tradeRequest = p.getValue();

    // Create the identity we'll be paying to, and send the counterparty proof we own the identity
    PartyAndCertificate buyerAnonymousIdentity = ourIdentityAndCert;

    if (this.anonymous) {
        buyerAnonymousIdentity getServiceHub().getKeyManagementService().freshKeyAndCert(ourIdentityAndCert, false);
    }

    // Put together a proposed transaction that performs the trade, and sign it.
    progressTracker.setCurrentStep(SIGNING);
    Triple<TransactionBuilder, List<PublicKey>, List<TransactionSignature>> trip = assembleSharedTX(assetForSale, tradeRequest, buyerAnonymousIdentity);

    TransactionBuilder ptx =  trip.getLeft();
    List<PublicKey> cashSigningPubKeys = trip.getMiddle();

    // DOCSTART 6
    // Now sign the transaction with whatever keys we need to move the cash.
    SignedTransaction partSignedTx = getServiceHub().signInitialTransaction(ptx, cashSigningPubKeys);

    // Sync up confidential identities in the transaction with our counterparty
    subFlow(new IdentitySyncFlow().Send(sellerSession, ptx.toWireTransaction(serviceHub)));


    // Send the signed transaction to the seller, who must then sign it themselves and commit
    // it to the ledger by sending it to the notary.
    progressTracker.setCurrentStep(COLLECTING_SIGNATURES);

    TransactionSignature sellerSignature = subFlow(CollectSignatureFlow(partSignedTx, sellerSession, sellerSession.getCounterparty().getOwningKey()));

    List<TransactionSignature> twiceSignedTx = new ArrayList<TransactionSignature>();
    twiceSignedTx.add(partSignedTx);
    twiceSignedTx.add(sellerSignature);

    // DOCEND 6

    // Notarise and record the transaction.
    progressTracker.setCurrentStep(RECORDING);
    return subFlow(new FinalityFlow(twiceSignedTx, sellerSession));

}



@Suspendable
private Pair<StateAndRef<OwnableState>, SellerTradeInfo> receiveAndValidateTradeRequest() {

    OwnableState assetForSale = subFlow(ReceiveStateAndRefFlow<OwnableState>(sellerSession)).single();

    progressTracker.setCurrentStep(VERIFYING);

    // What is the seller trying to sell us?
    StateAndRef asset = assetForSale.getState().getData();
    String assetTypeName = asset.getClass().getName();


    // The asset must either be owned by the well known identity of the counterparty, or we must be able to
    // prove the owner is a confidential identity of the counterparty.
    Party assetForSaleIdentity = getServiceHub().getIdentityService().getWellKnownPartyFromAnonymous(asset.owner);

    //"Well known identity lookup returned identity that does not match counterparty"
    assertEqual(assetForSaleIdentity, sellerSession.counterparty)

    // Register the identity we're about to send payment to. This shouldn't be the same as the asset owner
    // identity, so that anonymity is enforced.

    wellKnownPayToIdentity = ((getServiceHub().getIdentityService().verifyAndRegisterIdentity(sellerSession.receive<SellerTradeInfo>().getPayToIdentity()) == null) ? (getServiceHub().getIdentityService().verifyAndRegisterIdentity(sellerSession.receive<SellerTradeInfo>().getPayToIdentity()) : sellerSession.receive<SellerTradeInfo>().getPayToIdentity());

    // "Well known identity to pay to must match counterparty identity"
    assertEqual(wellKnownPayToIdentity.party, sellerSession.counterparty);


    if (sellerSession.receive<SellerTradeInfo>().price > acceptablePrice)
        throw UnacceptablePriceException(sellerSession.receive<SellerTradeInfo>().price)
    if (!typeToBuy instanceof asset)
        throw AssetMismatchException(typeToBuy.name, assetTypeName)

    return new Pair<>(assetForSale, sellerSession.receive<SellerTradeInfo>());
}



@Suspendable
    private SharedTx assembleSharedTX(StateAndRef<OwnableState> assetForSale, SellerTradeInfo tradeRequest, PartyAndCertificate buyerAnonymousIdentity) {
    TransactionBuilder ptx = new TransactionBuilder(notary);


    // Add input and output states for the movement of cash, by using the Cash contract to generate the states
    Triple<TransactionBuilder, List<PublicKey>, List<TransactionSignature>> trip = CashUtils.generateSpend(getServiceHub(), ptx, tradeRequest.getPrice(), ourIdentityAndCert, tradeRequest().getPayToIdentity().getParty());

    TransactionBuilder tx =  trip.getLeft();
    List<PublicKey> cashSigningPubKeys = trip.getMiddle();

    // Add inputs/outputs/a command for the movement of the asset.
    tx.addInputState(assetForSale);

    Pair<Commands, State> p = assetForSale.getState().getData().withNewOwner(buyerAnonymousIdentity.getParty());
    Command command = p.getKey();
    State state = p.getValue();


    tx.addOutputState(state, assetForSale.getState().getContract(), assetForSale.getState().getNotary());
    tx.addCommand(command, assetForSale.getState().getData().getOwner().getOwningKey());

    // We set the transaction's time-window: it may be that none of the contracts need this!
    // But it can't hurt to have one.
    Instant currentTime = getServiceHub().getClock().instant();
    tx.setTimeWindow(currentTime, 30.getSeconds());

    return SharedTx(tx, cashSigningPubKeys);
}


{{% /tab %}}


[TwoPartyTradeFlow.kt](https://github.com/corda/corda/blob/release/os/4.8/finance/workflows/src/main/kotlin/net/corda/finance/flows/TwoPartyTradeFlow.kt) | ![github](/images/svg/github.svg "github")

{{< /tabs >}}

This code is longer but no more complicated. Here are some things to pay attention to:


* We do some sanity checking on the proposed trade transaction received from the seller to ensure we’re being offered
what we expected to be offered.
* We create a cash spend using `Cash.generateSpend`. You can read the vault documentation to learn more about this.
* We access the *service hub* as needed to access things that are transient and may change or be recreated
whilst a flow is suspended, such as the wallet or the network map.
* We call `CollectSignaturesFlow` as a subflow to send the unfinished, still-invalid transaction to the seller so
they can sign it and send it back to us.
* Last, we call `FinalityFlow` as a subflow to finalize the transaction.

As you can see, the flow logic is straightforward and does not contain any callbacks or network glue code, despite
the fact that it takes minimal resources and can survive node restarts.
