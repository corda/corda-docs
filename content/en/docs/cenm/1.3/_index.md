---
date: '2020-01-08T09:59:25Z'
menu:
  versions:
    weight: 970
project: cenm
section_menu: cenm-1-3
title: CENM 1.3
version: '1.3'
---


# Welcome to the Corda Enterprise Network Manager

The Corda Enterprise Network Manager (CENM) is a commercial offering from R3 that facilitates the operation of a bespoke
Corda network that gives the user full control over all aspects of deployment, operation, and consensus rules.
This is provided as an alternative to using the service-level-managed production components
that are otherwise available from [Corda Network](https://corda.network) which is governed by the independent
Corda Network Foundation.

The *Corda Enterprise Network Manager* provides three main services:


* [Identity Manager Service](identity-manager.md) - Enables nodes to join the network, and handles revocation of a node certificate
* [Network Map Service](network-map.md) - Provides a global view of the network
* [Signing Services](signing-service.md) - Provides a way to sign approved requests to join the network (CSRs) or revoke a certificate  (CRRs) as well as changes to the network map.
 <!-- CSRs and CRRs - are these spelt out anywhere? if not, spell these out here followed by the abbreviations in brackets as shown above/ -->

For a quick start guide on running the CENM services see [Enterprise Network Manager Quick-Start Guide](quick-start.md).


Concepts and Overview

* [Corda Networks](corda-networks.md)
* [Components of the Corda Enterprise Network Manager](enm-components.md)
* [The Workflow](enm-components.md#the-workflow)
* [Databases](enm-components.md#databases)
* [Public Key Infrastructure (PKI)](enm-components.md#public-key-infrastructure-pki)
* [The Node](enm-components.md#the-node)
* [Sub Zones](sub-zones.md)
* [Network Map Overview](network-map-overview.md)
* [Certificate Revocation List](certificate-revocation.md)




CENM Releases

* [Release notes](release-notes.md)
* [Upgrading Corda Enterprise Network Manager](upgrade-notes.md)




Operations

* [Enterprise Network Manager Quick-Start Guide](quick-start.md)
* [Deployment with Kubernetes](deployment-kubernetes.md)
  * [CENM Identity Manager Helm Chart](deployment-kubernetes-idman.md)
  * [CENM Network Map Helm Chart](deployment-kubernetes-nmap.md)
  * [CENM Signing Service Helm Chart](deployment-kubernetes-signer.md)
  * [CENM Notary Helm Chart](deployment-kubernetes-notary.md)
  * [CENM Zone Service Helm Chart](deployment-kubernetes-zone.md)
* [Zone Service](zone-service.md)
* [Angel Service](angel-service.md)
* [Identity Manager Service](identity-manager.md)
* [Network Map Service](network-map.md)
* [Signing Services](signing-service.md)
* [Updating the network parameters](updating-network-parameters.md)
* [Upgrading Corda Enterprise Network Manager](upgrade-notes.md)
* [CENM Databases](database-set-up.md)
* [Troubleshooting Common Issues](troubleshooting-common-issues.md)
* [CENM support matrix](cenm-support-matrix.md)




Configuration

* [Identity Manager Configuration Parameters](config-identity-manager-parameters.md)
* [Network Map Configuration Parameters](config-network-map-parameters.md)
* [Network Parameters](config-network-parameters.md)
* [Configuring the CENM services to use SSL](enm-with-ssl.md)
* [Workflow](workflow.md)




Tools & Utilities

* [Tools & Utilities](tools-index.md)
* [Embedded Shell](shell.md)




Public Key Infrastructure

* [Certificate Hierarchy Guide](pki-guide.md)
* [Public Key Infrastructure (PKI) Tool](pki-tool.md)




Signing Plugin Samples

* [EJBCA Sample Plugin](ejbca-plugin.md)
