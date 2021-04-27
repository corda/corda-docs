---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2021-04-27'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-continuations-and-state-machines
    parent: corda-os-4-8-flow-state-machines
    weight: 1200
tags:
- flow
- state
- machines
title: Continuations and state machines
---


## Continuations and state machines

A *continuation* is a suspended stack frame stored in a regular object that can be passed around, serialised,
unserialised and resumed from where it was suspended. This concept is sometimes referred to as “fibers”. This may
sound abstract but don’t worry, the examples below will make it clearer. The JVM does not natively support
continuations, so we implement them using a library called Quasar which works through behind-the-scenes
bytecode rewriting. You don’t have to know how this works to benefit from it, however.

We use continuations for the following reasons:


* It allows us to write code that is free of callbacks, that looks like ordinary sequential code.
* A suspended continuation takes far less memory than a suspended thread. It can be as low as a few hundred bytes.
In contrast a suspended Java thread stack can easily be 1mb in size.
* It frees the developer from thinking (much) about persistence and serialisation.

A *state machine* is a piece of code that moves through various *states*. These are not the same as states in the data
model (that represent facts about the world on the ledger), but rather indicate different stages in the progression
of a multi-stage flow. Typically writing a state machine would require the use of a big switch statement and some
explicit variables to keep track of where you’re up to. The use of continuations avoids this hassle.
