---
aliases:
- /cenm-cli-tool.html
- /releases/release-1.3/cenm-cli-tool.html
date: '2020-05-28T17:40:25Z'
menu: []
tags:
- CLI
- CENM command line interface
- shell
title: CENM Command Line Interface
---

The Command Line Interface (CLI) allows you to perform key CENM tasks remotely and securely.

Once you have permissions to access the CENM service you require, you can use the CLI to perform tasks using the following services:

* Identity manager
* Signing services
* Network map
* Zone management

## Setting up the CENM CLI

In order to use the CLI, you must have permission to access the CENM services you plan to use.

You should have an account that can be set up by administrators using the [User Admin tool](user-admin-tool.html).

## Overview of available commands

You can use the CLI to:

* Update the password you use to access CENM services.
* Set up and switch between contexts - allowing you to perform tasks across multiple servers with minimum effort to switch between them.
* Manage zones.
* Perform tasks in signer services.
* Perform tasks in Identity manager.
* Access the Network Map.  

The main commands are:

`change-password`
Changes the password for a user.

`context`
Login and logout of CENM service management.

`zone`
Commands for zone-service management.

`signer`
Signing commands.

`identity-manager`
Identity-manager management features.

`netmap`
Network-map management features.


## Change a password

This command allows you to change your password in order to access your services.


### Options
-n, --new-password[=<newPassword>]
New password

If present without value, the password can be entered interactively.

-p, --password[=<password>]
Current password

If present without value, the password can be entered interactively.

-u, --username=<username>
Username for password based authentication.

### Arguments
<server>
Url for the targeted CENM API Gateway.

### Example


[EXAMPLE HERE]  

## Setting the context

Your interaction with CENM services through the CLI is managed by the Front-end API Remote Management (FARM) service. This service handles security checks and HTTP translation during your session.

When you log in to each session, you specify the full endpoint of the FARM service instance you are accessing. This endpoint forms the **context** for your session.

[FOR EXAMPLE]

Setting a context means that your session is not interrupted by any natural time-outs in your CENM service.

### Aliases for contexts

If you work on multiple services, or need to access the same service using multiple contexts, you can use the CLI to create **context aliases**. This means you can switch between sessions and back again by switching aliases.


## Log in to a CENM session by setting the Context

When you log in to a CENM session using the CLI, you do so by setting the required **Context** for your session. This ensures you are able to stay logged in to the correct server address for the duration of your work.

For example, once you have accessed the correct server for the **Signing service**, making this address the fixed context means that you no longer need to specify the server address for your subsequent commands.

#### Options

**-a, --alias=<alias>**
Optionally sets an alias for this session.

This can be used for setting the 'current context' and logging out later on.

**-p, --password[=<password>]**
Password for password based authentication.

If present without value, the password can be entered interactively.

**-s, --set-active-context**
Sets the active context to the configured url.

**-u, --username=<username>**
Username for password based authentication.

#### Arguments
**<server>**
Url for the targeted CENM API Gateway (FARM).
