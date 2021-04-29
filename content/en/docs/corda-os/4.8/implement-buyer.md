---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-implement-buyer
    parent: corda-os-4-8-flow-state-machines
    weight: 1240
tags:
- flow
- state
- machines
title: Implement buyer
---

## Implement buyer

OK, let’s do the same for the buyer side. This code is longer but no more complicated.

1. Perform some sanity checking on the proposed trade transaction received from the seller to ensure you’re being offered
what you expected to be offered.

2. Create a cash spend using `Cash.generateSpend`.

   You can read the vault documentation to learn more about this.

3. Access the *service hub* to access things that are transient and may change or be recreated
whilst a flow is suspended, such as the wallet or the network map.

4. Call `CollectSignaturesFlow` as a subflow to send the unfinished, still-invalid transaction to the seller so
they can sign it and send it back to you.

5. Call `FinalityFlow` as a subflow to finalize the transaction.

As you can see, the flow logic is straightforward and does not contain any callbacks or network glue code, despite
the fact that it takes minimal resources and can survive node restarts.

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
