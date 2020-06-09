---
date: '2020-05-10T12:00:00Z'
menu:
corda-enterprise-4-5:
parent: corda-enterprise-4-5-cordapps-token-sdk
tags:
- Token SDK
- Selection
- Database selection
- In Memory
- in-Memory
- inMemory
- selectionType
- selection type
title: Selection in the Token SDK
---

# Token selection using the Token SDK

When you move or redeem tokens using the Token SDK, you can choose which reserve of tokens you want to use, and how much from each reserve, in any given transaction.

This process is called **Selection**.

You can write flows for moving your tokens that allow selection from either:

* The database which stores token data.
* In-memory data, which is like a cache of a party's current token data.

**In-memory selection** is a much faster method of choosing the right token reserves to use in a transaction. However, you may decide you prefer **Database** selection as it keeps the database as the only active source of truth for your tokens.

## Use Database Selection

In the Token SDK, database selection is the default method of selection for each transaction.

In move flows of multiple tokens using database selection, you specify the `selectionType` in the `TransactionBuilder`, along with the preferred selection source of payment.

In the example below, multiple fungible moves would be added to a token using database selection:

```kotlin
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

to use in-memory token selection, you need to write wrappers around `MoveTokensFlow` and
`RedeemTokensFlow`.

You can also use that selection with `addMoveTokens` and `addRedeemTokens` utility functions. When doing this, you must make sure that all the checks are performed before construction of the transaction.

To use in-memory selection, you must ensure the Corda service `VaultWatcherService` is installed. This comes as part of the Token SDK.

To initialise this service, you must select an `indexingStrategy`:

* **Public_key** strategy makes a token bucket for each public key.
* **External_ID** strategy can be used to group states from many public keys connected to a given unique user ID. If you use **Accounts**, this strategy is ideal.
* **Token_Only** selection strategy indexes states only using token type and identifier.

enter the following into your **CorDapp config**, choosing a single indexing strategy:

```
stateSelection {
    inMemory {
           indexingStrategies: ["EXTERNAL_ID"|"PUBLIC_KEY"|"TOKEN_ONLY"]
           cacheSize: Int
    }
}
```

In this example, token selection is configured in the `deployNodes` with `TOKEN_ONLY` as the indexing strategy, added under task `deployNodes(type: net.corda.plugins.Cordform)`.


```kotlin
nodeDefaults {
    cordapp ("$corda_tokens_sdk_release_group:tokens-selection:$corda_tokens_sdk_version"){
        config '''
            stateSelection {
                inMemory {
                       indexingStrategies: ["TOKEN_ONLY"]
                       cacheSize: 1024
                }
            }
        '''
    }
}
```

## Move tokens using `LocalTokenSelection`

1. From your flow construct LocalTokenSelector instance:
`val localTokenSelector = LocalTokenSelector(serviceHub)`

2. Deceide whether to Choose states for move by calling `selectTokens`:

```kotlin
val transactionBuilder: TransactionBuilder = ...
val participantSessions: List<FlowSession> = ...
val observerSessions: List<FlowSession> = ...
val requiredAmount: Amount<TokenType> = ...
val queryBy: TokenQueryBy = ...  // See section below on queries
// Just select states for spend, without output and change calculation
val selectedStates: List<StateAndRef<FungibleToken>> = localTokenSelector.selectStates(
    lockID = transactionBuilder.lockId, // Defaults to FlowLogic.currentTopLevel?.runId?.uuid ?: UUID.randomUUID()
    requiredAmount = requiredAmount,
    queryBy = queryBy)
```

  * or using `generateMove` method to return a list of inputs and list of output states that can be passed to `addMove` or `MoveTokensFlow`:

```
// generate inputs, outputs with change, grouped by issuers
val partiesAndAmounts: List<PartyAndAmount<TokenType>> = ... // List of parties that should receive amount of TokenType
val changeHolder: AbstractParty = ... // Party that should receive change
val (inputs, outputs) = localTokenSelector.generateMove(
    lockId = transactionBuilder.lockId, // Defaults to FlowLogic.currentTopLevel?.runId?.uuid ?: UUID.randomUUID()
    partiesAndAmounts = partiesAndAmounts,
    changeHolder = changeHolder,
    queryBy = queryBy)

// Call subflow
subflow(MoveTokensFlow(inputs, outputs, participantSessions, observerSessions))
// or use utilities functions
//... implement some business specific logic
addMoveTokens(transactionBuilder, inputs, outputs)
```

3. Finalize transaction, update distribution list etc, see Most common tasks.

{{< note >}}
You can use generic versions of MoveTokensFlow or addMoveTokens (not addMoveFungibleTokens), because we already performed selection and provide input and output states directly. Fungible versions will always use database selection.
{{< /note >}}

## Redeem tokens using `LocalTokenSelection`

You can create a flow for redeeming tokens using `LocalTokenSelection` in a similar way to moving tokens:

1. Choose states that cover the required amount.

2. Create exit states and get possible change outputs.  

3. Call the subflow to redeem states with the issuer.

```kotlin
val vaultWatcherService = serviceHub.cordaService(VaultWatcherService::class.java)
val localTokenSelector = LocalTokenSelector(serviceHub, vaultWatcherService, autoUnlockDelay = autoUnlockDelay)

// Choose states that cover the required amount.
val exitStates: List<StateAndRef<FungibleToken>> = localTokenSelector.selectStates(
    lockID = transactionBuilder.lockId, // Defaults to FlowLogic.currentTopLevel?.runId?.uuid ?: UUID.randomUUID()
    requiredAmount = requiredAmount,
    queryBy = queryBy) // See section below on queries

// Exit states and get possible change output.
val (inputs, changeOutput) =  generateExit(
    exitStates = exitStates,
    amount = requiredAmount,
    changeHolder = changeHolder
)
// Call subflow to redeem states with the issuer
val issuerSession: FlowSession = ...
subflow(RedeemTokensFlow(inputs, changeOutput, issuerSession, observerSessions))
// or use utilities functions.
addTokensToRedeem(
    transactionBuilder = transactionBuilder,
    inputs = inputs,
    changeOutput = changeOutput
)
```


## Provide queries to `LocalTokenSelector`

You can provide additional queries to `LocalTokenSelector` by constructing `TokenQueryBy` and passing it to `generateMove` or `selectStates` methods.

`TokenQueryBy` requires issuer to specify selection of token from given issuing party.

You can also provide any states filtering as predicate function.

```kotlin
val issuerParty: Party = ...
val notaryParty: Party = ...
// Get list of input and output states that can be passed to addMove or MoveTokensFlow
val (inputs, outputs) = localTokenSelector.generateMove(
        partiesAndAmounts = listOf(Pair(receivingParty,  tokensAmount)),
        changeHolder = this.ourIdentity,
        // Get tokens issued by issuerParty and notarised by notaryParty
        queryBy = TokenQueryBy(issuer = issuerParty, predicate = { it.state.notary == notaryParty }))
```
