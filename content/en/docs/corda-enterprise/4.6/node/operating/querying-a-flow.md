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

A checkpoint is a record of flow data taken at key points during a flow's operation, typically whenever the flow is
suspended and waiting for a response or message.

To query the node for flow data, you must use the [Corda Shell](shell.md).

## Query formatting

A query contains the following elements:

- A query command: `checkpoint`.
- Reporting fields: `reportBy <fields>`. Reporting fields define what data is returned from each returned checkpoint.

A complete query might look like this:

`checkpoint reportBy flowId,flowStartTimeBefore`

In this example, `flowId` and `flowStartTimeBefore` are reporting fields. Only the `flowId` and `flowStartTimeBefore` data from each checkpoint will be returned.


## Reporting fields


All dates and timestamps must be formatted as per the [ISO 8601 standard](https://www.iso.org/iso-8601-date-and-time-format.html/) using the following pattern `yyyy-MM-dd'T'HH:mm:ss.SSSZ`.
For example, 2001-07-04 12:08:56 local time in the U.S. Pacific Time time zone is represented as `2001-07-04T12:08:56.235-07:00`.


{{< table >}}


| Field name | Description | Format |
|---------|----------|---------|---------|
| flowId  |  Unique string identifying the flow.  |  String  |  
| flowClass  |  Shortened classname of the flow.  |  String  |  
| flowStartTimeBefore  |  Returns the exact time when the flow was started.  |  Timestamp  |  
| flowStartTimeAfter  |  Returns the exact time when the flow was started.  |  Timestamp  |  
| checkpointTimeBefore  |   Returns the exact time when the checkpoint was created.  |  Timestamp  |  
| checkpointTimeAfter  |  Returns the exact time when the checkpoint was created.  |  Timestamp  |  
| platformVersion  |  Corda [platform version](../../cordapps/versioning.html#platform-version) used to process the flow.  |  Positive Integer  |  
| corDappName  |  The name of the CorDapp to which the flow belongs.  |  String  |  
| corDappVersion  |  The version of the CorDapp to which flow belongs.  |  String  |  
| flowStatus  |  The status of the flow at the time the checkpoint was created  |  String  |  
| checkpointCreationReason  |  The reason why the checkpoint was created. For example, `send` or `sendAndReceive`.  |  String  |  
| pendingParty  |  The X.500 name of the party the checkpoint is waiting on. Empty if the checkpoint is not waiting for a party.  |  X.500 string  |  
| flowStartMethod  |  The method used to start the flow. For example, RPC, SubFlow, Initiated.  |  String  |  
| compatible  |  Returns the compatibility of returned checkpoints as a boolean.  |  Boolean String  |  
| progressTrackerStep  |  Last known progress tracker step. If there is no known progress tracker step, an empty string will be returned.  |  String  |  
| flowStartContext  |  Specifies the creator of the flow: RPC user, parent, or initiating flow ID for initiated flows.  |  String  |  
| checkpointSize  |  The size of the checkpoint binary, returned as a string.  |  String  |  
| flowParameters  |  The parameters passed into the flow, returned as a string.  |  String  |  
| callStack  |  The invocation stack at the time the checkpoint was created, returned as a string.  |  String  |  
| checkpointSeqNum  |  Checkpoint sequence number.  |  Positive Integer  |  
| json  |  Returns a long JSON string representing the whole checkpoint. |  Long JSON string  |  

{{< /table >}}
