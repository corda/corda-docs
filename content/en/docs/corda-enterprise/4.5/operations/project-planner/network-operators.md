---
date: '2020-06-18T12:00:00Z'
menu:
  corda-enterprise-4-5:
    parent: corda-enterprise-4-5-ops-project-planning
tags:
- operations
- deployment
- planning
title: Network operator project planning
weight: 300
---

# Network operator project planning

The Business Network Operator is responsible for the infrastructure of the business network, they maintain the network map
and identity services that allow parties to communicate, and - in many deployments - also operate the notary service.

## Deployment architecture

The Business Network Operator is responsible for all major components of the Corda network. In most enterprise deployments
of Corda this includes: Nodes, an HA notary cluster, an HA Corda Firewall, an HSM, the certificate hierarchy of the network,
identity manager, and network map.

This likely includes a Corda Enterprise Network Manager as well as Corda Enterprise.

**Development and testing environments**

A Business Network Operator should have a variety of environments:

- A development environment including minimum network infrastructure.
- A testing environment including a basic network, without HA notary, Corda Firewall, or HSMs.
- A UAT environment, that includes the full network infrastructure, with a shared HSM, and HA Corda Firewall.
- The production environment, including an HA notary cluster, HA Corda Firewalls on all nodes, HSMs, and network services.




## JPA notary databases


{{< table >}}

|Vendor|CPU Architecture|Versions|JDBC Driver|
|-------------------------------|------------------|------------------|--------------------|
|CockroachDB|x86-64|19.1.2|PostgreSQL JDBCDriver 42.1.4|
|Oracle RAC|x86-64|12cR2|Oracle JDBC 8|

{{< /table >}}



## Hardware Security Modules (HSM)


{{< table >}}

|Device|Legal Identity & CA keys|TLS keys|Confidential Identity keys|Notary service keys|
|-------------------------------|----------------------------|----------------------------|----------------------------|--------------------------|
| Utimaco SecurityServer Se Gen2| * Firmware version 4.21.1  | * Firmware version 4.21.1  | Not supported              | Not supported            |
|                               | * Driver version 4.21.1    | * Driver version 4.21.1    |                            |                          |
| Gemalto Luna                  | * Firmware version 7.0.3   | * Firmware version 7.0.3   | Not supported              | Not supported            |
|                               | * Driver version 7.3       | * Driver version 7.3       |                            |                          |
| FutureX Vectera Plus          | * Firmware version 6.1.5.8 | * Firmware version 6.1.5.8 | Not supported              | Not supported            |
|                               | * PKCS#11 version 3.1      | * PKCS#11 version 3.1      |                            |                          |
|                               | * FXJCA version 1.17       | * FXJCA version 1.17       |                            |                          |
| Azure Key Vault               | * Driver version 1.2.1     | * Driver version 1.2.1     | Not supported              | * Driver version 1.2.1   |
| Securosys PrimusX             | * Firmware version 2.7.4   | * Firmware version 2.7.4   | * Firmware version 2.7.4   | * Firmware version 2.7.4 |
|                               | * Driver version 1.8.2     | * Driver version 1.8.2     | * Driver version 1.8.2     | * Driver version 1.8.2   |
| nCipher nShield Connect       | * Firmware version 12.50.11| * Firmware version 12.50.11| Not supported              | Not supported            |
|                               | * Driver version 12.60.2   | * Driver version 12.60.2   |                            |                          |
| AWS CloudHSM                  | * Driver version 3.0.0     | * Driver version 3.0.0     | * Driver version 3.0.0     | Not supported            |

{{< /table >}}
