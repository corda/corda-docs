---
date: '2020-06-18T12:00:00Z'
menu:
  corda-enterprise-4-5:
    parent: corda-enterprise-4-5-ops-project-planning
tags:
- operations
- deployment
- planning
title: Network member project planning
weight: 200
---

# Node operator

A node operator

## Node sizing

Node sizing is unique for each CorDapp and each deployment, but the following table should give guidance either VMs or physical nodes.

{{< table >}}

|Size|JVM Heap|# Cores|Minimum Host RAM|
|------------|---------|-------|----------------|
|Small|1GB|1|2GB to 3GB|
|Medium|4GB|8|8GB|
|Large|32GB|32|64GB|
|X-Large|> 32GB|> 32|> 64GB|

{{< /table >}}

## Node databases

The following databases are supported

{{< table >}}

|Vendor|CPU Architecture|Versions|JDBC Driver|
|-------------------------------|------------------|------------------|------------------------|
|Microsoft|x86-64|Azure SQL,SQL Server 2017|Microsoft JDBC Driver 6.4|
|Oracle|x86-64|11gR2|Oracle JDBC 6|
|Oracle|x86-64|12cR2|Oracle JDBC 8|
|PostgreSQL|x86-64|9.6, 10.10 11.5|PostgreSQL JDBC Driver 42.1.4 / 42.2.8|

{{< /table >}}

## Production environment

For production environments, you should deploy a Node, with HA implementation of the [Corda Firewall](../node/corda-firewall-component.md/)
and an HSM that conforms to your organisational security policy.

## UAT environment

For UAT environments,
