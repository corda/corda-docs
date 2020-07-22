---
menu:
  corda-enterprise-4-6:
    parent: corda-enterprise-4-6-corda-nodes-operating
tags:
- shell
- node
- query
- flow
title: Querying flow data
weight: 6
---

# Querying flow data

You can query a node to retrieve flow checkpoint data that can be useful for troubleshooting flows.

A checkpoint is a record of flow data taken at key points during a flow's operation, typically whenever the flow is suspended and waiting for a response or message.

To query the node for flow data, you must use the [Node Shell](shell.md).

## Query formatting

A query contains the following elements:

- A query command: `flowStatus queryFlows`.
- One or more fields that define what data is returned from each returned checkpoint.

A complete query might look like this:

`checkpoint reportBy compatibleWithCurrentCordaRuntime,cordapp`

In this example, only the `compatibleWithCurrentCordaRuntime` and `cordapp` data from each checkpoint will be returned.

## List all flows that have not completed

You can query a node to retrieve flow data from each checkpoint about any flows that have not completed.

To view a list of all flows on a node that have not completed, enter the following command:

`flowStatus queryFlows`

A list of all flows on the node that have not completed is returned. The list takes the following format, with the flow ID of each flow listed on a separate line:

```
5da55b82-332f-4ecd-a20c-3b02be040bb7
4dc21e46-142g-7rbt-b56i-2k41mr701lb2
```

You can also to return more specific information from each checkpoint.

**How do I write this query? What information is returned? Code samples?**

{{< table >}}

| Field name | Description | Format |
|---------|----------|---------|---------|
| compatibleWithCurrentCordaRuntime  |  Specifies whether the flow has been marked as being incompatible with the current Corda runtime environment. |  Boolean String  |
| cordapp  |  The name of the CorDapp to which the flow belongs.  |  String  |  
| flowClass  |  The name of the class that implements the flow.  |  String  |  
| flowStartFrom  |  The start time of the time-window in which the flow was started - if not present taken to be 0 unix timestamp.  |  String [ISO8601 DateTime]  |  
| flowStartUntil  |  The end time of the time-window in which the flow was started.  |  String [ISO8601 DateTime]  |  
| flowState  |  The state of the flow at its latest checkpoint. The state is one of the following values: `RUNNABLE`, `FAILED`, `COMPLETED`, `HOSPITALIZED`, `KILLED`, `PAUSED`.   |  String  |  
| progressStep  |  If the flow implements progress tracking, specifies the latest step that was encountered before checkpointing  |  String  |  
| flowStartContext  |  Specifies the creator of the flow: RPC user, parent, or in the case of initiated flows, initiating flow ID   |  String  |  
| suspensionDuration | Specifies the minimum duration for which a flow must have been checkpointed. This is entered in the format `\"<size>, unit\"` where unit is one of `SECONDS`, `MINUTES`, `HOURS` or `DAYS`) |  String  |  

{{< /table >}}


## List flow information for a checkpointed flow

Using a flow's ID, you can query a node to retrieve flow checkpoint data relating to one or more flows. For example, to return information about three flows where the flow IDs are `id1`, `id2`, and `id3`, you would structure your query as follows:

 `queryById <id1> <id2> <id3>`

 Running this query returns checkpoint data on flows with the IDs `id1`, `id2`, and `id3`.

```
flowStatus queryById 5da55b82-332f-4ecd-a20c-3b02be040bb7
---
- flowId: "5da55b82-332f-4ecd-a20c-3b02be040bb7"
  flowClass: "net.corda.failingflows.workflows.HospitalizerFlow"
  flowState: "HOSPITALIZED"
  cordappContext:
    cordappName: "custom-cordapp_1_7_6732caa5-99b8-4b95-a935-bde44bc65172"
    cordaVersion: 7
  compatibleWithCurrentCordaRuntime: true
  progressStep: null
  invocationContext:
    invocationSource: "RPC"
    userName: null
    initiatingParty: null
    userSuppliedInformation: null
  suspensionMetadata: null
  flowStart: 1595323327.416000000
  lastCheckpoint: 1595323327.481000000
```

 ## Formatting dates and times

 All dates and times must be formatted as per the [ISO 8601 standard](https://www.iso.org/iso-8601-date-and-time-format.html/) using the following pattern `yyyy-MM-dd'T'HH:mm:ss.SSSZ`.
 For example, 2001-07-04 12:08:56 local time in the U.S. Pacific Time time zone is represented as `2001-07-04T12:08:56.235-07:00`.

## Get help with the `flowStatus` command

You can view a list of all arguments relating to the `flowStatus` command by entering the following command:

`flowStatus --help`

A list of all possible options is returned.

For an example of how to implement the FlowStatusQuery command, see (https://github.com/corda/enterprise/blob/release/ent/4.6/tools/shell/src/main/java/net/corda/tools/shell/FlowStatusQueryCommand.java).

**Release notes text:**

**Code samples?**
