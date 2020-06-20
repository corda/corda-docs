# Monitoring scenarios

## Approaching an OOM error

 The HeapMemoryUsage attribute of the java.lang:type=Memory mbean contains a MemoryUsage (https://docs.oracle.com/javase/8/docs/api/java/lang/management/MemoryUsage.html) object that represents a snapshot of heap memory usage.
 The 'used' variable of this object represents the amount of memory currently used, while the 'max' value represents the maximum amount of memory that can be used for memory management. If the proportion of these two values are repeatedly over 0.85, it could indicate a condition where we are approaching an OOM error.

## High CPU usage

 The SystemCpuLoad property of the java.lang:type=OperatingSystem is a double type of value that represents Returns the "recent cpu usage" for the whole system.
 The maximum value of this property is 1, which represents a 100% CPU usage.
 Repeated readings of the SystemCpuLoad value being close to 1 (eg. over 0.9) means that consistently high CPU usage.
 
## High flow error rates

Corda exposes the "net.corda:name=StartedPerMinute,type=Flows" and the"net.corda:name=ErrorPerMinute,type=Flows" meter type of metrics.
A meter measures the rate of events over time (e.g., “flows per second”). In addition to the mean rate, meters also track 1-, 5-, and 15-minute moving averages.
The oneMinuteRate property of the above two metrics will represent the rates of started and errored flows in the last minute. 
The last minute's error flow rate reaching a significant percentage of the last minute's started flow rate (eg. over 10%) can indicate high flow error rates.

## Network parameter update proposed

Corda exposes the "net.corda:name=UpdateProposed,type=NetworkParameter" boolean type of metric. 
The value of this metric can be true or false, true indicating that a network parameter update has been proposed that has not been accepted yet.

## Processing messages takes too long

The "net.corda:type=P2P,name=ReceiveDuration" metric is a histogram measuring latency between receiving a P2P message and delivering it to the state machine.
The properties of this metric can be combined to detect a delay in message processing. 
For instance, - assuming we have received enough messages in the last minute (at least 3 per second) to make a decision,- we can flag up an error if 25% of the messages took significantly (at least 50%) longer than the average message process duration.
This would look like below using the properties of the metric:
oneMinuteRate >3.0, 75thPercentile() > mean * 1.5

## Committing transactions takes too long

The "net.corda:name=Actions.CommitTransaction,type=Flows" metric is a histogram indicating the elapsed time to execute the CommitTransaction action.
The properties of this metric can be combined to detect if executing this action takes unexpectedly long. 
For instance, - assuming we have executed enough actions in the last minute (at least 3 per second) to make a decision,- we can flag up an error if 25% of the actions took significantly (at least 50%) longer to execute than the average CommitTransaction action duration.
This would look like below using the properties of the metric:
oneMinuteRate >3.0, 75thPercentile() > mean * 1.5

## Signing transactions takes too long

The "net.corda:name=SignDuration,type=Transaction" metric is a histogram indicating the duration of signing a transaction.
The properties of this metric can be combined to detect if signing a transaction unexpectedly long. 
For instance, - assuming we have signed enough transactions in the last minute (at least 3 per second) to make a decision,- we can flag up an error if 25% of the transactions took significantly (at least 50%) longer to sign than the duration of signing a transaction.
This would look like below using the properties of the metric:
oneMinuteRate >3.0, 75thPercentile() > mean * 1.5


