---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2021-04-27'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-define-TwoPartyTradeFlow-singleton-classes
    parent: corda-os-4-8-flow-state-machines
    weight: 1215
tags:
- flow
- state
- machines
title: Define `TwoPartyTradeFlow` singleton classes
---

## Define `TwoPartyTradeFlow` singleton classes

1. Define classes nested inside the main `TwoPartyTradeFlow` singleton.

   Some of the classes are simply flow messages or exceptions. The other two represent the buyer and seller side of the flow.

2. Add data for the seller:

    * `otherSideSession: FlowSession` - a flow session for communication with the buyer
    * `assetToSell: StateAndRef<OwnableState>` - a pointer to the ledger entry that represents the thing being sold
    * `price: Amount<Currency>` - the agreed on price that the asset is being sold for (without an issuer constraint)
    * `myParty: PartyAndCertificate` - the certificate representing the party that controls the asset being sold

3. Add data for the buyer:

    * `sellerSession: FlowSession` - a flow session for communication with the seller
    * `notary: Party` - the entry in the network map for the chosen notary. See “Notaries” for more information on notaries
    * `acceptablePrice: Amount<Currency>` - the price that was agreed upon out of band. If the seller specifies a price less than or equal to this, then the trade will go ahead
    * `typeToBuy: Class<out OwnableState>` - the type of state that is being purchased. This is used to check that the sell side of the flow isn’t trying to sell us the wrong thing, whether by accident or on purpose
    * `anonymous: Boolean` - whether to generate a fresh, anonymous public key for the transaction


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

    open class Buyer(private val sellerSession: FlowSession,
                     private val notary: Party,
                     private val acceptablePrice: Amount<Currency>,
                     private val typeToBuy: Class<out OwnableState>,
                     private val anonymous: Boolean) : FlowLogic<SignedTransaction>()
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
     public inline class SellerTradeInfo {
         private Amount<Currency> price;
         private PartyAndCertificate payToIdentity;

         public SellerTradeInfo(Amount<Currency> price, PartyAndCertificate payToIdentity) {
            this.price = price;
            this.payToIdentity = payToIdentity;
         }
     }


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

}

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

    }
}
```
{{% /tab %}}

{{< /tabs >}}


Alright, so using this flow shouldn’t be too hard: in the simplest case we can just create a buyer or seller
with the details of the trade, depending on who we are. We then have to start the flow in some way. Just
calling the `call` function ourselves won’t work: instead we need to ask the framework to start the flow for
us. More on that in a moment.
