---
date: '2020-04-07T12:00:00Z'
menu:
  corda-enterprise-4-5:
    parent: corda-enterprise-4-5-tool-index
tags:
- metering
- collector
title: Metering Collection Tool
---


# Metering Collection Tool

The Metering Collection Tool is used to collect metering data from a Corda Enterprise node.

On this page you can learn how the node records metering data and how to run the collection tool in order to collect that data.

{{< note >}}
Corda Enterprise nodes record metering data regardless of whether the Metering Collection Tool is installed on the node.
{{< /note >}}

## Overview

The Metering Collection Tool provides a mechanism for collecting metering data from both normal nodes and notaries running Corda Enterprise.

The tool uses the following flows:

* Use the `MeteringCollectionFlow` flow to collect metering data from a node by using the node's shell. You must specify, as an argument, the time window over which the flow will be collecting metering data. You can also specify a set of CorDapps to filter the data by. The flow output represents both the total count of metering events that match the filter within the time window, and a breakdown of these events based on the commands involved and the signing entities. You can invoke this flow from the shell, however its usage via RPC has been deprecated - you can use the `NodeMeteringCollectionFlow` flow instead. This flow gathers data from the "current" node - the node where it was initiated.
* Use the `NodeMeteringCollectionFlow` flow to collect metering data from a node by connecting to it via RPC. You must specify, as an argument, the time window over which the flow will be collecting metering data. You can also specify a set of CorDapps to filter the data by. The flow output represents both the total count of metering events that match the filter within the time window, and a breakdown of these events based on the commands involved and the signing entities. This flow gathers data from the "current" node - the node where it was initiated.
* The `FilteredMeteringCollectionFlow` flow is similar to the `NodeMeteringCollectionFlow` flow with the only difference being that `FilteredMeteringCollectionFlow` collects data from another node on the network - a node that is different from the one where the flow was initiated. For that reason, it requires an additional argument where you must specify the party running the node where metering data is to be collected from.
* Use the `AggregatedMeteringCollectionFlow` flow to collect aggregated metering data from other nodes on the network - nodes that are different from the one where it was initiated. You must specify, as arguments, the time window over which the flow will be collecting metering data as well as the party running the node where metering data will be collected from. The flow output represents the total count of signing events that happened on the monitored nodes during the specified time window.
* The `MultiFilteredCollectionFlow` flow is similar to the `FilteredMeteringCollectionFlow` flow with the only difference being that `MultiFilteredCollectionFlow` collects data from multiple nodes on the network sequentially in a single flow, and returns the result as a `JSON` string. You can use this flow from the node shell only. You can use the dedicated method `FilteredMeteringCollectionFlow#multiCollect` to collect metering data from multiple nodes in parallel by using an RPC client to connect to the nodes.
* The `MultiAggregatedCollectionFlow` flow is similar to the `AggregatedMeteringCollectionFlow` flow with the only difference being that `MultiAggregatedCollectionFlow` collects data from multiple nodes on the network sequentially in a single flow, and returns the result as a `JSON` string. You can use this flow from the node shell only. You can use the dedicated method `AggregatedMeteringCollectionFlow#multiCollect` to collect metering data from multiple nodes in parallel by using an RPC client to connect to the nodes.
* Use the `NotaryCollectionFlow` flow to collect metering data from notaries. You must specify, as an argument, the time window over which the flow will be collecting metering data. The flow output represents the total count of notarisation requests during the specified time window, along with a breakdown of these requests filtered by the parties that made them.
* The `RetrieveCordappDataFlow` flow is a utility flow you can use to extract CorDapp hashes and signing keys for a given CorDapp name, in the correct format, for use in the `NodeMeteringCollectionFlow` flow filter (see above). This flow provides information about the versions and vendors of the returned CorDapps so that the correct CorDapp data can be selected.

{{< warning >}}
The `NotaryCollectionFlow` flow does not allow the collection of metering data for notaries configured in high-availability mode.
{{< /warning >}}

## Installation

The Metering Collection Tool is distributed as part of Corda Enterprise 4.5 under the name `corda-tools-metering-collector-4.5.jar`. You must place this `.jar` file in the `cordapps` directory of the node.

## Metering data

Metering within Corda Enterprise is based on the signing of transactions. The act of signing over a transaction is referred to as a
*signing event*. Whenever a signing event occurs, a small piece of data is recorded by the node. This describes which entity signed the
transaction, what CorDapps and commands were involved, and what time this occurred. Note that signing events are recorded on a per-node
basis, so transaction signatures applied by a remote node will only have metering data recorded for those signatures on that node. Note
also that the time at which a transaction is signed is not exposed outside of the node.

Notaries running Corda Enterprise are also metered. In this case, data is recorded indicating what notarisation requests have been made
and who made them.

### Sharing of metering data
<a name="sharing-metering"></a>

