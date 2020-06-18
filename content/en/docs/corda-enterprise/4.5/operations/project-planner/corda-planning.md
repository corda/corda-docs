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

An enterprise deployment of Corda will require a variety of machines and resources depending on the deployment strategy
- a cloud deployment or an on-premise deployment - and the role of each member of the Corda project.

## Corda deployment strategies

Corda can be deployed either physically, as an on-premise deployment, or online as a cloud-based deployment.

### Cloud deployment

A cloud-based deployment of Corda has several unique considerations. For example, the spec, number, and configuration of
VMs,

### On-premise deployment


## Roles in a Corda business network

When planning a to use Corda in an enterprise setting, it's important to understand the role your organisation will play
in the larger business network. Some organisations may develop CorDapps without deploying them to their own Corda network,
others may join pre-existing networks that are run by others, and some organisations may take a lead role in their business
networks, taking the role of Business Network Operators.

### CorDapp Developer

In a Corda network, CorDapps must be deployed to all nodes that wish to transact with one another. The CorDapps may be
developed by a member of the business network, by the Business Network Operator, or by an entirely external organisation.

When developing CorDapps, an organisation should bear in mind the [platform support matrix](platform-support-matrix.md).

To test CorDapps, use the network bootstrapper tool to quickly create Corda networks to test that the CorDapp performs as expected.

**do cordapp developers need to do, for example, performance testing with real nodes? Maybe the CorDapp design contributes
to bad performance by being inefficient**

### Business network member

A member of a Corda business network has a variety of considerations:

- Deployment environment
- Deployment architecture
- Accessing testing environments

#### Deployment environment

**On-premise deployment**

**Cloud deployment**

#### Deployment Architecture

The

#### Accessing testing environments



### Business network operator



