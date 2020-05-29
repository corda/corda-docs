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

# CENM Command Line Interface (CLI)

The Command Line Interface (CLI) allows you to perform key CENM tasks remotely and securely.

Once you have permissions to access the CENM service you require, you can use the CLI to perform tasks using the following services:

* Identity manager
* Zone management
* Network map
* Signing services

## Setting up the CENM CLI

In order to use the CLI, you must have permission to access the CENM services you plan to use.

You should have an account that can be set up by administrators using the [User Admin tool](user-admin-tool.html).

## Quickstart - set up a new network with the CLI

You must set up any new network in a specific order, as some services rely on information that must be in place before they can be created.
Most importantly, you must set the **Signing service** configuration last.

{{< Note >}}
The commands and options in these steps are explored in more detail throughout this document.
{{< /Note >}}

To set up a new network with the CLI:

1. Login
`./cenm context login http://localhost:8081 -u jenny-editor -p password`

2. Set the Identity Manager's external address. This must be the address that external parties will use to connect with the Identity Manager.
`./cenm identity-manager config set-address -a=identity-manager:5053`

3. Set the Identity Manager config
`./cenm identity-manager config set -f config/identitymanager.conf --zone-token`

4. Create a new subzone
`./cenm zone create-subzone --config-file=config/networkmap.conf --label=Subzone --label-color="#000000" --network-map-address=networkmap:8080 --network-parameters=config/params.conf`

5. Set the Network Map configuration for a subzone (1 was taken from the response to the create-subzone command)
`./cenm netmap config set -s 1 -f config/networkmap.conf --zone-token`

6. Set the Signer configuration last, as it depends on the first two service's locations for it to be complete
./cenm signer config set -f config/signer.conf --zone-token

## Overview of available commands

You can use the CLI to:

* Update the password you use to access CENM services.
* Perform tasks in Identity manager.
* Access the Network Map.  
* Set up and switch between contexts - allowing you to perform tasks across multiple servers with minimum effort to switch between them.
* Manage zones.
* Perform tasks in signer services.

The main commands are:

`change-password`
Change your CENM password.

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


## Change your password

This command allows you to change the password you use to access your CENM services.

### Options
`-n, --new-password[=<newPassword>]`
New password

If present without value, the password can be entered interactively.

``-p, --password[=<password>]``
Current password

If present without value, the password can be entered interactively.

``-u, --username=<username>``
Username for password based authentication.

### Arguments
``<server>``
Url for the targeted CENM API Gateway - the FARM service.

### Example

[EXAMPLE HERE]  


## Contexts and servers

Your interaction with CENM services through the CLI is managed by the Front-end Application for Remote Management (FARM) service. This service handles security checks and HTTP translation during your session, and acts as an API gateway between the CLI and CENM.

When you log in to each session, you specify the full endpoint of the FARM service instance you are accessing. You do this using the argument '<server>' in the command line. This endpoint forms the **context** for your session.

Setting a context means that your session is not interrupted by any natural time-outs in your CENM service. It also means you can switch between servers, like staging and production servers, simply by switching from one context alias to another.

### Aliases for contexts

If you work on multiple services, or need to access the same service using multiple contexts, you can use the CLI to create **context aliases**. This means you can switch between sessions and back again by switching aliases.


## Log in to a CENM session

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

### Example

`./cenm.sh context login http://localhost:8081 -u jenny-editor -p password`

{{< Note >}}
If you leave the -p value blank, the CLI will ask you for your password in the next response. You can use this method if you do not wish your password to appear on your command line history.
{{< /Note >}}

## Identity manager commands

You can perform the following tasks using these Identity manager commands:

`config`
Contains commands for Identity-manager service config management.

`csr`
Certificate signing request management.

`crr`
Certificate revocation request management.

`crl`
Certificate revocation list.

`status`
Checks connectivity to the identity-manager service.

`plugins`
Displays configured approval plugins.

`cert-path`
Display certificate path for a legal name.

### Configure Identity Manager

You can use the CLI to:

### Retrieve the current Identity manager configuration

Use the command `get` to retrieve the current Identity manager configuration. You can specify the output type, and request a Zone token in place of the config file if required.

**Sample command**

`cenm identity-manager config get [--zone-token] [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command that overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty

Default value is pretty

`--zone-token`
Indicates that the zone token should be printed instead of the config, when using the 'pretty' output type..


### Update the current Identity manager's configuration.

To update the configuration of the Identity manager, you need to include a config file with the new settings. Then use the `set` command to update the Identity manager.

**Sample command**

`cenm identity-manager config set [--zone-token] [-c=<useContext>] -f=<configFile> [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command that overrides the current context set.

`-f, --config-file=<configFile>`
Configuration file.

`-o, <outputType>``
Specifies output format. Valid values are: json, pretty. Default value is pretty

`--zone-token`
Indicates that the zone token should be printed instead of the config, when using the 'pretty' output type..

### Update the identity manager's service address.
