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


### Quickstart - set up a new network with the CLI

You must set up any new network in a specific order, as some services rely on information that must be in place before they can be created.
Most importantly, you must set the **Signing service** configuration last.

{{< note >}}
The commands and options in these steps are explored in more detail throughout this document.
{{< /note >}}

To set up a new network with the CLI:

1. Login:

    `./cenm context login http://localhost:8081 -u jenny-editor -p password`

2. Set the Identity Manager's external address. This must be the address that external parties will use to connect with the Identity Manager:

    `./cenm identity-manager config set-address -a=identity-manager:5053`

3. Set the Identity Manager config:

    `./cenm identity-manager config set -f config/identitymanager.conf --zone-token`

4. Create a new subzone:

    `./cenm zone create-subzone --config-file=config/networkmap.conf --label=Subzone --label-color="#000000" --network-map-address=networkmap:8080 --network-parameters=config/params.conf`

5. Set the Network Map configuration for a subzone (1 was taken from the response to the create-subzone command):

    `./cenm netmap config set -s 1 -f config/networkmap.conf --zone-token`

6. Set the Signer configuration last, as it depends on the first two service's locations for it to be complete:

    `./cenm signer config set -f config/signer.conf --zone-token`


### Get Help in the CLI

To access help and get the version number, use the following command structure:

`cenm [-hV] [COMMAND]`

**Options**

`h,--help`
Get a list of available commands and descriptions.

`v, --version`
See the current version of the CLI you are using.

### Overview of available commands

You can use the CLI to:

* Update the password you use to access CENM services.
* Set up and switch between contexts - allowing you to perform tasks across multiple servers with minimum effort to switch between them.
* Perform tasks in Identity manager.
* Access the Network Map.  
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


## Contexts and servers

Your interaction with CENM services through the CLI is managed by the Front-end Application for Remote Management (FARM) service. This service handles security checks and HTTP translation during your session, and acts as an API gateway between the CLI and CENM.

When you log in to each session, you specify the full endpoint of the FARM service instance you are accessing. You do this using the argument '<server>' in the command line. This endpoint forms the **context** for your session.

Setting a context means that your session is not interrupted by any natural time-outs in your CENM service. It also means you can switch between servers, like staging and production servers, simply by switching from one context alias to another.

In most commands in the CLI, you can specify the context you want to use with the command option:

`-c, --use-context=<useContext>`

### Aliases for contexts

If you work on multiple services, or need to access the same service using multiple contexts, you can use the CLI to create **context aliases**. This means you can switch between sessions and back again by switching aliases.


## Change your password

This command allows you to change the password you use to access your CENM services.

{{< attention >}}

If you have been allocated a new password by an administrator using the [User admin tool](user-admin.md), you must change it to something only you know. You must do this before you continue to use CENM services.

{{< /attention >}}

**Sample command structure**

`cenm change-password -n[=<newPassword>] -p[=<password>] -u=<username> <server>`

**Options**

`-n, --new-password[=<newPassword>]`
New password. Leave `-p` without a value to enter your password on the next line. This prevents your password being visible in the command line history.

``-p, --password[=<password>]``
Current password. Leave `-p` without a value to enter your password on the next line. This prevents your password being visible in the command line history.

``-u, --username=<username>``
Username for password based authentication.

**Arguments**

``<server>``
Url for the targeted CENM API Gateway - the FARM service.


## Log in to a CENM session

When you log in to a CENM session using the CLI, you do so by setting the required **Context** for your session. This ensures you are able to stay logged in to the correct server address for the duration of your work.

For example, once you have accessed the correct server for the **Signing service**, making this address the fixed context means that you no longer need to specify the server address for your subsequent commands.

#### Options

**-a, --alias=<alias>**
Optionally sets an alias for this session.

This can be used for setting the 'current context' and logging out later on.

**-p, --password[=<password>]**
Password for password based authentication. Leave `-p` without a value to enter your password on the next line. This prevents your password being visible in the command line history.

**-s, --set-active-context**
Sets the active context to the configured url.

**-u, --username=<username>**
Username for password based authentication.

#### Arguments
**<server>**
Url for the targeted CENM API Gateway (FARM).

### Example

`./cenm.sh context login http://localhost:8081 -u jenny-editor -p password`

{{< note >}}
If you leave the -p value blank, the CLI will ask you for your password in the next response. You can use this method if you do not wish your password to appear on your command line history.
{{< /note >}}

## Identity manager commands

You can perform the following tasks:

* Configure the identity manager service.
* Manage certificate signing requests.
* Display the certificate path for a legal name.
* Manage certificate revocation requests.
* Get certificate revocation list and related details.
* Check connectivity to the identity-manager service.
* Display configured approval plugins.


### Set external address and configure Identity Manager

