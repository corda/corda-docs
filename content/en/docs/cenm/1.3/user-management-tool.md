---
aliases:
- /pki-tool.html
- /releases/release-1.2/pki-tool.html
date: '2020-05-22T05:59:25Z'
menu:
  cenm-1-3:
    identifier: cenm-1-3-user-management-tool
    parent: cenm-1-3-tools-index
    weight: 1015
tags:
- users
-
- tool
title: CENM User Admin tool
---

## CENM User Admin tool

The User Admin tool allows you to manage the profiles of users, groups, and administrators who perform network operations on your bespoke network. You can use the tool to create roles with specific permissions and assign them to users. For example, you can give a user of the Identity Manager service a role that permits them to sign the issuance of a certificate to join the network.

The three main services you can give users access to are:

* Identity Manager service
* Network Map service
* Signing service

With the User Management tool, you can:

* Add users. A user is anyone who requires access to perform network operations.
* Add administrators. An administrator can add and manage users with the tool. For security reasons, an administrator cannot perform any network operations. Only a user can perform this task.
* Manage user and administrator login details.
* Create and manage groups. A group is comprised of multiple users with shared roles and permissions.
* Create and manage roles. A role is a set of permissions that can be assigned to users and groups of users.


## Install the CENM User Admin tool

To install the User Admin tool, you first need to request the installation file from your contact at R3. You also need a temporary login to set up your first administrator.

To install Network User Manager:

[STEPS REQUIRED HERE]

## Change your password

When logging into the CENM User Admin tool as an administrator for the first time, you must change your temporary password. You can also repeat this process whenever you want to update your password to access your managed network.

To change your password:

1. Login to the User Management tool. If this is your first use of the tool, or you have requested a new login, use the temporary password you have been given.
2. On the next screen, click on the user profile button in the top right-hand corner.
3. On the **User Details** screen, enter and confirm your new password in the **Change user password** fields.
4. Click **Submit**.

You have changed your password. You are automatically logged out of the User Management tool, and can now log back in using your new password.


## Add a new user or administrator

Users are able to access network services to perform relevant tasks. When you create a user, you can also assign them a role, and add them to a group.

Administrators can only perform tasks on the User Admin tool - an administrator in this tool *cannot* have any role as a user on your network operation services.

{{< note >}}
You must be an administrator to create new users and administrators.
{{< /note >}}

To add a new user or administrator:

1. After logging in, click **Users** on the left-hand menu.
    The **Users** screen is displayed. You can see all the users currently managed within the User Admin tool.
2. On the **Users** screen, click the **Create** icon in the corner.
3. On the **Create new user** screen, enter the user's username, display name, and email details in the fields provided.
4. In the **Groups** section, select any groups you wish this user to be added to when their account is activated.
5. In the **Password** field, choose a temporary password that the new user can change on their first use of the User Admin tool.
6. Select **Enabled** for the account to be active immediately. To activate the account later, leave this switched off.
7. To make this user an administrator, set the **Admin** switch to active.
7. Click **Submit**.

You have added a new User.

## Create a new Group



## Manage a Group

## Create a new Role

## Manage a Role
