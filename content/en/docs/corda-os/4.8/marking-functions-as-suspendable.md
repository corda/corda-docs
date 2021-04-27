---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-marking-functions-as-suspendable
    parent: corda-os-4-8-flow-state-machines
    weight: 1220
tags:
- flow
- state
- machines
title: Marking functions as suspendable
---

## Marking functions as suspendable

The `call` function of the buyer/seller classes is marked with the `@Suspendable` annotation. What does this mean?

As mentioned above, our flow framework will at points suspend the code and serialise it to disk. For this to work,
any methods on the call stack must have been pre-marked as `@Suspendable` so the bytecode rewriter knows to modify
the underlying code to support this new feature. A flow is suspended when calling either `receive`, `send` or
`sendAndReceive` which we will learn more about below. For now, just be aware that when one of these methods is
invoked, all methods on the stack must have been marked. If you forget, then in the unit test environment, you will
get a useful error message telling you which methods you didn’t mark. The fix is simple enough: just add the annotation
and try again.

{{< note >}}
Java 9 is likely to remove this pre-marking requirement completely.
{{< /note >}}
