Angel Service
=============

::: {.contents}

local

:   
:::

Purpose
-------

The Angel service is an adapter which manages the lifecycle of other
services such as the Network Map or Identity Manager, to make them more
readily compatible with packaging tools such as Docker. It is generally
not anticipated that customers will run this service directly
themselves, instead it is typically packages in a Docker container and
run via Docker.

Running The Angel Service
-------------------------

To run the Angel service you must specify:

-   The service to be run
-   The hostname/IP of the Zone service
-   The port number to connect to on the Zone service
-   The authentication token to present to the Zone service

Optionally you can also provide a host & port for the Angel service to
expose a health check API on (i.e. for use by Kubernetes), and a poll
timeout for how often to check the Zone service for changes.

The Angel service can be started with a command such as:

``` {.bash}
java -jar angel-<VERSION>.jar --zone-host zone.example.org --zone-port 5050 --token topsecret --service IDENTITY_MANAGER
```

The full options are:

-   `--jar-name`: The name of the service JAR file (optional.)
-   `--webservice-host`: The IP address for the Angel webservice to bind
    to (optional.)
-   `--webservice-port`: The port for the Angel web service to run.
    Optional but must be specified for the web service to be started.
-   `--zone-host`: The host or IP address of the Zone service.
-   `--zone-port`: The port number of the Zone service.
-   `--token`: Authentication token to pass to the Zone service.
-   `--polling-interval`: Time (in seconds) to wait before polling the
    Zone service.
-   `--service`: The name of the service being managed. Available
    options are: IDENTITY\_MANAGER, NETWORK\_MAP.
-   `--network-truststore`: The network truststore file path. Optional
    but must be specified if the managed service is Network Map.
    Otherwise the Flag Day workflow will fail.
-   `--truststore-password`: The password for the network truststore
    file. Optional but must be specified if the managed service is
    Network Map. Otherwise the Flag Day workflow will fail.
-   `--root-alias`: The root alias. Optional but must be specified if
    the managed service is Network Map. Otherwise the Flag Day workflow
    will fail.

Configuration
-------------

All configuration of the Angel service is handled via the command line,
as above. Configuration of the managed service is downloaded from the
Zone service.

Workflow
--------

On startup the Angel service requests the configuration for its managed
service from the Zone service, providing the authentication token to
identify itself. It then performs basic validation of the configuration,
writes it to disk, and starts the managed service.

Following this, at regular intervals it polls the Zone service for
changes to the configuration, and if any are found it backs up the
existing configuration, shuts down the managed service, writes the new
configuration, and start the managed service.

If the managed service is Network Map it is possible that the Zone
service will reply with a lifecycle event (Flag Day) in this case the
Angel service will perform the required steps on the managed Network
Map.

Web Interface
-------------

Angel service has a REST interface where its and the managed service\'s
health can also be checked.

  -----------------------------------------------------------------------
  Request    Path                       Description
  method                                
  ---------- -------------------------- ---------------------------------
  GET        /angel/health              Check the health of the Angel
                                        service.

  GET        /angel/service-health      Check the health of the managed
                                        service.
  -----------------------------------------------------------------------

Possible responses:

+------+------------------------+---+----------------------------+---+
| Path | Example response if    | R | Example response if        | R |
|      | healthy                | e | unhealthy                  | e |
|      |                        | s |                            | s |
|      |                        | p |                            | p |
|      |                        | o |                            | o |
|      |                        | n |                            | n |
|      |                        | s |                            | s |
|      |                        | e |                            | e |
|      |                        | c |                            | c |
|      |                        | o |                            | o |
|      |                        | d |                            | d |
|      |                        | e |                            | e |
+======+========================+===+============================+===+
| /    | Response received from | > | Could not ping managed     | > |
| ange | both Zone Service and  |   | service: NETWORK\_MAP,     |   |
| l/he | managed service:       | 2 | Angel Service is not       | 4 |
| alth | NETWORK\_MAP, Angel    | 0 | considered healthy         | 0 |
|      | Service considered     | 0 |                            | 8 |
|      | healthy                | > |                            | > |
|      |                        |   |                            |   |
|      |                        | O |                            | T |
|      |                        | K |                            | i |
|      |                        |   |                            | m |
|      |                        |   |                            | e |
|      |                        |   |                            | o |
|      |                        |   |                            | u |
|      |                        |   |                            | t |
+------+------------------------+---+----------------------------+---+
| /    | Managed service        | > | Managed service :          | > |
| ange | responded to ping      |   | NETWORK\_MAP did not       |   |
| l/se | request, it is         | 2 | respond to ping request,   | 4 |
| rvic | considered healthy     | 0 | it is not considered       | 0 |
| e-he |                        | 0 | healthy                    | 8 |
| alth |                        | > |                            | > |
|      |                        |   |                            |   |
|      |                        | O |                            | T |
|      |                        | K |                            | i |
|      |                        |   |                            | m |
|      |                        |   |                            | e |
|      |                        |   |                            | o |
|      |                        |   |                            | u |
|      |                        |   |                            | t |
+------+------------------------+---+----------------------------+---+
