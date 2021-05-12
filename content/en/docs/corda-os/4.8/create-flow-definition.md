---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2021-04-27'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-create-flow-definition
    parent: corda-os-4-8-flow-state-machines
    weight: 1210
tags:
- flow
- state
- machines
title: Create flow definition
---

## Create flow definition

{{< note >}}

The code examples in this tutorial are only available in Kotlin and Java, but you can use any JVM language to
write them and the approach is the same.

{{< /note >}}

1. Define two classes containing the flow definition.

2. Provide data used by each side of the transaction.

{{< tabs name="tabs-1" >}}

{{% tab name="kotlin" %}}

```kotlin
object TwoPartyTradeFlow {
    class UnacceptablePriceException(givenPrice: Amount<Currency>) : FlowException("Unacceptable price: $givenPrice")
    class AssetMismatchException(val expectedTypeName: String, val typeName: String) : FlowException() {
        override fun toString() = "The submitted asset didn't match the expected type: $expectedTypeName vs $typeName"
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

{{% /tab %}}

{{< /tabs >}}
