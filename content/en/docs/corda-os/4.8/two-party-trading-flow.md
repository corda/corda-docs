---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2021-04-27'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-two-party-trading-flow
    parent: corda-os-4-8-flow-state-machines
    weight: 1210
tags:
- flow
- state
- machines
title: Two-party trading flow
---

## Use-case: a two-party trading flow

For the purposes of this tutorial, we will focus on the use-case of a basic, shared transaction: a seller wishes to sell some
*asset* (for example, some commercial paper) in return for *cash*. The buyer wishes to purchase the asset, also using cash. Both parties
want the trade to be atomic so that neither side is exposed to the risk of settlement failure. We assume that the buyer
and seller have found each other and agreed on the details of an exchange.

The focus of this tutorial is on how to implement the flows needed for this transaction. The details of how
the trade is arranged are not covered in this tutorial.

Our flow has two parties (B and S for buyer and seller) and will proceed as follows:


* S sends a `StateAndRef` pointing to the state they want to sell to B, along with info about the price they require
B to pay.
* B sends to S a `SignedTransaction` that includes two inputs (the state owned by S, and cash owned by B) and three
outputs (the state now owned by B, the cash now owned by S, and any change cash still owned by B). The
`SignedTransaction` has a single signature from B but isn’t valid because it lacks a signature from S authorising
movement of the asset.
* S signs the transaction and sends it back to B.
* B *finalises* the transaction by sending it to the notary who checks the transaction for validity, recording the
transaction in B’s local vault, and then sending it on to S who also checks it and commits the transaction to S’s
local vault.

You can find the implementation of this flow in the file `finance/workflows/src/main/kotlin/net/corda/finance/TwoPartyTradeFlow.kt`.

Assuming no malicious termination, they both end the flow being in possession of a valid, signed transaction that
represents an atomic asset swap.

Note that it’s the *seller* who initiates contact with the buyer, not vice-versa as you might imagine.

We start by defining two classes that will contain the flow definition. We also pick what data will be used by
each side.

{{< note >}}
The code samples in this tutorial are only available in Kotlin and Java, but you can use any JVM language to
write them and the approach is the same.

{{< /note >}}
{{< tabs name="tabs-1" >}}
{{% tab name="kotlin" %}}
```kotlin
object TwoPartyTradeFlow {
    class UnacceptablePriceException(givenPrice: Amount<Currency>) : FlowException("Unacceptable price: $givenPrice")
    class AssetMismatchException(val expectedTypeName: String, val typeName: String) : FlowException() {
        override fun toString() = "The submitted asset didn't match the expected type: $expectedTypeName vs $typeName"
    }

    /**
     * This object is serialised to the network and is the first flow message the seller sends to the buyer.
     *
     * @param payToIdentity anonymous identity of the seller, for payment to be sent to.
     */
    @CordaSerializable
    data class SellerTradeInfo(
            val price: Amount<Currency>,
            val payToIdentity: PartyAndCertificate
    )

    open class Seller(private val otherSideSession: FlowSession,
                      private val assetToSell: StateAndRef<OwnableState>,
                      private val price: Amount<Currency>,
                      private val myParty: PartyAndCertificate,
                      override val progressTracker: ProgressTracker = TwoPartyTradeFlow.Seller.tracker()) : FlowLogic<SignedTransaction>() {

        companion object {
            fun tracker() = ProgressTracker()
        }

        @Suspendable
        override fun call(): SignedTransaction {
            TODO()
        }
    }

    open class Buyer(private val sellerSession: FlowSession,
                     private val notary: Party,
                     private val acceptablePrice: Amount<Currency>,
                     private val typeToBuy: Class<out OwnableState>,
                     private val anonymous: Boolean) : FlowLogic<SignedTransaction>() {

        @Suspendable
        override fun call(): SignedTransaction {
            TODO()
        }
    }
}

```
{{% /tab %}}

