---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-initiate-flow-session
    parent: corda-os-4-8-flow-state-machines
    weight: 1250
tags:
- flow
- state
- machines
title: Initiate flow session
---


## Initiate flow session

It will be useful to describe how flows communicate with each other. A node may have many flows running at the same
time, and perhaps communicating with the same counterparty node but for different purposes. Therefore, flows need a
way to segregate communication channels so that concurrent conversations between flows on the same set of nodes do
not interfere with each other.

1. To communicate with a counterparty, you must initiate such a session with a `Party` using `initiateFlow`.

   To be accepted by a node, a session request must have registered the flow type (the fully-qualified class name) that is making the request - each session initiation includes the initiating flow type. The *initiated* (server) flow must name the *initiating* (client) flow using the `@InitiatedBy` annotation and passing the class name that will be starting the flow session as the annotation parameter.

   It returns a `FlowSession` object, identifying this communication.

2. The other side has to accept the session request for there to be a communication channel.

2. Subsequently, the first actual communication starts a counter-flow on the other side, receiving a “reply” session object.

3. A session ends when either flow ends, whether as expected or prematurely.

4. If a flow ends prematurely, then the other side will be notified of that and they will also end, as the whole point of flows is a known sequence of message transfers.

   Flows end prematurely due to exceptions. If that exception is `FlowException` or a sub-type, then it will propagate to the other side; any other exception will not propagate.
