---
title: Paths
date: 2020-10-15T00:00:00+01:00
menu:
  cordapp-design-language:
    parent: cdl-to-code
    identifier: cdl-to-code-paths
    weight: 100

tags:
- cdl
- cordapp design language
- contract to code
- cordapp diagram
---


# Paths

Path and Path constraints are probably the most complicated aspect of implementing a CDL Smart contract. To help simplify the implementation of Path Constraints some functions have been abstracted into a `ContractUtils.kt` file. This leaves a relatively simple implementation of the `verifyPathConstraints()` function.

But first we need to define `Paths` and `PathConstraints`.

A `Path` represents the transition that a Primary state makes from a given input `status` within a specific transaction. `Path` is implemented as follows:

Contractutils.kt:

{{< tabs name="paths" >}}
{{% tab name="kotlin" %}}
```kotlin
class Path<T: StatusState>(val command: CommandData,
                val outputStatus: Status?,
                val numberOfInputStates: Int,
                val numberOfOutputStates: Int,
                val additionalStates: Set<AdditionalStates> = setOf())

class AdditionalStates(val type: AdditionalStatesType, val clazz: Class<out ContractState>, val numberOfStates: Int)

enum class AdditionalStatesType {INPUT, OUTPUT, REFERENCE}
```
{{% /tab %}}
{{< /tabs >}}

Where:

- `command` represents the command.value in the transaction which relates to the Primary State's Contract (there could be other commands in the transaction but they are not dealt with by Paths).
- `outputStatus` represents the status of the output Primary State. it will be null if there is no output state.
- `numberOfInputStates` represents the number of input states of the Primary state type in the transaction.
- `numberOfOutputStates` represents the number of outputs states of the Primary state type in the transaction.
- `additionalStates` represents state types other than the Primary States type which are in the transaction, including whether they are inputs, outputs or reference states and how many of each are in the transaction.

In our Agreement CorDapp `numberOfInputStates` and `numberOfOutputStates` are going to be set to 0 or 1, because for any given agreement we only want to have a maximum of one `AgreementState` unconsumed at any point in time representing the latest state of this agreement. However, in other use cases there could be different Multiplicities involved. For example, `additionalStates` can be used to represent the BillingChips required in the Agree Paths (Although this is not implemented yet in the cdl-example CorDapp).
