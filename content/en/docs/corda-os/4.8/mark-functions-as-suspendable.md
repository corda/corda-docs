---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-mark-functions-as-suspendable
    parent: corda-os-4-8-flow-state-machines
    weight: 1220
tags:
- flow
- state
- machines
title: Mark functions as suspendable
---

## Mark functions as suspendable

* Mark the `call` function of the buyer/seller classes with the `@Suspendable` annotation.

As mentioned above, our flow framework will at points suspend the code and serialise it to disk. For this to work,
any methods on the call stack must have been pre-marked as `@Suspendable` so the bytecode rewriter knows to modify
the underlying code to support this new feature. A flow is suspended when calling either `receive`, `send` or
`sendAndReceive` which we will learn more about below. For now, just be aware that when one of these methods is
invoked, all methods on the stack must have been marked. If you forget, then in the unit test environment, you will
get a useful error message telling you which methods you didn’t mark. The fix is simple enough: just add the annotation
and try again.

{{< note >}}
Java 9 is likely to remove this pre-marking requirement completely.
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

    @Suspendable
    @Override
    public SignedTransaction call() throws FlowException {
        // TODO
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
