# Zone Service

## Overview

The Zone service is a central store of configuration for CENM services
for one or more zones and optionally their subzones. These CENM services
can fetch their configuration from Zone service, simplifying
management of changes. They also provide functionality for managing
lifecycle events of subzones, such as updating network parameters via
flag days.

Zone service stores relevant configurations for the following services:

* Identity Manager
* Network Map
* Signing

It deploys those configurations as needed, via the associated Angel service.
Angel services identify themselves to the Zone service via an authentication
token referred to as the "zone token". The Zone service also co-ordinates actions
needed (for example, new network parameters) on subzones, which are executed
by the Angel service for the appropriate Network Map service.

## Running the Zone service

The Zone service does not have a configuration file, and is configured entirely
from the command line. To run the Zone service you use a command such as:

```bash
java -jar zone.jar --enm-listener-port=5061 --url=\"jdbc:h2:file:/opt/zone/zone-persistence;DB_CLOSE_ON_EXIT=FALSE;LOCK_TIMEOUT=10000;WRITE_DELAY=0;AUTO_SERVER_PORT=0\" --user=testuser --password=password --admin-listener-port=5063 --driver-class-name=org.h2.jdbcx.JdbcDataSource --auth-host=auth-service --auth-port=8081 --auth-trust-store-location=certificates/corda-ssl-trust-store.jks --auth-trust-store-password=trustpass --auth-issuer=http://test --auth-leeway=10 --run-migration=true
```

The full options are:

- `--enm-listener-port`: The port where Zone service listens for Angel services to connect.
- `--enm-reconnect`:  Allows you to reconnect. Defaults to true if not provided.
- `--tls`: Whether to use TLS on listening sockets (ENM and admin). Defaults to false if not provided.
- `--tls-keystore`: The path for the TLS keystore. Required if `--tls` is true.
- `--tls-keystore-password`: The password for the TLS keystore. Required if `--tls` is true.
- `--tls-truststore`: The path for the TLS truststore. Required if `--tls` is true.
- `--tls-truststore-password`: The password for the TLS truststore. Required if `--tls` is true.
- `--run-migration`:  Whether to enable schema migration on the database. Defaults to false if not provided.
- `--jdbc-driver`:  Path to the JAR file containing the JDBC driver for the database.
- `--driver-class-name`: Name of the JDBC driver class within the JAR file specified by --jdbc-driver.
- `--url`: The URL for Zone service's database
- `--user`: The user for the Zone service's database
- `--password`: The password for the Zone service's database
- `--admin-listener-port`: The port where Angel services connect to Zone service
- `--disable-authentication`: Allows you to disable authentication, intended only for use in development environments. Defaults to false if not provided.
- `--auth-host`: The hostname of the authentication service. Required unless authentication is disabled
- `--auth-port`: The port number of the authentication service. Required unless authentication is disabled
- `--auth-trust-store-location`: The location of the authentication service trust root keystore. Required unless authentication is disabled
- `--auth-trust-store-password`: The password for the authentication service trust root keystore. Required unless authentication is disabled
- `--auth-issuer`: The \"iss\" claim in the JWT; needs to be set to the same value as in the Auth service's configuration. Required unless authentication is disabled.
- `--auth-leeway`: Leeway is the amount of time, in seconds, allowed when checking JSON Web Token (JWT) issuance and expiration times.
    Required unless authentication is disabled. We recommend a default time of **10 seconds**.

## Configuration Composition

The Zone service edits configurations before sending them to managed services,
to ensure consistency and correctness of the configurations. These changes are
outlined below:

### Identity Manager Configuration

The Zone service sets the authentication configuration on the Identity Manager
service configuration, using the values provided to the Zone service. Note that:

* Auth trust store location and password must match on the Zone and Identity Manager
  hosts. It is suggested that the trust store location is relative to the working directory
  on each host, i.e. `certificates/auth-trust-store.jks`, rather than an absolute path.
* The shell UI used in 1.2 and below is not supported in combination with the 1.3 authentication,
  so configurations *must not* specify a shell configuration or they will be rejected by the
  Identity Manager.

### Network Map Configuration

The Zone service sets the authentication configuration on the Network Map service
configuration, along with the subzone ID (`authObjectId`). As with the Identity
Manager it uses the auth service configuration provided to the Zone service, and
the same guidance on sharing values applies as per the Identity Manager.

The subzone ID is used to support per-subzone permissioning for users. Generally
as it is set automatically the user is not expected to need to be aware of this
value, but it is documented to be thorough.

### Signing Configuration

The service locations for the Signing service are set by the Zone service using
the external addresses of the Identity Manager and Network Map service configurations,
and the configured ENM port for those services. Any service locations provided
in Signing service configurations sent to the Zone service are overwritten.

The SSL client settings used when connecting to these services are set uniformly
across all service locations, and are taken from the first of any service location
in the Signing service location set on the Zone service.

As the service locations are generated programmatically, the service location aliases
(referred to by the signing task configurations) are in a specific format which
must be matched exactly:

* Identity Manager CSR: `issuance`
* Identity Manager CRR/CRL: `revocation`
* Network Map: `network-map-<subzone-id>`

An example configuration section generated by the Zone service is provided below:

```guess
serviceLocations = {
    "issuance" = {
        host = "identity-manager"
        port = 5051
        reconnect = true
        ssl = {
            keyStore = {
                location = ./certificates/corda-ssl-signer-keys.jks
                password = password
                keyPassword = password
            }
            trustStore = {
                location = ./certificates/corda-ssl-trust-store.jks
                password = trustpass
            }
            validate = true
        }
        verbose = false
    }
    "network-map-1" = {
        host = "networkmap"
        port = 5070
        reconnect = true
        ssl = {
            keyStore = {
                location = ./certificates/corda-ssl-signer-keys.jks
                password = password
                keyPassword = password
            }
            trustStore = {
                location = ./certificates/corda-ssl-trust-store.jks
                password = trustpass
            }
            validate = true
        }
        verbose = false
    }
    "revocation" = {
        host = "identity-manager"
        port = 5052
        reconnect = true
        ssl = {
            keyStore = {
                keyPassword = password
                location = ./certificates/corda-ssl-signer-keys.jks
                password = password
            }
            trustStore = {
                location = ./certificates/corda-ssl-trust-store.jks
                password = trustpass
            }
            validate = true
        }
        verbose = false
    }
}
```

## Interaction with Angel Services

Angel services regularly poll the network's Zone service for jobs. Zone service
maintains its database and decides if a configuration update or
lifecycle event is needed for Angel's underlying service and sends
a response accordingly. If a Flag Day is triggered, Zone service
sends the required step (initiate, start or cancel Flag Day) to the
Angel service that manages the Network Map. Angel always reports back the status of the current action to Zone service.
