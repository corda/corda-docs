---
date: '2020-06-18T12:00:00Z'
menu:
  corda-enterprise-4-5:
    identifier: corda-enterprise-4-5-ops-project-planning
    name: "Corda for project planners"
    parent: corda-enterprise-4-5-operations-guide
tags:
- operations
- deployment
- planning
title: Corda Enterprise Operations Guide
weight: 10
---

# Corda for Project Planners

An enterprise deployment of Corda will require a variety of machines and resources depending on the role of each member
of the Corda project, and the architecture of the deployment. It's important to define the role or roles of your organisation
before beginning a project on Corda.

## Roles in a Corda business network

When planning a to use Corda in an enterprise setting, it's important to understand the role your organisation will play
in the larger business network. Some organisations may develop CorDapps for deployment to other networks, others may operate
only their own nodes, and some organisations may take a lead role in their business network infrastructure, taking the
role of Business Network Operators.

### CorDapp Developer

In a Corda network, the same CorDapp must be deployed to all nodes that wish to transact with one another. CorDapps may be
developed by a member of the business network, by the Business Network Operator, or by an entirely external organisation.

When developing CorDapps, an organisation should bear in mind the [platform support matrix](platform-support-matrix.md/)
and the guidance on [developing CorDapps](../cordapps/cordapp-overview.md/).

To test CorDapps, use the network bootstrapper tool to quickly create Corda networks to test that the CorDapp performs as expected.

### Node operator

A member of a Corda business network has a variety of considerations:

**Deployment architecture**

The architecture of the specific Corda deployment will change the resources required for an ongoing deployment, but for
a production deployment, a node should have an HA implementation of the Corda Firewall, and an HSM compatible with the
security policy of the organisation.

**Testing environments**

A node operator should operate or have access to a testing network, a UAT network, and their production network.

UAT and production networks should include a node, HA firewall, and an HSM, although it may not be necessary for more
informal testing environments. In some cases, a Business Network Operator will provide access to a UAT environment that
node operators may connect to.


### Business Network Operator

The Business Network Operator is responsible for the infrastructure of the business network, they maintain the network map
and identity services that allow parties to communicate, and - in many deployments - also operate the notary service.

**Deployment architecture**

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
