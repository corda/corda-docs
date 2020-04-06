Zone Service
============

::: {.contents}

local

:   
:::

Purpose
-------

The Zone service is a central store of configuration for CENM services
for one or more zones and optionally their subzones. These CENM services
can fetch their configuration from the Zone service, simplifying
management of changes. Further it provides functionality for managing
lifecycle events of subzones, such as updating network parameters via
flag days.

Zone service stores relevant configs for various services e.g. Identity
Manager, Network Map and deploys those configs if needed via the
connected Angel service and its auth token. Moreover the Zone service
will decide which sub-zone does the user belongs to and will fetch the
actions needed (e.g. config change or lifecycle event) for that sub-zone
at a given moment. If there is any it will be sent to the Angel service.

Running The Zone Service
------------------------

To run the Zone service you must specify:

``` {.bash}
java -jar zoneservice-<VERSION>.jar --enm-listener-port 5050 --admin-listener-port 5051 \
    --driver "org.h2.Driver" --user "example-db-user" --password "example-db-password" \
    --url "jdbc:h2:file:./zone-persistence;DB_CLOSE_ON_EXIT=FALSE;LOCK_TIMEOUT=10000;WRITE_DELAY=0;AUTO_SERVER_PORT=0"
```

The full options are:

-   `--enm-listener-port`: The port where the Zone service will listen.
-   `--enm-reconnect`: Whether to reconnect. Defaults to true if not
    provided.
-   `--ssl`: Whether to use SSL for connections. Defaults to false if
    not provided.
-   `--ssl-keystore`: The path for the SSL keystore. (optional)
-   `--ssl-keystore-password`: The password for the SSL keystore.
    (optional)
-   `--ssl-truststore`: The path for the SSL truststore. (optional)
-   `--ssl-truststore-password`: The password for the SSL truststore.
    (optional)
-   `--run-migration`: Whether to run migration on the database.
    Defaults to true if not provided.
-   `--init-schema`: Whether to initialize the schema for the database.
    Defaults to true if not provided.
-   `--driver`: The driver for the database the Zone service is going to
    use.
-   `--url`: URL for the Zone service\'s database.
-   `--user`: User for the Zone service\'s database.
-   `--password`: Password for the Zone service\'s database.
-   `--admin-listener-port`: Port to connect for Admin Client RPC.
-   \`\`\--auth-dev-mode: Whether to run with a real or developer
    authentication/authorisation service. Defaults to false if not
    provided.
-   \`\`\--auth-host: Hostname of the authentication service. Required
    unless running in developer mode.
-   \`\`\--auth-port: Port number of the authentication service.
    Required unless running in developer mode.
-   \`\`\--auth-trust-store-location: Location of the authentication
    service trust root keystore. Required unless running in developer
    mode.
-   \`\`\--auth-trust-store-password: Password for the authentication
    service trust root keystore. Required unless running in developer
    mode.
-   \`\`\--auth-audience: Audience, passed to the authentication
    service. Required unless running in developer mode.
-   \`\`\--auth-issuer: Issuer, passed to the authentication service.
    Required unless running in developer mode.
-   \`\`\--auth-leeway: Leeway, passed to the authentication service.
    Required unless running in developer mode.

Interoperability with Angel service
-----------------------------------

Angel service will periodically poll Zone service for jobs. Zone service
maintains its database and decides if a configuration update or
lifecycle event is needed for the Angel\'s underlying service and sends
a response accordingly. If a Flag Day was triggered then Zone service
will send the required step (initiate, start or cancel Flag Day) to the
Angel service that manages the Network Map. Angel will always report
back the status of the current action to Zone service.
