---
date: '2020-09-25T12:00:00Z'
menu:
  corda-os-4-6:
    identifier: corda-os-4-6-business-network-management
    parent: corda-os-4-6-corda-networks-index
    weight: 1100
tags:
- BNO
- notary
title: Managing Business Network membership
---

# Business Network management

This Corda platform extension allows you to create and manage business networks - as a node operator, this means you can define and create a logical network based on a set of common CorDapps as well as a shared business context.

Corda nodes outside of your business network are not aware of its members. The network can be split into subgroups or membership lists which allows for further privacy (members of a group only know about those in their group).

In a business network, there is at least one *authorised member*. This member has sufficient permissions to execute management operations over the network and its members.

{{< warning >}}
In this version, it is possible for an authorised member - such as the Business Network Operator - to remove permissions from itself, potentially leaving the network in a state where no member can perform management operations.  In such a case, permissions can be granted back by other members who are authorised to do so. If there are none left, there is no way of recovering.
{{< /warning >}}

## Creating and managing a business network

With this extension, you can use a set of flows to:

* Start a business network.
* Add members.
* Assign members to membership lists or groups.
* Update information about a member - such as their Business Network identity.
* Modify a member's roles in the network.
* Suspend or revoke membership.  

## Installation

This is an extension of Corda OS 4.6. If you have this version of Corda, and want to set up and run a Business Network, you can make use of the extension flows.

## Create a business network

From either the node shell or from an RPC client, run `CreateBusinessNetworkFlow`. This will self-issue a membership with an exhaustive permissions set that allows the calling node to manage future operations for the newly created network.

**Flow arguments:**

- ```networkId``` Custom ID to be given to the new Business Network. If not specified, a randomly selected one will be used.
- ```businessIdentity``` Optional custom business identity to be given to membership.
- ```groupId``` Custom ID to be given to the initial Business Network group. If not specified, randomly selected one will be used.
- ```groupName``` Optional name to be given to the Business Network group.
- ```notary``` Identity of the notary to be used for transactions notarisation. If not specified, first one from the whitelist will be used.

*Example*:
```kotlin
val myIdentity: BNIdentity = createBusinessNetworkIdentity() // mock method that creates an instance of a class implementing [BNIdentity]
val groupId = UniqueIdentifier()
val notary = serviceHub.networkMapCache.notaryIdentities.first()

CordaRPCClient(rpcAddress).start(user.userName, user.password).use {
    it.proxy.startFlow(::CreateBusinessNetworkFlow, "MyBusinessNetwork", myIdentity, groupId, "Group 1", notary)
            .returnValue.getOrThrow()
}
```

## On-board a new member

Joining a business network is a 2 step process. First the prospective member must send a request. Then the request is approved and the member is added.

### Step 1 - prospective member sends a membership request

1. The Corda node wishing to join must run the ```RequestMembershipFlow``` either from the node shell or any other RPC client.
2. As a result of a successful run, a membership is created with a *PENDING* status and all authorised members will be notified of any future operations involving it.
3. The prospective member awaits action to activate their membership by an authorised member of the network.


Until activated by an authorised party, such as a Business Network Operator (BNO), the newly generated membership can neither be used nor grant the requesting node any permissions in the business network.

**RequestMembershipFlow arguments**:

- ```authorisedParty``` Identity of authorised member from whom membership activation is requested
- ```networkId``` ID of the Business Network that potential new member wants to join
- ```businessIdentity``` Optional custom business identity to be given to membership
- ```notary``` Identity of the notary to be used for transactions notarisation. If not specified, first one from the whitelist will be used

*Example*:

```kotlin
val myIdentity: BNIdentity = createBusinessNetworkIdentity() // create an instance of a class implementing [BNIdentity]
val networkId = "MyBusinessNetwork"
val bno: Party = ... // get the [Party] object of the Corda node acting as a BNO for the business network represented by [networkId]
val notary = serviceHub.networkMapCache.notaryIdentities.first())

CordaRPCClient(rpcAddress).start(user.userName, user.password).use {
    it.proxy.startFlow(::RequestMembershipFlow, bno, networkId, myIdentity, notary)
            .returnValue.getOrThrow()
}
```

### Step 2 - an authorised network member activates the new membership

To finalise the on-boarding process:

