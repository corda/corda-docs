---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-flow-state-machines
    parent: corda-os-4-8-core-tutorials-index
    weight: 1130
tags:
- flow
- state
- machines
title: Writing flows
---

# Writing flows

This tutorial explains how  business processes and the lower-level network protocols that implement
them are modelled in Corda. It explains how the platform’s flow framework is used, and takes you through the code for a simple,
two-party asset trading flow.

Shared distributed ledgers are interesting because they allow many different, mutually distrusting parties to
share a single source of truth about the ownership of assets. Digitally signed transactions are used to update that
shared ledger, and transactions may alter many states simultaneously and atomically.

Blockchain systems such as Bitcoin support the idea of building up a finished, signed transaction by passing around
partially signed invalid transactions outside of the main network, and by doing this you can implement
*delivery versus payment* such that there is no chance of settlement failure, because the movement of cash and the
traded asset are performed atomically by the same transaction. To perform such a trade involves a multi-step flow
in which messages are passed back and forth privately between parties, checked, signed and so on.

There are many benefits of this flow-based design and some development complexities as well.  Some of the development challenges include:

* Avoiding “callback hell” in which code that should ideally be sequential is turned into an unreadable mess due to the
desire to avoid using up a thread for every flow instantiation.
* Surviving node shutdowns/restarts that may occur in the middle of the flow without complicating things. This
implies that the state of the flow must be persisted to disk.
* Error handling.
* Message routing.
* Serialisation.
* Catching type errors, in which the developer gets temporarily confused and expects to receive/send one type of message
when actually they need to receive/send another.
* Unit testing of the finished flow.

Actor frameworks can solve some of the above but they are often tightly bound to a particular messaging layer, and
we would like to keep a clean separation. Additionally, they are typically not type safe, and don’t make persistence or
writing sequential code much easier.

To put these problems in perspective, the *payment channel protocol* in the bitcoinj library, which allows bitcoins to
be temporarily moved off-chain and traded at high speed between two parties in private, consists of about 7000 lines of
Java and took over a month of full-time work to develop. Most of that code is concerned with the details of persistence,
message passing, life cycle management, error handling and callback management. Because the business logic is quite
spread out, the code can be difficult to read and debug.

As small, contract-specific trading flows are a common occurrence in finance. Corda provides a framework for the
construction of them that automatically handles many of the concerns outlined above.

## Continuations and state machines

A *continuation* is a suspended stack frame stored in a regular object that can be passed around, serialised,
unserialised and resumed from where it was suspended. This concept is sometimes referred to as “fibers”. This may
sound abstract but don’t worry, the examples below will make it clearer. The JVM does not natively support
continuations, so we implement them using a library called Quasar which works through behind-the-scenes
bytecode rewriting. You don’t have to know how this works to benefit from it, however.

We use continuations for the following reasons:

* It allows us to write code that is free of callbacks, that looks like ordinary sequential code.
* A suspended continuation takes far less memory than a suspended thread. It can be as low as a few hundred bytes.
In contrast a suspended Java thread stack can easily be one mb in size.
* It frees the developer from thinking (much) about persistence and serialisation.

A *state machine* is a piece of code that moves through various *states*. These are not the same as states in the data
model (that represent facts about the world on the ledger), but rather indicate different stages in the progression
of a multi-stage flow. Typically writing a state machine would require the use of a big switch statement and some
explicit variables to keep track of where you’re up to. The use of continuations avoids this hassle.
