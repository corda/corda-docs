---
date: '2020-04-07T12:00:00Z'
menu:
  versions:
    weight: -240
project: corda-enterprise
section_menu: corda-enterprise-4-5
title: Corda Enterprise 4.5
version: '4.5'
---

# Introduction to Corda

A Corda Network is a peer-to-peer network of [Nodes](./node/component-topology.html), each representing a party on the network.
These Nodes run Corda applications [(CorDapps)](./cordapps/cordapp-overview.html), and transact between Nodes using public or
confidential identities.

When one or more Nodes are involved in a transaction, the transaction must be notarised. [Notaries](./notary/ha-notary-service-overview.html) are a specialized type
of Node that provides uniqueness consensus by attesting that, for a given transaction, it has not already signed other
transactions that consumes any of the proposed transaction’s input states.

For all Corda release notes, see the [Release Notes](release-notes-index.md) index page.

## Corda Enterprise

Corda Enterprise is a commercial edition of the Corda platform, specifically optimized to meet the privacy, security and
throughput demands of modern day business. Corda Enterprise is interoperable and compatible with Corda open source and
is designed for organizations with exacting requirements around quality of service and the network infrastructure in
which they operate.

Corda Enterprise contains all the core Corda functionality, but also includes the [Corda Firewall](./node/corda-firewall-component.html),
support for high-availability Node and Notary deployments, and compatibility with hardware security modules [(HSMs)](node/operating/cryptoservice-configuration.html).
