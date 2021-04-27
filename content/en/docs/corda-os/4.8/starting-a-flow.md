---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-starting-a-flow
    parent: corda-os-4-8-flow-state-machines
    weight: 1240
tags:
- flow
- state
- machines
title: Starting a flow
---

## Starting a flow

The `StateMachineManager` is the class responsible for taking care of all running flows in a node. It knows
how to register handlers with the messaging system (see [Networking and messaging](messaging.md)) and iterate the right state machine
when messages arrive. It provides the send/receive/sendAndReceive calls that let the code request network
interaction and it will save/restore serialised versions of the fiber at the right times.

Flows can be invoked in several ways. For instance, they can be triggered by scheduled events (in which case they need to
be annotated with `@SchedulableFlow`), see [Scheduling events](event-scheduling.md) to learn more about this. They can also be triggered
directly via the node’s RPC API from your app code (in which case they need to be annotated with *StartableByRPC*). It’s
possible for a flow to be of both types.

You request a flow to be invoked by using the `CordaRPCOps.startFlowDynamic` method. This takes a
Java reflection `Class` object that describes the flow class to use (in this case, either `Buyer` or `Seller`).
It also takes a set of arguments to pass to the constructor. Because it’s possible for flow invocations to
be requested by untrusted code (for example, a state that you have been sent), the types that can be passed into the
flow are checked against a whitelist, which can be extended by apps themselves at load time. There are also a series
of inlined Kotlin extension functions of the form `CordaRPCOps.startFlow` which help with invoking flows in a type
safe manner.

The process of starting a flow returns a `FlowHandle` that you can use to observe the result, and which also contains
a permanent identifier for the invoked flow in the form of the `StateMachineRunId`. Should you also wish to track the
progress of your flow (see [Progress tracking](#progress-tracking)) then you can invoke your flow instead using
`CordaRPCOps.startTrackedFlowDynamic` or any of its corresponding `CordaRPCOps.startTrackedFlow` extension functions.
These will return a `FlowProgressHandle`, which is just like a `FlowHandle` except that it also contains an observable
`progress` field.

{{< note >}}
The developer *must* then either subscribe to this `progress` observable or invoke the `notUsed()` extension
function for it. Otherwise the unused observable will waste resources back in the node.

{{< /note >}}