1. As an authorised member, such as BNO, run the ```ActivateMembershipFlow``` to update the targeted membership status from *PENDING* to *ACTIVE*.
2. Signatures are collected from **all** authorised parties in the network.
3. Follow-up with a group assignment by running the ```ModifyGroupFlow```.

**ActivateMembershipFlow arguments**:

- ```membershipId``` ID of the membership to be activated
- ```notary``` Identity of the notary to be used for transactions notarisation. If not specified, first one from the whitelist will be used

*Example*:

```kotlin
val bnService = serviceHub.cordaService(BNService::class.java)
val networkId = "MyBusinessNetwork"
val newMemberPartyObject = ... // get the [Party] object of the member whose membership is being activated
val membershipId = bnService.getMembership("MyBusinessNetwork", newMemberPartyObject)
val groupName = "Group 1"
val groupId = ... // identifier of the group which the member will be assigned to
val notary = serviceHub.networkMapCache.notaryIdentities.first())

CordaRPCClient(rpcAddress).start(user.userName, user.password).use {
    it.proxy.startFlow(::ActivateMembershipFlow, membershipId, notary)
            .returnValue.getOrThrow()

    // add newly activated member to a membership list
    val newParticipantsList = bnService.getBusinessNetworkGroup(groupId).state.data.participants.map {
        BNService.getMembership(networkId, it)!!.state.data.linearId
    } + membershipId

    it.proxy.startFlow(::ModifyGroupFlow, groupId, groupName, newParticipantsList, notary)
            .returnValue.getOrThrow()
}
```

## Amend a membership

There are attributes of a member's information that can be updated, not including network operations such as membership suspension or revocation. TO perform these amendments, you must be an authorised network party.

The attributes which can be amended are:

* Business network identity.
* Membership list or group.
* Roles.

### Update a members business identity attribute

To update a member's business identity attribute:

1. Run the ```ModifyBusinessIdentityFlow```.
2. All network members with sufficient permissions approve the proposed change.

**ModifyBusinessIdentityFlow arguments**:

- ```membershipId``` ID of the membership to modify business identity
- ```businessIdentity``` Optional custom business identity to be given to membership
- ```notary``` Identity of the notary to be used for transactions notarisation. If not specified, first one from the whitelist will be used

*Example*:

```kotlin
val bnService = serviceHub.cordaService(BNService::class.java)
val networkId = "MyBusinessNetwork"
val partyToBeUpdated = ... // get the [Party] object of the member being updated
val membership = bnService.getMembership(networkId, partyToBeUpdated)
val updatedIdentity: BNIdentity = updateBusinessIdentity(membership.state.data.identity) // mock method that updates the business identity in some meaningful way
val notary = serviceHub.networkMapCache.notaryIdentities.first())

CordaRPCClient(rpcAddress).start(user.userName, user.password).use {
    it.proxy.startFlow(::ModifyBusinessIdentityFlow, membership.state.data.linearId, updatedIdentity, notary)
            .returnValue.getOrThrow()
}
```

### Update a members business identity attribute

You can update a member's business identity attributes - by modifying their roles. Depending on your proposed changes, the updated member may become an **authorised member**. In this case, your enhancement must be preceded by an execution of the [`ModifyGroupsFlow`](#modify-a-group) to add the member to all membership lists that it will have administrative powers over.

To update a member's roles and permissions in the business network:

1. Run the `ModifyRolesFlow`.
2. All network members with sufficient permissions approve the proposed change.

**ModifyRolesFlow arguments**:

- `membershipId` ID of the membership to assign roles
- `roles` Set of roles to be assigned to membership
- `notary` Identity of the notary to be used for transactions notarisation. If not specified, first one from the whitelist will be used

*Example*:

```kotlin
val roles = setOf(BNORole()) // assign full permissions to member
val bnService = serviceHub.cordaService(BNService::class.java)
val networkId = "MyBusinessNetwork"
val partyToBeUpdated = ... // get the [Party] object of the member being updated
val membershipId = bnService.getMembership(networkId, partyToBeUpdated).state.data.linearId
val notary = serviceHub.networkMapCache.notaryIdentities.first())

CordaRPCClient(rpcAddress).start(user.userName, user.password).use {
    it.proxy.startFlow(::ModifyRolesFlow, membershipId, roles, notary)
            .returnValue.getOrThrow()
}
```