The Metering Collection Tool also contains responder flows that can be used by other nodes on the network to collect metering from the node where
this CorDapp is installed. This feature has to be enabled by the node operator deploying a
[CorDapp configuration file](/docs/corda-os/4.5/cordapp-build-systems.html#cordapp-configuration-files) for this CorDapp,
if no configuration file is deployed, metering data won't be shared with any other network party.
The following is an example configuration file to enable metering data sharing:
```json
"access_configuration" : {
    "network_collectors" : ["O=PartyA,L=New York,C=US", "O=PartyB,L=Zurich,C=CH"],
    "cordapp_collectors" : {
        "by_name" : {
            "Corda Finance Demo" : ["O=PartyB,L=Zurich,C=CH"]
        },
        "by_hash" : {
          "FC0150EFAB3BBD715BDAA7F67B4C4DB5E133D919B6860A3D3B4C6C7D3EFE25D5" :
            ["O=PartyC,L=London,C=GB"],
          "44489E8918D7D8F7A3227FE56EC34BFDDF15BD413FF92F23E72DD5D543BD6194" :
            ["O=PartyC,L=London,C=GB"]
        },
        "by_signature" : {
          "AA59D829F2CA8FDDF5ABEA40D815F937E3E54E572B65B93B5C216AE6594E7D6B" :
            ["O=PartyD,L=Dublin,C=IE"]
        }
    }
}
```
This configuration allows `PartyA` and `PartyB` to collect [aggregated metering data](#using-AggregatedMeteringCollectionFlow) from the node (which means that only the total number of signing event that happened in a given time period will be shared), additionally `PartyB` will be allowed to collect detailed metering related to all installed CorDapps whose name **is** *Corda Finance Demo*. `PartyC` is then allowed to collect detailed metering related to CorDapps whose jar hash is `FC0150EFAB3BBD715BDAA7F67B4C4DB5E133D919B6860A3D3B4C6C7D3EFE25D5` or `44489E8918D7D8F7A3227FE56EC34BFDDF15BD413FF92F23E72DD5D543BD6194` and `PartyD` is allowed to collect detailed metering related to all CorDapp whose `.jar` file has been signed with the key `AA59D829F2CA8FDDF5ABEA40D815F937E3E54E572B65B93B5C216AE6594E7D6B`. Use [`RetrieveCordappDataFlow`](#using-RetrieveCordappDataFlow) to get detailed information about the CorDapp deployed on your Corda node in order to write the configuration file correctly.

{{< warning >}}
There is a configuration validation step that runs at node start-up that will check that the X500 names contained in the configuration file
are valid (from an X500 standard perspective, they are not required to actually exist in the network) and that all the jar hashes, jar signature
and CorDapp names in the configuration each match at least one of the deployed CorDapps
(which means it is illegal to whitelist a CorDapp that doesn't exist). Any failure in the validation step will cause the node to fail starting up.
{{< /warning >}}

{{< warning >}}
Make sure you do not make mistakes when you type the configuration file static keys (`access_configuration`, `network_collectors`, `by_hash`, etc) because that will simply
result in your configuration being ignored and default values being applied (which will in turn result in metering data not being shared).
{{< /warning >}}

## Use procedures

This section provides instructions on how to use each of the flows that the Metering Collection Tool uses.

{{< note >}}
In the list of flows below, the `FilteredMeteringCollectionFlow` flow and the `AggregatedMeteringCollectionFlow` flow gather data from a node or nodes on the network different from the node where the respective flow was initiated. The `NodeMeteringCollectionFlow` flow and the `MeteringCollectionFlow` flow collect metering data from the "current" node - the node where each of the flows was initiated.
{{< /note >}}

### Using `MeteringCollectionFlow`

It is meant to be invoked from the shell, three things must be specified:

* A time window over which to run
* A filter to select which CorDapps to collect data for
* A paging specification to describe how the flow should access the database

To specify the time window, `MeteringCollectionFlow` takes either a start and end date (both of type `Instant`), or a start date and a duration.
Note that as metering data is only recorded with a time granularity of an hour, the flow will not be able to collect metering data over
durations shorter than an hour.

The filter is specified by providing a `MeteringFilter` object, which consists of a `filterBy` criteria and a list of strings that describe
the CorDapps to filter by. There are four possible options to filter by, which are described in the [data filtering section.](#data-filtering)

The paging specification is used to control database access by ensuring that only a subset of data is accessed at once. This is important to
prevent too much data being read into memory at once, resulting in out of memory errors. By default, 10000 metering entries are read into
memory at a time. (Note that under the covers some aggregation occurs, so the number of returned entries is likely to be less than this.) If
more than one page of data is required, the flow may need to be run multiple times to collect the full breakdown of metering events.
However, the total count provided is always the full number of signing events that match the supplied criteria.

#### Output format

`MeteringCollectionFlow` outputs a data class that contains a structured representation of the metering data. The outputted data contains
the following:

* The total number of signing events that match the query provided
* The current version of the output metering data
* An object describing the query that produced this set of data. This includes the time window over which the data was collected, the
filter applied to the data, and the paging criteria used.
* A list of entries giving a breakdown of the metering data. Each entry contains a signing entity, a set of commands, a transaction type,
and a count of events in this page that match this specification.


The output object can also be serialized into JSON form, by calling `serialize`.


#### Usage

The shell interface allows to invoke the flow specifying the `startDate` and `endDate` for the collection in the format `yyyy-MM-dd`, or the `startDate` (in the same format)
and the number of `daysToCollect`. Then a filter can be specified according to the rules described in the filtering section
It is also possible to omit the filter entirely if all metering data is required. Note that the smallest time window that can be specified is a day.

When date strings are required, they are always in YYYY-MM-DD format. If the date does not parse correctly, an exception is thrown.

When the Metering Collection Tool is run from the shell, the data is output to the terminal in JSON format.


#### Examples

Collecting all metering data over a particular week:

```bash
start MeteringCollectionFlow startDate: 2019-11-07, daysToCollect: 7, page: 1
```

Collecting metering data for a particular CorDapp:

```bash
start MeteringCollectionFlow startDate: 2019-11-07, endDate: 2019-11-14, filterBy: CORDAPP_NAMES, filter: ["Corda Finance Demo"], page: 1
```

An example of the output JSON on the shell is shown below:

```bash
{"totalCount":2,"version":1,"query":{"startDate":"2019-11-13T00:00:00Z","endDate":"2019-11-15T00:00:00Z","filter":{"filterBy":"NONE","values":[]},"pageNumber":1,"totalPages":1,"pageSize":10000},"entries":[{"signingId":{"type":"NODE_IDENTITY","accountId":null},"txType":"NORMAL","commands":["net.corda.finance.contracts.asset.Cash.Commands.Issue"],"count":1},{"signingId":{"type":"NODE_IDENTITY","accountId":null},"txType":"NORMAL","commands":["net.corda.finance.contracts.asset.Cash.Commands.Move"],"count":1}]}
```

### Using `NodeMeteringCollectionFlow`

This flow can be used to retrieve detailed metering from the node the RPC client connects to, it is analogous to `MeteringCollectionFlow` but it provides
a simpler API without requiring data pagination.
Note that the metering sharing configuration will not apply since it is expected that only the node operator is allowed to connect to the node via RPC.
This code snippet shows how to retrieve the metering data, from a node running on the local machine, for CorDapps *myCorDapp1* and *myCorDapp2*
(as well as any other CorDapp whose name contains those two strings) for the last 7 days:

{{< tabs name="tabs-NodeMeteringCollectionFlow" >}}
{{% tab name="java" %}}
```java
NetworkHostAndPort hostAndPort = NetworkHostAndPort.parse("127.0.0.1:10000");
CordaRPCClient client = new CordaRPCClient(hostAndPort);
NodeMeteringData meteringData =
        client.use("rpcUsername", "rpcPassword", conn -> {
            CordaRPCOps rpcOps = conn.getProxy();
            Instant now = Instant.now();
            Instant sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);
            FlowHandle<NodeMeteringData> handle = rpcOps.startFlowDynamic(
                    NodeMeteringCollectionFlow.class,
                    new Filter.And(
                            Filter.ByTimeStamp.between(sevenDaysAgo, now),
                            new Filter.Or(
                                    new Filter.ByCordapp.ByName("myCorDapp1"),
                                    new Filter.ByCordapp.ByName("myCorDapp2")
                            )
                    ));
            Future<NodeMeteringData> result = handle.getReturnValue();
            try {
                return result.get();
            } catch (InterruptedException | ExecutionException e) {
                throw new RuntimeException(e);
            }
        });
```

{{% /tab %}}

{{% tab name="kotlin" %}}
```kotlin
val hostAndPort = NetworkHostAndPort.parse("127.0.0.1:10000")
val client = CordaRPCClient(hostAndPort)
val nodeMeteringData = client.use("rpcUsername", "rpcPassword") { conn: CordaRPCConnection ->
    val rpcOps = conn.proxy
    val now = Instant.now()
    val sevenDaysAgo = now.minus(7, ChronoUnit.DAYS)
    val handle = rpcOps.startFlow(
            ::NodeMeteringCollectionFlow, Filter.And(
            Filter.ByTimeStamp.between(sevenDaysAgo, now),
            Filter.Or(Filter.ByCordapp.ByName("myCorDapp1"), Filter.ByCordapp.ByName("myCorDapp2"))
    ))
    val result: Future<NodeMeteringData> = handle.returnValue
    try {
        result.get()
    } catch (e: ExecutionException) {
        throw e.cause ?: e
    }
}
```
{{% /tab %}}

{{< /tabs >}}

### Using `AggregatedMeteringCollectionFlow`
<a name="using-AggregatedMeteringCollectionFlow"></a>

This flow allows for collection of aggregated metering data from a remote node on the network. Aggregated meterings only contain the total number
of signing event that happened in a given time period, without any additional information (signer public key, contract command or transaction type).
Note that the resulting data will depends on what the node operator decided to share with you in his [CorDapp configuration](#sharing-metering), in particular your X500 name needs to be present in his list of `network_collectors`, otherwise the invocation of
this flow will throw `PermissionDeniedException`.
The following code snippet shows how to retrieve aggregated metering connecting to a node running on the local machine,
from the node ran by `O=PartyA,L=New York,C=US` for the last 7 days:

{{< tabs name="tabs-AggregatedMeteringCollectionFlow" >}}
{{% tab name="java" %}}
```java
NetworkHostAndPort hostAndPort = NetworkHostAndPort.parse("127.0.0.1:10000");
CordaRPCClient client = new CordaRPCClient(hostAndPort);
AggregatedNodeMeteringData meteringData =
        client.use("rpcUsername", "rpcPassword", conn -> {
            CordaRPCOps rpcOps = conn.getProxy();
            Party destination = rpcOps.wellKnownPartyFromX500Name(
                    CordaX500Name.parse("O=PartyA,L=New York,C=US")
            );
            Instant now = Instant.now();
            Instant sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);
            FlowHandle<AggregatedNodeMeteringData> handle =
                    rpcOps.startFlowDynamic(AggregatedMeteringCollectionFlow.class,
                            destination,
                            Filter.ByTimeStamp.between(sevenDaysAgo, now)
                    );
            Future<AggregatedNodeMeteringData> result = handle.getReturnValue();
            try {
                return result.get();
            } catch (InterruptedException | ExecutionException e) {
                throw new RuntimeException(e);
            }
        });
```

{{% /tab %}}

{{% tab name="kotlin" %}}
```kotlin
val hostAndPort = NetworkHostAndPort.parse("127.0.0.1:10000")
val client = CordaRPCClient(hostAndPort)
val data = client.use("rpcUsername", "rpcPassword") { conn: CordaRPCConnection ->
    val rpcOps = conn.proxy
    val destination = rpcOps.wellKnownPartyFromX500Name(
            CordaX500Name.parse("O=PartyA,L=New York,C=US")
    )!!
    val now = Instant.now()
    val sevenDaysAgo = now.minus(7, ChronoUnit.DAYS)
    val handle = rpcOps.startFlow(
            ::AggregatedMeteringCollectionFlow,
            destination,
            Filter.ByTimeStamp.between(sevenDaysAgo, now)
    )
    try {
        handle.returnValue.get()
    } catch (e: ExecutionException) {
        throw e.cause ?: e
    }
}
```
{{% /tab %}}

{{< /tabs >}}

### Using `FilteredMeteringCollectionFlow`
<a name="using-FilteredMeteringCollectionFlow"></a>

This flow allows for collection of metering data from a remote node on the network. It is analogous to `NodeMeteringCollectionFlow` except
that it collects metering from a remote node on the network.
Note that the resulting data will depends on what the node operator decided to share with you in his [CorDapp configuration](#sharing-metering),
if this is not the case you will receive an object with an empty `entries` list. In order for the Metering Collection Tool to distinguish between the case
where there were no metering data on the collected node and the case where the node operator did not whitelist it,
 the returned object contains the `collectedCorDapps` field which will be populated with the list of CorDapp for which data has been collected.

If `collectedCorDapps` is an empty list, that means the requester was not authorized to collect metering data from any of the requested CorDapp, on the other
hand, if `entries` is empty but `collectedCorDapps` is not, it means that the CorDapp contained in `collectedCorDapps` have been collected but no metering data was present
 in the specified time window.

The following code snippet shows how to retrieve metering related to CorDapps *myCorDapp1* and *myCorDapp2*
(as well as any other CorDapp whose name contains those two strings) connecting to a node running on the local machine,
from the node ran by `O=PartyA,L=New York,C=US` for the last 7 days:

{{< tabs name="tabs-FilteredMeteringCollectionFlow" >}}
{{% tab name="java" %}}
```java
NetworkHostAndPort hostAndPort = NetworkHostAndPort.parse("127.0.0.1:10000");
CordaRPCClient client = new CordaRPCClient(hostAndPort);
FilteredNodeMeteringData meteringData =
        client.use("rpcUsername", "rpcPassword", conn -> {
            CordaRPCOps rpcOps = conn.getProxy();
            Party destination = rpcOps.wellKnownPartyFromX500Name(
                    CordaX500Name.parse("O=PartyA,L=New York,C=US")
            );
            Instant now = Instant.now();
            Instant sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);
            FlowHandle<FilteredNodeMeteringData> handle = rpcOps.startFlowDynamic(
                    FilteredMeteringCollectionFlow.class,
                    destination,
                    new Filter.And(
                            Filter.ByTimeStamp.between(sevenDaysAgo, now),
                            new Filter.Or(
                                    new Filter.ByCordapp.ByName("myCorDapp1"),
                                    new Filter.ByCordapp.ByName("myCorDapp2")
                            )
                    )
            );
            Future<FilteredNodeMeteringData> result = handle.getReturnValue();
            try {
                return result.get();
            } catch (InterruptedException | ExecutionException e) {
                throw new RuntimeException(e);
            }
        });
```

{{% /tab %}}

{{% tab name="kotlin" %}}
```kotlin
val hostAndPort = NetworkHostAndPort.parse("127.0.0.1:10000")
val client = CordaRPCClient(hostAndPort)
val data = client.use("rpcUsername", "rpcPassword") { conn: CordaRPCConnection ->
    val rpcOps = conn.proxy
    val destination = rpcOps.wellKnownPartyFromX500Name(
            CordaX500Name.parse("O=PartyA,L=New York,C=US")
    )!!
    val now = Instant.now()
    val sevenDaysAgo = now.minus(7, ChronoUnit.DAYS)
    val handle = rpcOps.startFlow(
            ::FilteredMeteringCollectionFlow,
            destination,
            Filter.And(
                    Filter.ByTimeStamp.between(sevenDaysAgo, now),
                    Filter.Or(
                            Filter.ByCordapp.ByName("myCorDapp1"),
                            Filter.ByCordapp.ByName("myCorDapp2")
                    )
            )
    )
    try {
        handle.returnValue.get()
    } catch (e: ExecutionException) {
        throw e.cause ?: e
    }
}
```
{{% /tab %}}

{{< /tabs >}}


### Using `RetrieveCordappDataFlow`
<a name="using-RetrieveCordappDataFlow"></a>
An additional utility flow is provided to retrieve CorDapp metadata for a particular CorDapp name: `RetrieveCordappDataFlow`. This can be
used to obtain CorDapp hashes and signing keys in the correct format in order to construct a valid `MeteringFilter` instance.
It additionally returns the version numbers and vendors of the CorDapps, allowing the right hashes and keys to be found for particular versions.

Here is an example of the flow invocation from the node shell
```bash
Tue May 05 16:23:08 IST 2020>>> flow start com.r3.corda.metering.RetrieveCordappDataFlow

 ✓ Starting
▶︎ Done
Flow completed with result: [{
  "name" : "Corda Finance Demo",
  "vendor" : "R3",
  "version" : "1",
  "hash" : "FD8C8A320794B7D928DB90EBACC27A06B6AB683111799380286F2F7A8AB819F2",
  "signingKeys" : [ "AA59D829F2CA8FDDF5ABEA40D815F937E3E54E572B65B93B5C216AE6594E7D6B" ]
}, {
  "name" : "Corda Finance Demo",
  "vendor" : "R3",
  "version" : "1",
  "hash" : "44489E8918D7D8F7A3227FE56EC34BFDDF15BD413FF92F23E72DD5D543BD6194",
  "signingKeys" : [ "AA59D829F2CA8FDDF5ABEA40D815F937E3E54E572B65B93B5C216AE6594E7D6B" ]
}, {
  "name" : "Corda Metering Collection Tool",
  "vendor" : "R3",
  "version" : "4.5-SNAPSHOT",
  "hash" : "FC0150EFAB3BBD715BDAA7F67B4C4DB5E133D919B6860A3D3B4C6C7D3EFE25D5",
  "signingKeys" : [ "AA59D829F2CA8FDDF5ABEA40D815F937E3E54E572B65B93B5C216AE6594E7D6B" ]
}]
```

while this is an RPC invocation example

{{< tabs name="tabs-RetrieveCordappDataFlow" >}}
{{% tab name="java" %}}

```java
NetworkHostAndPort hostAndPort = NetworkHostAndPort.parse("127.0.0.1:10000");
CordaRPCClient client = new CordaRPCClient(hostAndPort);
List<? extends CordappData> corDappData =
  client.use("rpcUsername", "rpcPassword", conn -> {
    CordaRPCOps rpcOps = conn.getProxy();
    FlowHandle<List<? extends CordappData>> handle =
      rpcOps.startFlowDynamic(RetrieveCordappDataFlow.class);
    Future<List<? extends CordappData>> result = handle.getReturnValue();
    try {
        return result.get();
    } catch (InterruptedException | ExecutionException e) {
        throw new RuntimeException(e);
    }
});
```

{{% /tab %}}

{{% tab name="kotlin" %}}

```kotlin
val hostAndPort = NetworkHostAndPort.parse("127.0.0.1:10000")
val client = CordaRPCClient(hostAndPort)
val corDappData =
  client.use("rpcUsername", "rpcPassword") { conn: CordaRPCConnection ->
    val rpcOps = conn.proxy
    val handle = rpcOps.startFlow(::RetrieveCordappDataFlow)
    val result: Future<List<CordappData>> = handle.returnValue
    try {
        result.get()
    } catch (e: ExecutionException) {
        throw e.cause ?: e
    }
}
```

{{% /tab %}}

{{< /tabs >}}


### Collection from multiple nodes

To address the common use case of having to collect metering data from multiple nodes on the network, two different mechanisms are available:

- multiple nodes collection via RPC
- multiple nodes collection via node shell

#### Multiple collection using the Corda RPC API

Two methods are available:
- `FilteredMeteringCollectionFlow.multiCollect`
- `AggregatedMeteringCollectionFlow.multicollect`

both of them start multiple parallel flows on the collector node, each of them collecting metering from a different node on the network, a timeout
can be specified so that all flows that do not terminate within the timeout are simply cancelled and only the data from the flows that completed successfully will be processed.

The methods take as a parameter a callback will be invoked, once for each destination node, as soon as the relative flow returns, the callback takes as parameters
the destination Party from which data have been collected, the parameters that were used for the collection (an instance of `MeteringCollectionParameters` for
`FilteredMeteringCollectionFlow`, while a simple `MeteringCollectionTimeWindow` is used for `AggregatedMeteringCollectionFlow`) and a `Future` that is guaranteed
to be done at the time of the callback invocation; if the flow invocation resulted in an exception, that will be rethrown inside the callback when calling `Future.get`
and it is expected that the callback is able to handle it, if this is not the case the execution will be interrupted and all the created subflows cancelled.


The following is a code example for filtered metering collection from 2 nodes

{{< tabs name="tabs-FilteredMeteringCollectionFlow.multicollect" >}}
{{% tab name="java" %}}
```java
Instant now = Instant.now();
Instant sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);
Filter filter = new Filter.And(
        Filter.ByTimeStamp.between(sevenDaysAgo, now),
        new Filter.Or(
                new Filter.ByCordapp.ByName("myCorDapp1"),
                new Filter.ByCordapp.ByName("myCorDapp2")
        )
);
CordaRPCOps rpcOps = conn.getProxy();
List<Pair<Party, Filter>> destinations =
        Stream.of("O=PartyA,L=New York,C=US", "O=PartyB,L=New York,C=US")
                .map(CordaX500Name::parse)
                .map(rpcOps::wellKnownPartyFromX500Name)
                .map(party -> new Pair<>(party, filter))
                .collect(Collectors.toList());

FilteredMeteringCollectionFlow.FilteredResultConsumer consumer = (
        Party destination,
        Filter f,
        Future<FilteredNodeMeteringData> result
) -> {
    try {
        FilteredNodeMeteringData data = result.get();
        //do something with the data
    } catch (ExecutionException | InterruptedException e) {
        throw new RuntimeException(e);
    }
};
FilteredMeteringCollectionFlow.multiCollect(
        rpcOps,
        destinations,
        consumer,
        Duration.of(30, ChronoUnit.SECONDS));
```

{{% /tab %}}

{{% tab name="kotlin" %}}
```kotlin
val now = Instant.now()
val sevenDaysAgo = now.minus(7, ChronoUnit.DAYS)
val filter = Filter.And(
        Filter.ByTimeStamp.between(sevenDaysAgo, now),
        Filter.Or(
                Filter.ByCordapp.ByName("myCorDapp1"),
                Filter.ByCordapp.ByName("myCorDapp2")
        )
)
val destinations = sequenceOf("O=PartyA,L=New York,C=US", "O=PartyB,L=New York,C=US")
        .map { CordaX500Name.parse(it) }
        .map { rpcOps.wellKnownPartyFromX500Name(it)!! }
        .map { it to filter }
        .toList()
val consumer = {
    destination: Party,
    filter : Filter,
    result: Future<FilteredNodeMeteringData> ->
    try {
        val data = result.get()
        //do something with the data
    } catch (e: ExecutionException) {
        throw e.cause ?: e
    }
}
FilteredMeteringCollectionFlow.multiCollect(
        rpcOps,
        destinations,
        consumer,
        Duration.of(30, ChronoUnit.SECONDS))
```
{{% /tab %}}

{{< /tabs >}}

and this is an example for aggregated metering collection, again from 2 nodes

{{< tabs name="tabs-AggregatedMeteringCollectionFlow.multicollect" >}}
{{% tab name="java" %}}
```java
CordaRPCOps rpcOps = conn.getProxy();
Instant now = Instant.now();
Instant sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);
List<Pair<Party, Filter>> destinations =
        Stream.of("O=PartyA,L=New York,C=US", "O=PartyB,L=New York,C=US")
                .map(CordaX500Name::parse)
                .map(rpcOps::wellKnownPartyFromX500Name)
                .map(party -> new Pair<>(party, Filter.ByTimeStamp.between(sevenDaysAgo, now)))
                .collect(Collectors.toList());

AggregatedMeteringCollectionFlow.AggregatedResultConsumer consumer = (
        Party destination,
        Filter f,
        Future<AggregatedNodeMeteringData> result
) -> {
    try {
        AggregatedNodeMeteringData data = result.get();
        //do something with the data
    } catch (ExecutionException | InterruptedException e) {
        throw new RuntimeException(e);
    }
};
AggregatedMeteringCollectionFlow.multiCollect(
        rpcOps,
        destinations,
        consumer,
        Duration.of(30, ChronoUnit.SECONDS));
```

{{% /tab %}}

{{% tab name="kotlin" %}}
```kotlin
val now = Instant.now()
val sevenDaysAgo = now.minus(7, ChronoUnit.DAYS)
val filter = Filter.ByTimeStamp.between(sevenDaysAgo, now)
val destinations = sequenceOf("O=PartyA,L=New York,C=US", "O=PartyB,L=New York,C=US")
        .map { CordaX500Name.parse(it) }
        .map { rpcOps.wellKnownPartyFromX500Name(it)!! }
        .map { it to filter }
        .toList()
val consumer = {
    _ : Party,
    _ : Filter,
    result: Future<AggregatedNodeMeteringData> ->
    try {
        val data = result.get()
        //do something with the data
    } catch (e: ExecutionException) {
        throw e.cause ?: e
    }
}
AggregatedMeteringCollectionFlow.multiCollect(
        rpcOps,
        destinations,
        consumer,
        Duration.of(30, ChronoUnit.SECONDS))
```
{{% /tab %}}

{{< /tabs >}}

#### Multiple nodes collection from the shell

Two flows are available:
- `MultiAggregatedCollectionFlow`
- `MultiFilteredCollectionFlow`

both of them are analogous to their single node counterparts, `AggregatedMeteringCollectionFlow` and `FilteredMeteringCollectionFlow` respectively, in regard
of data filtering and permissions.

They proceed sequentially through all the destination nodes, which can make the collection very slow and will cause the execution to hang indefinitely if one of the destination node is down
or is not running the metering Collection CorDapp.

Both of them takes the following parameter when invoked from the shell

- `dateFormat` the date format to use for parsing [start] and [end], the syntax is the syntax of [SimpleDateFormat]
- `start` a string representing the start date from which metering data will be retrieved, the
 required format will be the one specified by [dateFormat] or the one returned by [SimpleDateFormat.getInstance],
 which defaults to your locale settings
- `end` a string representing the end date until which metering data will be retrieved
 required format will be the one specified by [dateFormat] or the one returned by [SimpleDateFormat.getInstance],
 which defaults to your locale settings
- `period` the period of time after `start` or before `end` that will be used for metering collection;
 "nanoseconds", "microseconds", "milliseconds", "seconds", "minutes", "hours", "days", "weeks", "months", "years" are all supported unit of measure,
 as well as any unambiguous prefix for them (for example, `1mo` will be interpreted as one month while `1m` will throw an error). Any failure in this parameter
 interpretation will raise `IllegalArgumentException`.
- `destinations` a list X500 names of the parties running the nodes from which metering data is to be collected. The names do not need to be
 the full qualified X500 names since `IdentityService.partiesFromName` will be invoked on them and if more parties match input string,
 metering data will be collected from all their nodes. If this parameter is omitted collection will proceed through all the nodes present
 in the network map
 - `txTypes` a list of transaction types that will be included in the results, if it is omitted transactions of any type will be collected, see [the data filtering paragraph]("#data-filtering-shell")
 for more information about transaction types

- `filter` is only available for `MultiFilteredCollectionFlow` and allows to filter metering data by CorDapp, see also [the data filtering paragraph]("#data-filtering-shell")

Note that only two between `start`, `end` and `period` needs to be specified, if only `period` is provided, it will be implicitly interpreted as
an invocation with `period` and `end` with `end` set to the current timestamp.

{{< warning >}}
Due to limitations of the node shell (that could be addressed in the near future), the parameter `start`, `end`, `period`, `dateFormat` needs to be wrapped within an object
when created in the shell - for example, `start : {value: "2020-06-01 05:45"}` instead of simply `start : "2020-06-01 05:45"`
{{< /warning >}}

#### Output format
For both of these methods, the result printed on the shell is a formatted JSON object whose keys are the X500 names of the destination nodes and the value is
the JSON representation of object returned from the collection (an instance  of `AggregatedNodeMeteringData` for `MultiAggregatedCollectionFlow`,
`FilteredNodeMeteringData` for `MultiFilteredCollectionFlow`). If any of the destination node throws an exception,
you would see it in the response object.


#### Examples

**Collecting aggregated metering data for last month from "O=PartyB,L=New York,C=US" and "O=PartyA,L=New York,C=US"**

```bash
Wed May 06 15:13:52 IST 2020>>> flow start com.r3.corda.metering.MultiAggregatedCollectionFlow period: {value: 1mon}, destinations: [PartyA, PartyB]

▶︎ Starting
    Done
 ✓ Starting
▶︎ Done
Flow completed with result: {
  "data" : {
    "O=PartyB, L=New York, C=US" : {
      "version" : 1,
      "count" : 51
    },
    "O=PartyA, L=New York, C=US" : {
      "exception" : "net.corda.core.flows.FlowException",
      "message" : "com.r3.corda.metering.PermissionDeniedException: You don't have permission to collect aggregated metering from this node",
      "cause" : {
        "exception" : "com.r3.corda.metering.PermissionDeniedException",
        "message" : "You don't have permission to collect aggregated metering from this node"
      }
    }
  },
  "window" : {
    "startInstant" : "2020-04-06T14:14:38.844Z",
    "endInstant" : "2020-05-06T14:14:38.844Z"
  }
}
```
Note that even if `PartyA` threw `PermissionDeniedException` the collection continued successfully to `PartyB`.

A similar result could have been obtained by the following command lines
```
flow start com.r3.corda.metering.MultiAggregatedCollectionFlow dateFormat: {value: "yyyy-MM-dd"},  period: {value: 1mon}, end : {value: "2020-05-06"}, destinations: [PartyA, PartyB]
flow start com.r3.corda.metering.MultiAggregatedCollectionFlow dateFormat: {value: "yyyy-MM-dd"},  start: {value: "2020-04-06"}, end : {value: "2020-05-06"}, destinations: [PartyA, PartyB]
flow start com.r3.corda.metering.MultiAggregatedCollectionFlow dateFormat: {value: "yyyy-MM-dd"},  start: {value: "2020-04-06"}, end : {value: "2020-05-06"}, destinations: [PartyA, PartyB]
```


**Collecting filtered metering data for last month from `O=PartyB,L=New York,C=US` and `"O=PartyA,L=New York,C=US"`**

```bash
Wed May 06 15:37:45 IST 2020>>> flow start com.r3.corda.metering.MultiFilteredCollectionFlow period: {value: 1mon}, destinations: [PartyA, PartyB], filter: {filterBy: CORDAPP_NAMES, values: [Finance]}, txTypes: [NORMAL]

 ✓ Starting
▶︎ Done
Flow completed with result: {
  "data" : {
    "O=PartyB, L=New York, C=US" : {
      "version" : 1,
      "entries" : [ {
        "signingId" : {
          "type" : "NODE_IDENTITY",
          "accountId" : null
        },
        "txType" : "NORMAL",
        "commands" : [ "net.corda.finance.contracts.asset.Cash.Commands.Issue" ],
        "count" : 1
      } ],
      "collectedCorDapps" : [ {
        "name" : "Corda Finance Demo",
        "vendor" : "R3",
        "version" : "1",
        "hash" : "4DF7DAC0703459E97CB040CD6194ACC0D7B53931FAFC859158B16FDD85D525B5",
        "signingKeys" : [ "AA59D829F2CA8FDDF5ABEA40D815F937E3E54E572B65B93B5C216AE6594E7D6B" ]
      } ]
    },
    "O=PartyA, L=New York, C=US" : {
      "version" : 1,
      "entries" : [ {
        "signingId" : {
          "type" : "NODE_IDENTITY",
          "accountId" : null
        },
        "txType" : "NORMAL",
        "commands" : [ "net.corda.finance.contracts.asset.Cash.Commands.Issue" ],
        "count" : 1
      } ],
      "collectedCorDapps" : [ {
        "name" : "Corda Finance Demo",
        "vendor" : "R3",
        "version" : "1",
        "hash" : "4DF7DAC0703459E97CB040CD6194ACC0D7B53931FAFC859158B16FDD85D525B5",
        "signingKeys" : [ "AA59D829F2CA8FDDF5ABEA40D815F937E3E54E572B65B93B5C216AE6594E7D6B" ]
      } ]
    }
  },
  "params" : {
    "window" : {
      "startInstant" : "2020-04-06T14:38:11.428Z",
      "endInstant" : "2020-05-06T14:38:11.428Z"
    },
    "filter" : {
      "filterBy" : "CORDAPP_NAMES",
      "values" : [ "Finance" ]
    }
  }
}
```
A similar result could have been obtained by the following command lines
```
flow start com.r3.corda.metering.MultiAggregatedCollectionFlow period: {value: 1mon}, filter: {filterBy: CORDAPP_HASHES, values: [4DF7DAC0703459E97CB040CD6194ACC0D7B53931FAFC859158B16FDD85D525B5]}
flow start com.r3.corda.metering.MultiAggregatedCollectionFlow dateFormat: {value: "yyyy-MM-dd"},  start: {value: "2020-04-06"}, end : {value: "2020-05-06"}, destinations: [PartyA, PartyB], filter: {filterBy: CORDAPP_NAMES, values: [Finance]}, txTypes: [NORMAL]
flow start com.r3.corda.metering.MultiAggregatedCollectionFlow dateFormat: {value: "yyyy-MM-dd"},  start: {value: "2020-04-06"}, end : {value: "2020-05-06"}, destinations: [PartyA, PartyB], filter: {filterBy: CORDAPP_NAMES, values: [Finance]}, txTypes: [NORMAL]
```


### Data filtering using the node shell
<a name="data-filtering-shell"></a>

The data filtering available from the shell is limited to filtering by CorDapp, by transaction type and by timestamp.

#### Filtering by CorDapp

It is done using the `filter` parameter in `MeteringCollectionFlow`, `MultiAggregatedMeteringCollectionFlow` and `MultiFilteredMeteringCollectionFlow`. The `filter` parameter requires an object created by the parameter `filterBy` that specify the type of filter and `values`, which is an array of strings that represents the filter argument. The following is a list of filters available for `filterBy`:


{{< table >}}

|`filterBy` criteria|Description|Data Collected|`Filter` requirement|
|-----------------------|-----------------------------------------------------------|------------------------------------------------|-------------------------------------------------------------|
|NONE|Returns data for all CorDapps|All data for a node|None|
|CORDAPP_NAMES|Returns data for CorDapps matching specified names|Data for all versions of a CorDapp|List of names, as specified in CorDapp build information|
|CORDAPP_HASHES|Returns data for any CorDapp with jar hash in list|Data for particular CorDapp versions|List of SHA256 hashes of CorDapp `.jar` files|
|SIGNING_KEYS|Returns data for all CorDapps signed with any key in list|Data for particular owner(s) of CorDapps|List of SHA256 hashes of public keys used to sign `.jar` files|

{{< /table >}}

#### Filtering by transaction type
It is done using the `txTypes` parameter in `MultiAggregatedMeteringCollectionFlow` and `MultiFilteredMeteringCollectionFlow`, it takes an array with all the types that will be included.
The available transaction types are:

- `NORMAL`
- `CONTRACT_UPGRADE`
- `NOTARY_CHANGE`
- `UNKNOWN`

{{< note >}}
`NORMAL`, `CONTRACT_UPGRADE` and `NOTARY_CHANGE` corresponds to transactions that cause a ledger update, while `UNKNOWN` are transactions that do not cause a ledger update.
{{< /note >}}

### Data filtering using the RPC API
<a name="data-filtering-rpc"></a>

Data filtering is available for `NodeMeteringCollectionFlow`, `AggregatedMeteringCollectionFlow` and `FilteredMeteringCollectionFlow`

{{< note >}}
Filtering by CorDapp is forbidden for `AggregatedMeteringCollectionFlow` and, if such a filter is provided (either directly or as part of a boolean filter) `WrongParameterException` will be raised.
{{< /note >}}

{{< note >}}
All the following classes belongs to package `com.r3.corda.metering.filter`
{{< /note >}}

{{< table >}}

|Class name|Description|
|-|-|
| ```Filter.Or``` | Represents the logical `or` of the filters provided as constructor parameters |
| ```Filter.And``` | Represents the logical `and` of the filters provided as constructor parameters |
| ```Filter.ByTimeStamp.Since``` | Matches only the meterings with a later timestamp than the one provided |
| ```Filter.ByTimeStamp.Until``` | Matches only the meterings with an earlier timestamp than the one provided |
| ```Filter.ByCorDapp.ByName``` | Matches only the meterings related to signing events generated by a CorDapp whose name contains the provided string |
| ```Filter.ByCorDapp.ByJarHash``` | Matches only the meterings related to signing events generated by a CorDapp whose jar hash matches the one provided |
| ```Filter.ByCorDapp.ByJarSignature``` | Matches only the meterings related to signing events generated by a CorDapp whose `.jar` file was signed with the provided public key |
| ```Filter.ByCorDapp.ByTransactionType``` | Matches only the meterings related to transactions of the specified transaction type (helpers are available to specify ledger-updating transactions and non-ledger-updating transactions) |

{{< /table >}}