{{% tab name="java" %}}
```java
@InitiatingFlow
@StartableByRPC
public class TwoPartyTradeFlow extends FlowLogic<SignedTransaction> {

    public inline class UnacceptablePriceException {
        private int givenPrice;

        private OptionalInt(Amount<Currency> givenPrice) {
            if (givenPrice < 1) { // if price is invalid
                FlowException("Unacceptable price: $givenPrice");
            }
        }
    }

    public inline class AssetMismatchException extends FlowException {
        private String expectedTypeName;
        private String typeName;

        private toString() {
            return "The submitted asset didn't match the expected type: " + expectedTypeName + " vs " + typeName;
        }
    }

    /**
     * This object is serialised to the network and is the first flow message the seller sends to the buyer.
     *
     * @param payToIdentity anonymous identity of the seller, for payment to be sent to.
     */
     @CordaSerializable
     public inline class SellerTradeInfo {
         private Amount<Currency> price;
         private PartyAndCertificate payToIdentity;

         public SellerTradeInfo(Amount<Currency> price, PartyAndCertificate payToIdentity) {
            this.price = price;
            this.payToIdentity = payToIdentity;
         }
     }


     @CordaSerializable
     public inline class Seller extends FlowLogic<SignedTransaction> {
        private FlowSession otherSideSession;
        private StateAndRef<OwnableState> assetToSell;
        private Amount<Currency> price;
        private PartyAndCertificate myParty;

        public SellerTradeInfo(FlowSession otherSideSession, StateAndRef<OwnableState> assetToSell, Amount<Currency> price, PartyAndCertificate myParty) {
            this.otherSideSession = otherSideSession;
            this.assetToSell = assetToSell;
            this.price = price;
            this.myParty = myParty;
        }
     }

    @Nullable
    @Override
    public ProgressTracker getProgressTracker() {
    return new ProgressTracker();
    }

    @Nullable
    @Override
    public ProgressTracker tracker() {
        return new ProgressTracker();
    }

    @Suspendable
    @Override
    public SignedTransaction call() throws FlowException {
        // TODO
    }

}


    @CordaSerializable
    public inline class Buyer extends FlowLogic<SignedTransaction> {
        private FlowSession sellerSession;
        private Party notary;
        private Amount<Currency> acceptablePrice;
        private Class<out OwnableState> typeToBuy;
        private Boolean anonymous;

        public Buyer(private FlowSession sellerSession, private Party notary, private Amount<Currency> acceptablePrice, private Class<out OwnableState> typeToBuy, private Boolean anonymous) {
            this.sellerSession = sellerSession;
            this.notary = notary;
            this.acceptablePrice = acceptablePrice;
            this.typeToBuy = typeToBuy;
            this.anonymous = anonymous;
        }

        @Suspendable
        @Override
        public SignedTransaction call() throws FlowException {
        // TODO
        }
    }
}
```
{{% /tab %}}

{{< /tabs >}}

This code defines several classes nested inside the main `TwoPartyTradeFlow` singleton. Some of the classes are
simply flow messages or exceptions. The other two represent the buyer and seller side of the flow.

Going through the data needed to become a seller, we have:


* `otherSideSession: FlowSession` - a flow session for communication with the buyer
* `assetToSell: StateAndRef<OwnableState>` - a pointer to the ledger entry that represents the thing being sold
* `price: Amount<Currency>` - the agreed on price that the asset is being sold for (without an issuer constraint)
* `myParty: PartyAndCertificate` - the certificate representing the party that controls the asset being sold

And for the buyer:


* `sellerSession: FlowSession` - a flow session for communication with the seller
* `notary: Party` - the entry in the network map for the chosen notary. See “Notaries” for more information on
notaries
* `acceptablePrice: Amount<Currency>` - the price that was agreed upon out of band. If the seller specifies
a price less than or equal to this, then the trade will go ahead
* `typeToBuy: Class<out OwnableState>` - the type of state that is being purchased. This is used to check that the
sell side of the flow isn’t trying to sell us the wrong thing, whether by accident or on purpose
* `anonymous: Boolean` - whether to generate a fresh, anonymous public key for the transaction

Alright, so using this flow shouldn’t be too hard: in the simplest case we can just create a Buyer or Seller
with the details of the trade, depending on who we are. We then have to start the flow in some way. Just
calling the `call` function ourselves won’t work: instead we need to ask the framework to start the flow for
us. More on that in a moment.
