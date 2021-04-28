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
    weight: 1200
tags:
- flow
- state
- machines
title: Two-party trading flow use case
---

## Two-party trading flow use case

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

{{< note >}}

It is the *seller* who initiates contact with the buyer, not vice-versa as you might imagine.

{{< /note >}}
