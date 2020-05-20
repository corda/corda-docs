Zone Service
============

::: {.contents}

local

:   
:::

Overview
-------

Zone service is a central store of configuration for CENM services
for one or more zones and optionally their subzones. These CENM services
can fetch their configuration from Zone service, simplifying
management of changes. They also provide functionality for managing
lifecycle events of subzones, such as updating network parameters via
flag days.

Zone service stores relevant configurations for services such as Identity
Manager and Network Map, and deploys those configurations if needed, via the
connected Angel service and its authentication token. It also determines the subzone that you belong to and fetches the actions needed (for example, configuration change or lifecycle event) for that subzone at a given moment. If any action is required, it is sent to the associated Angel service. 

Run Zone service
------------------------

To run Zone service you must specify:

``` {.bash}
java -jar zoneservice-<VERSION>.jar --enm-listener-port 5050 --admin-listener-port 5051 \
    --driver "org.h2.Driver" --user "example-db-user" --password "example-db-password" \
    --url "jdbc:h2:file:./zone-persistence;DB_CLOSE_ON_EXIT=FALSE;LOCK_TIMEOUT=10000;WRITE_DELAY=0;AUTO_SERVER_PORT=0"
```

The full options are:

-   `--enm-listener-port`: The port where Zone service listens for Angel services to connect
-   `--enm-reconnect`:  Allows you to reconnect. Defaults to true if not
    provided
-   `--tls`: Whether to use TLS on listening sockets (ENM and admin). Defaults to false if
    not provided
-   `--tls-keystore`: The path for the TLS keystore (Optional)
-   `--tls-keystore-password`: The password for the TLS keystore
    (Optional)
-   `--tls-truststore`: The path for the TLS truststore (Optional)
-   `--tls-truststore-password`: The password for the TLS truststore (Optional)
-   `--run-migration`:  Whether to enable schema migration on the database. Defaults to true if not provided
-   `--init-schema`: (Deprecated) Allows you to initialize the schema for the database. Defaults to false if not provided. 
    
    We now use `--run-migration`
-   `--jdbc-driver`:  Path to the JAR file containing the JDBC driver for the database.
-   `--driver-class-name`: Name of the JDBC driver class within the JAR file specified by                   --jdbc-driver.
-   `--url`: The URL for Zone service's database
-   `--user`: The user for Zone service's database
-   `--password`: The password for Zone service's database
-   `--admin-listener-port`: The port where Angel service connects to Zone service
- `--auth-dev-mode`: Allows you to run with a real or developer
    authentication/authorisation service. Defaults to false if not
    provided 
-   `--auth-host`: The hostname of the authentication service. Required
    unless running in developer mode
-   `--auth-port`: The port number of the authentication service. Required
    unless running in developer mode
-   `--auth-trust-store-location`: The location of the authentication service trust root keystore. Required unless running in developer mode
-  `--auth-trust-store-password`: The password for the authentication
    service trust root keystore. Required unless running in developer mode

- `--auth-audience`: The audience that is passed to the authentication service. Required unless running in developer mode
-   `--auth-issuer`: The issuer that is passed to the authentication service.
    Required unless running in developer mode

- `--auth-leeway`: Leeway is the amount of time allowed when checking JSON Web Token (JWT) issuance and expiration times. Passed to the authentication service.
    Required unless running in developer mode. 

    We recommend a default time of **10 seconds**.



Interoperability with Angel service
-----------------------------------

Angel service regularly polls Zone service for jobs. Zone service
maintains its database and decides if a configuration update or
lifecycle event is needed for Angel's underlying service and sends
a response accordingly. If a Flag Day is triggered, Zone service
sends the required step (initiate, start or cancel Flag Day) to the 
Angel service that manages the Network Map. Angel always reports back the status of the current action to Zone service.