You can use the CLI to configure the following elements of the Identity manager service for the context you are working on:

* Update the Identity manager's service address.
* Retrieve the Identity manager configuration.
* Update the Identity manager's configuration.


### Update the Identity manager's service address.

To update the service address of the Identity manager, use the `set-address` command. Changing the address of the Identity manager service also means you can update the Context of the current session to match the new address.

When entering the address, you must enter `<host>-<port>`. The `port` value must be the same as the value for `adminListener` in the services configuration file. **[PLEASE CHECK THIS]**

**Sample command structure**

`cenm identity-manager config set-address -a=<address> [-c=<useContext>] [-o=<outputType>]`

**Options**

`-a, --address=<address>`
The address of the service, in the format `<host>:<port>`. The value for `port` must match the value for `adminListener` in the service configuration file.

`-c, --use-context=<useContext>`
Sets the context of the command to override the current context you are using.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`

### Retrieve the current Identity manager configuration

Use the command `get` to retrieve the current Identity manager configuration. You can specify the output type, and request a Zone token in place of the config file if required.

**Sample command structure**

`cenm identity-manager config get [--zone-token] [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command that overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty

Default value is `pretty`

`--zone-token`
Indicates that the zone token should be printed instead of the config, when using the 'pretty' output type.


### Update the Identity manager's configuration

To update the configuration of the Identity manager, you need to include a config file with the new settings. Then use the `set` command to update the Identity manager.

**Sample command structure**

`cenm identity-manager config set [--zone-token] [-c=<useContext>] -f=<configFile> [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command. This overrides the current context set.

`-f, --config-file=<configFile>`
Configuration file.

`-o, <outputType>``
Specifies output format. Valid values are: json, pretty. Default value is pretty

`--zone-token`
Indicates that the zone token should be printed instead of the config, when using the 'pretty' output type..


### Identity manager - Certificate signing request Management

You can use the CLI to see the **approved** and **pending** certificate signing requests for the Identity manager service.

To see the requests for a different context to the one you are on, you need to specify the context you require.

{{< note >}}

Requesting certificate signing requests on a different context may trigger a request for login details. Make sure you have authorisation to access this context before entering the command.

{{< /note >}}

### Get the approved certificate signing requests

**Sample command structure**

`cenm identity-manager csr approved [-c=<useContext>] [-o=<outputType>]`

**Options**

``-c, --use-context=<useContext>``
Sets the context of the command - overrides the current context set.

``-o, <outputType>``
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

 ### Get the pending certificate signing requests

 **Sample command structure**

 `cenm identity-manager csr pending [-c=<useContext>] [-o=<outputType>]`

 **Options**

 `-c, --use-context=<useContext>`
 Sets the context of the command - overrides the current context set.

 ``-o, <outputType>``
 Specifies output format. Valid values are: json, pretty. Default value is `pretty`.


 ## Identity manager - certificate revocation list Management

 Identity certificates allow parties to access the network managed by CENM. Using the CLI, you can:

 * Submit a certificate revocation request.
 * Get the list of **approved** certificate revocation requests.
 * Get the list of **pending** certificate revocation requests.

 You can use the CLI to see the **approved** and **pending** certificate revocation requests for the Identity manager service.

 To see the requests for a different context to the one you are on, you need to specify the context you require.

 {{< note >}}

 Requesting certificate signing requests on a different context may trigger a request for login details. Make sure you have authorisation to access this context before entering the command.

 {{< /note >}}

When making a request to revoke a certificate, you must provide *only one* of the following certificate identifiers:

* Request ID of the certificate being revoked.
* Legal name of the party whose certificate is being revoked.
* The serial ID of the certificate being revoked.

### Request revocation of a certificate

To request that a certificate is revoked, you must provide a reason for the revocation, and one form of certificate identifier.

**Sample command structure**

`cenm identity-manager crr submit (-n=<legalName> | -i=<requestId> | -s=<serial>) [-c=<useContext>] -e=<reporter> [-o=<outputType>] -r=<reason>`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command that overrides the current context set.

`-e, --reporter=<reporter>`
Specifies the reporter who requested the certificate revocation.

`-o, <outputType>``
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

``-r, --reason=<reason>``
Reason for the revocation. Possible values:
* `UNSPECIFIED`
* `KEY_COMPROMISE`
* `CA_COMPROMISE`
* `AFFILIATION_CHANGED`
* `SUPERSEDED`
* `CESSATION_OF_OPERATION`
* `CERTIFICATE_HOLD`
* `UNUSED`
* `REMOVE_FROM_CRL`
* `PRIVILEGE_WITHDRAWN`
* `AA_COMPROMISE`

**Certificate identifiers**

Only use one certificate identifier per request.

`-i, --request-id=<requestId>`
Submits a CRR using the request id. Can only be present if serial and legal name not set

`-n, --legal-name=<legalName>`
Submits a CRR using the legal name. Can only be present if request id and serial not set

`-s, --serial=<serial>`
Submits a CRR using the certificate serial.

Can only be present if request id and legal name not set

### Get list of approved certificate revocation requests

**Sample command structure**

cenm identity-manager crr approved [-c=<useContext>] [-o=<outputType>]

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### Get list of pending certificate revocation requests

**Sample command structure**

cenm identity-manager crr pending [-c=<useContext>] [-o=<outputType>]

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

``-o, <outputType>``
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### See the certificate path for a legal name

You can check the location path of an identity manager certificate attached to any legal name in the network.

**Sample command structure**

`cenm identity-manager cert-path [-c=<useContext>] -n=<legalEntityName> [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-n, --legal-entity-name=<legalEntityName>`
The legal entity name of the certificate.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### Certificate revocation list management

You can use the CLI to access:

* The certificate revocation list.
* List of certificate issuers.

Use this service for a comprehensive list of revoked certificates and their associated details. For lists of approved or pending revocation requests, use the [certificate signing request management commands](##Identity-manager---Certificate-signing-request-Management).

### Get the certificate revocation list

**Sample command structure**

`cenm identity-manager crl get [-c=<useContext>] [-i=<issuer>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context you have set.

`-i, --issuer=<issuer>`
Issuer of the CRL to display.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### Get list of issuers of the certificate revocation list

**Sample command structure**

`cenm identity-manager crl issuers [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

``-o, <outputType>``
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### Identity manager service status and available plugins

You can use the CLI to check your connection to the Identity Manager service, and see available plugins to the service.

### Check Identity manager service status

**Sample command structure**

`cenm identity-manager status [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

``-o, <outputType>``
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### Check available plugins for the Identity manager service

**Sample command structure**

`cenm identity-manager plugins [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

``-o, <outputType>``
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

## Zone manager commands

You can use the CLI to perform the following tasks related to zone management:

`status`
To check your connectivity to the zone service.

`create-subzone`
To create a subzone.

`get-subzones`
To list all subzones.

`addresses`
To list all service addresses.

### Check connectivity to the zone service

**Sample command structure**

`cenm zone status [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### Create a subzone

To create a subzone using the CLI, you need to provide:

* A config file to configure the settings for the new subzone.
* The network map address for the new subzone.
* The parameters for the network.

**Sample command structure**

`cenm zone create-subzone [--zone-token] [-c=<useContext>] --config-file=<networkMapConfigFile> --label=<label> --label-color=<labelColor> --network-map-address=<networkMapAddress> --network-parameters=<networkParameters> [-o=<outputType>]`

**Options**

`--zone-token`
Indicates that the zone token should be printed instead of the config, when using the 'pretty' output type.

`--config-file=<networkMapConfigFile>`
Network map configuration file.

``--label=<label>``
Friendly name of the subzone.

`--label-color=<labelColor>`
The label colour for the subzone. Must be in hex format, like #FFFFFF.

`--network-map-address=<networkMapAddress>`
Sets the address of the network map service. Must be in a format of `<hostname>:<port>`
The port should be the same as the one set for the adminListener in the network-map config.

`--network-parameters=<networkParameters>`
Initial network parameters.

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### Get a list of existing subzones

You can use the CLI to get a list of existing subzones and their basic details.

**Sample command structure**

`cenm zone get-subzones [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### Get a list of all service addresses in a subzone

You can find the addresses of all the services on a specified subzone. If you only have access to one subzone, you do not need to specify the subzone option in your command.

**Sample command structure**

`cenm zone addresses [-c=<useContext>] [-o=<outputType>] [-s=<subzoneId>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

`-s, --subzone-id=<subzoneId>`
Sets which subzone to operate on. If you are operating on just one subzone you can leave this blank and still get the list of addresses.


## Signer service

You can use the CLI to perform the following tasks in the signer service:

* Sign Identity manager certificates.
* See the list of pending certificate signing requests.
* Get a full list of unsigned certificate revocation requests.
* See pending Identity manager certificate revocation requests.
* Sign certificate revocation requests.
* Get a list of unsigned network parameters.
* Sign network parameters.
* Get subzone material detailing parameters of a network.
* See unsigned network map data.
* Sign network map.
* Set the signer service address.
* Get the signer service configuration details.
* Configure the signer service.
* Check your connectivity to the signer service.
* List all signers currently configured.
* Get zone material relating to the signer service.

### Sign an Identity manager certificate

When you sign Identity manager certficate requests using the CLI, you  need to include the ID of the request you are signing.

**Sample command structure**

`cenm signer csr sign [-c=<useContext>] [-o=<outputType>] REQUEST_ID...`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

**Arguments**

`REQUEST_ID…​`
The ID of the request you wish to sign.

### See a list of outstanding certificate signing requests

**Sample command structure**

`cenm signer csr list [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### Sign an Identity manager certificate revocation request

When using the CLI to sign a certificate revocation request, you have the option to update the list of revoked certificates. If you keep a list, you should always use this option to ensure your list remains up to date.

**Sample command structure**

`cenm signer crl sign [-c=<useContext>] [-h=<crlHash>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-h, --crl-hash=<crlHash>`
Hash of the CRL to be appended or empty if non exists.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### Get a list of certificate revocation requests

**Sample command structure**

`cenm signer crl get [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### See pending Identity manager certificate revocation requests

**Sample command structure**

`cenm signer crl crrs [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### Sign network parameters

**Sample command structure**

`cenm signer netmap netparams sign [-c=<useContext>] -h=<hash> [-o=<outputType>] [-s=<subzoneId>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-h, --crl-hash=<crlHash>`
Hash of the network parameters to be signed.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

`-s, --subzone-id=<subzoneId>`
Sets which subzone to operate on. If you are operating on just one subzone you can leave this blank and still get the list of addresses.

### Get a list of unsigned network parameters

**Sample command structure**

`cenm signer netmap netparams unsigned [-c=<useContext>] [-o=<outputType>] [-s=<subzoneId>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

`-s, --subzone-id=<subzoneId>`
Sets which subzone to operate on. If you are operating on just one subzone you can leave this blank and still get the list of addresses.

### Sign a Network map

**Sample command structure**

`cenm signer netmap sign [-c=<useContext>] -h=<hash> [-o=<outputType>] [-s=<subzoneId>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-h, --crl-hash=<crlHash>`
Hash of the Network map to be signed.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

`-s, --subzone-id=<subzoneId>`
Sets which subzone to operate on. If you are operating on just one subzone you can leave this blank and still get the list of addresses.

### Get subzone material for a Network map

**Sample command structure**

`cenm signer netmap material [-c=<useContext>] [-o=<outputType>] [-s=<subzoneId>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

`-s, --subzone-id=<subzoneId>`
Sets which subzone to operate on. If you are operating on just one subzone you can leave this blank and still get the list of addresses.

### See unsigned network map data

**Sample command structure**

`cenm signer netmap unsigned [--node-infos] [-c=<useContext>] [-o=<outputType>] [-s=<subzoneId>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`--node-infos`
Allows you to print a list of node info from the network map.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

`-s, --subzone-id=<subzoneId>`
Sets which subzone to operate on. If you are operating on just one subzone you can leave this blank and still get the list of addresses.

### Configure the signer service

To configure the signer service, you must include a configuration file with the correct configuration data.

**Sample command structure**

`cenm signer config set [--zone-token] [-c=<useContext>] -f=<configFile> [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-f, --config-file=<configFile>`
Configuration file.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

`--zone-token`
Indicates that the zone token should be printed instead of the config, when using the `pretty` output type.

### Set the address of the signer service

**Sample command structure**

`cenm signer config set-address -a=<address> [-c=<useContext>] [-o=<outputType>]`

**Options**

`-a, --address=<address>`
The address of the service, in the format `<host>:<port>`. The value for `port` must match the value for `adminListener` in the service configuration file.

`-c, --use-context=<useContext>`
Sets the context of the command to override the current context you are using.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### See the signer service configuration

**Sample command structure**

`cenm signer config get [--zone-token] [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

`--zone-token`
Indicates that the zone token should be printed instead of the config, when using the `pretty` output type.

### Check the connection status of the signer service

**Sample command structure**

`cenm signer status [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### See a list of configured signers

**Sample command structure**

`cenm signer list [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

### Get zone material for the signing service

**Sample command structure**

`cenm signer zone-material [-c=<useContext>] [-o=<outputType>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

## Network parameters and Network map service

You can use the CLI to perform the following tasks in network parameters and network map services:

* Get network parameters.
* Update network parameters.
* Get the current network map configuration.
* Get the label data for a subzone.
* Update the configuation of a Network map.
* Set the address of a Network map.
* Update the labels for a Network map.
* Check the connection status of the Network map service.
* Get the current Network map data.
* See a list of available node information.
* Upload new node information to a Network map.

### Get network parameters

**Sample command structure**

`cenm netmap netparams get [-c=<useContext>] [-o=<outputType>] [-s=<subzoneId>]`

**Options**

`-c, --use-context=<useContext>`
Sets the context of the command - overrides the current context set.

`-o, <outputType>`
Specifies output format. Valid values are: json, pretty. Default value is `pretty`.

`-s, --subzone-id=<subzoneId>`
Sets which subzone to operate on. If you are operating on just one subzone you can leave this blank and still get the list of addresses.
