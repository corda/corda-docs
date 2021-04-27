---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-persisting-flows
    parent: corda-os-4-8-flow-state-machines
    weight: 1270
tags:
- flow
- state
- machines
title: Persisting flows
---



## Persisting flows

If you look at the code for `FinalityFlow`, `CollectSignaturesFlow` and `SignTransactionFlow`, you’ll see calls
to both `receive` and `sendAndReceive`. Once either of these methods is called, the `call` method will be
suspended into a continuation and saved to persistent storage. If the node crashes or is restarted, the flow will
effectively continue as if nothing had happened. Your code may remain blocked inside such a call for seconds,
minutes, hours, or even days in the case of a flow that needs human interaction!

{{< note >}}
There are a couple of rules you need to bear in mind when writing a class that will be used as a continuation.
The first is that anything on the stack when the function is suspended will be stored into the heap and kept alive by
the garbage collector. So try to avoid keeping enormous data structures alive unless you really have to. You can
always use private methods to keep the stack uncluttered with temporary variables, or to avoid objects that
Kryo is not able to serialise correctly.

The second is that as well as being kept on the heap, objects reachable from the stack will be serialised. The state
of the function call may be resurrected much later! Kryo doesn’t require objects be marked as serialisable, but even so,
doing things like creating threads from inside these calls would be a bad idea. They should only contain business
logic and only do I/O via the methods exposed by the flow framework.

It’s OK to keep references around to many large internal node services though: these will be serialised using a
special token that’s recognised by the platform, and wired up to the right instance when the continuation is
loaded off disk again.
{{< /note >}}

{{< warning >}}
If a node has flows still in a suspended state, with flow continuations written to disk, it will not be
possible to upgrade that node to a new version of Corda or your app, because flows must be completely “drained”
before an upgrade can be performed, and must reach a finished state for draining to complete (see
draining_the_node for details). While there are mechanisms for “evolving” serialised data held
in the vault, there are no equivalent mechanisms for updating serialised checkpoint data. For this
reason it is not a good idea to design flows with the intention that they should remain in a suspended
state for a long period of time, as this will obstruct necessary upgrades to Corda itself. Any
long-running business process should therefore be structured as a series of discrete transactions,
written to the vault, rather than a single flow persisted over time through the flow checkpointing
mechanism.
{{< /warning >}}


`receive` and `sendAndReceive` return a simple wrapper class, `UntrustworthyData<T>`, which is
just a marker class that reminds us that the data came from a potentially malicious external source and may have been
tampered with or be unexpected in other ways. It doesn’t add any functionality, but acts as a reminder to “scrub”
the data before use.
