---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-handling-exceptions
    parent: corda-os-4-8-flow-state-machines
    weight: 1280
tags:
- flow
- state
- machines
title: Handling exceptions
---



## Handling exceptions

Flows can throw exceptions to prematurely terminate their execution. The flow framework gives special treatment to
`FlowException` and its subtypes. These exceptions are treated as error responses of the flow and are propagated
to all counterparties it is communicating with. The receiving flows will throw the same exception the next time they do
a `receive` or `sendAndReceive` and thus end the flow session. If the receiver was invoked via `subFlow`
then the exception can  be caught there enabling re-invocation of the sub-flow.

If the exception thrown by the erroring flow is not a `FlowException` it will still terminate but will not propagate to
the other counterparties. Instead they will be informed the flow has terminated and will themselves be terminated with a
generic exception.

{{< note >}}
A future version will extend this to give the node administrator more control on what to do with such erroring
flows.
{{< /note >}}

Throwing a `FlowException` enables a flow to reject a piece of data it has received back to the sender. This is typically
done in the `unwrap` method of the received `UntrustworthyData`. In the above example the seller checks the price
and throws `FlowException` if it’s invalid. It’s then up to the buyer to either try again with a better price or give up.
