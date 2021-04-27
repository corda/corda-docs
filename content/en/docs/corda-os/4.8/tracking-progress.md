---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-tracking-progress
    parent: corda-os-4-8-flow-state-machines
    weight: 1290
tags:
- flow
- state
- machines
title: Tracking progress
---


## Tracking progress

Not shown in the code snippets above is the usage of the `ProgressTracker` API. Progress tracking exports information
from a flow about where it’s got up to in such a way that observers can render it in a useful manner to humans who
may need to be informed. It may be rendered via an API, in a GUI, onto a terminal window, etc.

A `ProgressTracker` is constructed with a series of `Step` objects, where each step is an object representing a
stage in a piece of work. It is therefore typical to use singletons that subclass `Step`, which may be defined easily
in one line when using Kotlin. Typical steps might be “Waiting for response from peer”, “Waiting for signature to be
approved”, “Downloading and verifying data” etc.

A flow might declare some steps with code inside the flow class like this:

{{< tabs name="tabs-6" >}}
{{% tab name="kotlin" %}}
```kotlin
object RECEIVING : ProgressTracker.Step("Waiting for seller trading info")

object VERIFYING : ProgressTracker.Step("Verifying seller assets")
object SIGNING : ProgressTracker.Step("Generating and signing transaction proposal")
object COLLECTING_SIGNATURES : ProgressTracker.Step("Collecting signatures from other parties") {
    override fun childProgressTracker() = CollectSignaturesFlow.tracker()
}

object RECORDING : ProgressTracker.Step("Recording completed transaction") {
    // TODO: Currently triggers a race condition on Team City. See https://github.com/corda/corda/issues/733.
    // override fun childProgressTracker() = FinalityFlow.tracker()
}

override val progressTracker = ProgressTracker(RECEIVING, VERIFYING, SIGNING, COLLECTING_SIGNATURES, RECORDING)

```
{{% /tab %}}



{{% tab name="java" %}}
```java
private final ProgressTracker progressTracker = new ProgressTracker(
        RECEIVING,
        VERIFYING,
        SIGNING,
        COLLECTING_SIGNATURES,
        RECORDING
);

private static final ProgressTracker.Step RECEIVING = new ProgressTracker.Step(
        "Waiting for seller trading info");
private static final ProgressTracker.Step VERIFYING = new ProgressTracker.Step(
        "Verifying seller assets");
private static final ProgressTracker.Step SIGNING = new ProgressTracker.Step(
        "Generating and signing transaction proposal");
private static final ProgressTracker.Step COLLECTING_SIGNATURES = new ProgressTracker.Step(
        "Collecting signatures from other parties");
private static final ProgressTracker.Step RECORDING = new ProgressTracker.Step(
        "Recording completed transaction");

```
{{% /tab %}}

{{< /tabs >}}

Each step exposes a label. By defining your own step types, you can export progress in a way that’s both human readable
and machine readable.

Progress trackers are hierarchical. Each step can be the parent for another tracker. By setting
`Step.childProgressTracker`, a tree of steps can be created. It’s allowed to alter the hierarchy at runtime, on the
fly, and the progress renderers will adapt to that properly. This can be helpful when you don’t fully know ahead of
time what steps will be required. If you *do* know what is required, configuring as much of the hierarchy ahead of time
is a good idea, as that will help the users see what is coming up. You can pre-configure steps by overriding the
`Step` class like this:

{{< tabs name="tabs-7" >}}
{{% tab name="kotlin" %}}
```kotlin
object VERIFYING_AND_SIGNING : ProgressTracker.Step("Verifying and signing transaction proposal") {
    override fun childProgressTracker() = SignTransactionFlow.tracker()
}

```
{{% /tab %}}



{{% tab name="java" %}}
```java
private static final ProgressTracker.Step VERIFYING_AND_SIGNING = new ProgressTracker.Step("Verifying and signing transaction proposal") {
    @Nullable
    @Override
    public ProgressTracker childProgressTracker() {
        return SignTransactionFlow.Companion.tracker();
    }
};

```
{{% /tab %}}




[TwoPartyTradeFlow.kt](https://github.com/corda/corda/blob/release/os/4.8/finance/workflows/src/main/kotlin/net/corda/finance/flows/TwoPartyTradeFlow.kt) | ![github](/images/svg/github.svg "github")

{{< /tabs >}}

Every tracker has not only the steps given to it at construction time, but also the singleton
`ProgressTracker.UNSTARTED` step and the `ProgressTracker.DONE` step. Once a tracker has become `DONE` its
position may not be modified again (because e.g. the UI may have been removed/cleaned up), but until that point, the
position can be set to any arbitrary set both forwards and backwards. Steps may be skipped, repeated, etc. Note that
rolling the current step backwards will delete any progress trackers that are children of the steps being reversed, on
the assumption that those subtasks will have to be repeated.

Trackers provide an [Rx observable](http://reactivex.io/) which streams changes to the hierarchy. The top level
observable exposes all the events generated by its children as well. The changes are represented by objects indicating
whether the change is one of position (i.e. progress), structure (i.e. new subtasks being added/removed) or some other
aspect of rendering (i.e. a step has changed in some way and is requesting a re-render).

The flow framework is somewhat integrated with this API. Each `FlowLogic` may optionally provide a tracker by
overriding the `progressTracker` property (`getProgressTracker` method in Java). If the
`FlowLogic.subFlow` method is used, then the tracker of the sub-flow will be made a child of the current
step in the parent flow automatically, if the parent is using tracking in the first place. The framework will also
automatically set the current step to `DONE` for you, when the flow is finished.

Because a flow may sometimes wish to configure the children in its progress hierarchy *before* the sub-flow
is constructed, for sub-flows that always follow the same outline regardless of their parameters it’s conventional
to define a companion object/static method (for Kotlin/Java respectively) that constructs a tracker, and then allow
the sub-flow to have the tracker it will use be passed in as a parameter. This allows all trackers to be built
and linked ahead of time.

In future, the progress tracking framework will become a vital part of how exceptions, errors, and other faults are
surfaced to human operators for investigation and resolution.
