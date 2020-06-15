---
date: '2020-01-08T09:59:25Z'
menu:
  cenm-1-3:
    identifier: cenm-1-3-cenm-support-matrix
    parent: cenm-1-3-operations
    weight: 200
tags:
- cenm
- support
- matrix
title: CENM support matrix
---


# CENM support matrix


## Hardware Security Modules (HSMs)

Both the Signing Service and the PKI Tool support a variety of HSMs.


{{< table >}}

|Device|Firmware Version|Driver Version|High Availability (HA)|
|--------------------------------|----------------------------------|------------------|------|
|Utimaco SecurityServer Se Gen2|4.21.1|4.21.1|No|
|Gemalto Luna|7.0.3|7.3|Yes (Tested and officially supported)|
|Securosys PrimusX|2.7.4|1.8.2|No|
|Azure Key Vault|N/A|1.1.1|No|
|AWS CloudHSM|N/A|3.0.0|No|

{{< /table >}}

CENM currently supports the following databases:

* PostgreSQL 9.6 (JDBC 42.2.8)
* PostgreSQL 10.10 (JDBC 42.2.8)
* PostgreSQL 12.2 (JDBC 42.2.8)
* SQL Server 2017 (Microsoft JDBC Driver 6.4)
* Oracle 11gR2 (Oracle JDBC 6)
* Oracle 12cR2 (Oracle JDBC 8)
