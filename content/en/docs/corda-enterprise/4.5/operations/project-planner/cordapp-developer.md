---
date: '2020-06-18T12:00:00Z'
menu:
  corda-enterprise-4-5:
    parent: corda-enterprise-4-5-ops-project-planning
tags:
- operations
- deployment
- planning
title: CorDapp developer project planning
weight: 100
---

# CorDapp development project planning

When developing a CorDapp for production deployment, there are several important factors to consider:

- CorDapp development requirements
- CorDapp testing
- CorDapp performance at scale
- Deployment architecture

## Developing CorDapps

There are a number of pre-requisites for CorDapp development.

- You must use the **Java 8 JVM**, version 8u171 and onwards are supported, but version 9 and later is not supported.

## Operating systems supported in production


{{< table >}}

|Platform|CPU Architecture|Versions|
|-------------------------------|------------------|-----------|
|Red Hat Enterprise Linux|x86-64|7.x,6.x|
|Suse Linux Enterprise Server|x86-64|12.x,11.x|
|Ubuntu Linux|x86-64|16.04,18.04|
|Oracle Linux|x86-64|7.x,6.x|

{{< /table >}}


## Operating systems supported in development


{{< table >}}

|Platform|CPU Architecture|Versions|
|-------------------------------|------------------|-----------|
|Microsoft Windows|x86-64|10,8.x|
|Microsoft Windows Server|x86-64|2016, 2012 R2,2012|
|Apple macOS|x86-64|10.9 andabove|

{{< /table >}}
