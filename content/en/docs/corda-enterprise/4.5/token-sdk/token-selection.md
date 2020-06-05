---
date: '2020-05-10T12:00:00Z'
menu: token-sdk
tags:
- building
- against
- release
title: Selection in the Token SDK
---

# Token selection using the Token SDK

When you move tokens using the Token SDK, it's possible to choose which reserve of tokens you want to use, and how much from each reserve, in any given transaction.

This process is called **Selection**.

You can write flows for moving your tokens that allow selection from either:

* The database which stores token data.
* In-memory data, which is like a cache of a party's current token data.

**In-memory selection** is a much faster method of choosing the right token reserves to use in a transaction. However, you may decide you prefer **Database** selection as it keeps the database as the only active source of truth for your tokens.

## Use Database Selection

In the Token SDK, database selection is the default method of selection for each transaction.

In move flows of multiple tokens using database selection, you specify the `selectionType` in the `TransactionBuilder`, along with the preferred selection source of payment.

In the example below, multiple fungible moves would be added to a token using database selection:

```java
@Suspendable
@JvmOverloads
fun addMoveFungibleTokens(
        transactionBuilder: TransactionBuilder,
        serviceHub: ServiceHub,
        partiesAndAmounts: List<PartyAndAmount<TokenType>>,
        changeHolder: AbstractParty,
        queryCriteria: QueryCriteria? = null
): TransactionBuilder {
    val selector: Selector = ConfigSelection.getPreferredSelection(serviceHub)
    val selector = DatabaseTokenSelection(serviceHub)
    val (inputs, outputs) = selector.generateMove(partiesAndAmounts.toPairs(), changeHolder, TokenQueryBy(queryCriteria = queryCriteria), transactionBuilder.lockId)
    return addMoveTokens(transactionBuilder = transactionBuilder, inputs = inputs, outputs = outputs)
}
```

## Use in-memory selection

to use in memory token selection, you need to write wrappers around `MoveTokensFlow` and
`RedeemTokensFlow`.

You can also use that selection with `addMoveTokens` and `addRedeemTokens` utility functions, but
make sure that all the checks are performed before construction of the transaction.