## Manage groups

To manage the membership lists or groups, one of the authorised members of the network can use `CreateGroupFlow`, `DeleteGroupFlow` and `ModifyGroupFlow`.

### Create a group

To create a new group:

1. Run `CreateGroupFlow`. 

**CreateGroupFlow arguments**:

- `networkId` ID of the Business Network that Business Network Group will relate to.
- `groupId` Custom ID to be given to the issued Business Network Group. If not specified, randomly selected one will be used.
- `groupName` Optional name to be given to the issued Business Network Group.
- `additionalParticipants` Set of participants to be added to issued Business Network Group alongside initiator's identity.
- `notary` Identity of the notary to be used for transactions notarisation. If not specified, first one from the whitelist will be used.

There are two additional flows that can be used to quickly assign roles to a membership: ```AssignBNORoleFlow``` and ```AssignMemberRoleFlow```. They both share the same arguments:

- `membershipId` ID of the membership to assign the role.
- `notary` Identity of the notary to be used for transactions notarisation. If not specified, first one from the whitelist will be used.

**Example**:

```kotlin
val notary = serviceHub.networkMapCache.notaryIdentities.first())
val myNetworkId = "MyBusinessNetwork"
val myGroupId = UniqueIdentifier()
val groupName = "Group 1"
CordaRPCClient(rpcAddress).start(user.userName, user.password).use {
    it.proxy.startFlow(::CreateGroupFlow, myNetworkId, myGroupId, groupName, emptySet(), notary)
            .returnValue.getOrThrow()
}
```

**DeleteGroupFlow arguments**:

- `groupId` ID of group to be deleted
- `notary` Identity of the notary to be used for transactions notarisation. If not specified, first one from the whitelist will be used

### Modify a group

The `ModifyGroupFlow` can update the name of a group and/or its list of members. At least one of the *name* or *participants* arguments
must be provided.

**ModifyGroupFlow arguments**:

- ```groupId``` ID of group to be modified
- ```name``` New name of modified group
- ```participants``` New participants of modified group
- ```notary``` Identity of the notary to be used for transactions notarisation. If not specified, first one from the whitelist will be used

*Example*:

```kotlin
val bnService = serviceHub.cordaService(BNService::class.java)
val bnGroupId = ... // get the identifier of the group being updated
val bnGroupName = bnService.getBusinessNetworkGroup(bnGroupId).state.data.name
val participantsList = bnService.getBusinessNetworkGroup(bnGroupId).state.data.participants
val newParticipantsList = removeMember(someMember, participantsList) // mock method that removes a member from the group
val notary = serviceHub.networkMapCache.notaryIdentities.first())

CordaRPCClient(rpcAddress).start(user.userName, user.password).use {
    it.proxy.startFlow(::ModifyGroupFlow, bnGroupId, bnGroupName, newParticipantsList, notary)
            .returnValue.getOrThrow()
}
```

## Suspend or revoke a membership

Temporarily suspending a member or completely removing it from the business network is done using ```SuspendMembershipFlow``` and ```RevokeMembershipFlow```. They both use the same exactly arguments:

- ```membershipId``` ID of the membership to be suspended/revoked
- ```notary``` Identity of the notary to be used for transactions notarisation. If not specified, first one from the whitelist will be used

Suspending a member will result in a membership status change to ```SUSPENDED``` and still allow said member to be in the business network. Revocation means that the membership is marked as historic/spent
and and a new one will have to be requested and activated in order for the member to re-join the network.

*Example*:

```kotlin
val notary = serviceHub.networkMapCache.notaryIdentities.first())
val memberToBeSuspended = ... // get the linear ID of the membership state associated with the Party which is being suspended from the network
val memberToBeRevoked = ... // get the linear ID of the membership state associated with the Party which is being removed from the network
// Revocation
CordaRPCClient(rpcAddress).start(user.userName, user.password).use {
    it.proxy.startFlow(::RevokeMembershipFlow, memberToBeRevoked, notary)
            .returnValue.getOrThrow()
}

// Suspension
CordaRPCClient(rpcAddress).start(user.userName, user.password).use {
    it.proxy.startFlow(::RevokeMembershipFlow, memberToBeSuspended, notary)
            .returnValue.getOrThrow()
}
```
