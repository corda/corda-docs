---
title: Testing CDL code
date: 2020-10-15T00:00:00+01:00
menu:
  cordapp-design-language:
    identifier: cdl-testing-cdl-code
    weight: 40

tags:
- cdl
- cordapp design language
- testing smart contracts
---

# Testing CDL Code

To test CDL Code we want to maintain and extend the structure we used to map the CDL concerns to the implemented code. We can show this diagramatically:

{{< figure zoom="../resources/cdl-to-code-testing.png" width="800" title="Click to zoom image in new tab/window" >}}

The ContractUtils has its own extensive testing, which can be seen in the cdl-example `ContractUtilsTests.kt`

It is sensible to run some FlowTests early in the Smart Contract development. There are some structures such as MutableLists which do not serialise across Corda Flows; you want to spot these early, not after you have spent weeks working on your Smart Contract implementation.

The main part of testing concerns testing the AgreementContract. The approach taken in the cdl-example is to define a 'happy path' set of tests which represent a set of transactions where everything verifies, then for each type of constraint exhaustively test the conditions which should cause that constraint to fail.
