---
date: '2020-05-28T17:40:25Z'
menu:
  cenm-1-5:
    identifier: cenm-1-5-management-console
    parent: cenm-1-5-tools-index
    weight: 1020
tags:
- CENM management console
title: CENM Management Console
---

# CENM management console

The CENM management console is a web interface that allows you to perform key CENM tasks using a visual UI.

You can use the CENM management console to perform key CENM tasks and access CENM services and network information. With the CENM management console, you can:

* Access the network map.
* Update Network Parameters.
* Review Identity Manager progress for Onboarding and Removing members.

{{< note >}}
Your ability to perform certain tasks using the CENM management console depends on your user permissions. Permissions for each CENM service can be allocated and managed by an administrator in the [User Admin tool](user-admin.md). You will not be able to self-allocate the required permissions - they must be granted by an administrator.
{{< /note >}}

To use the CENM management console, you must install it as a **plug-in** to your Gateway Service. Once you have installed the plug-in, anyone with the required permissions can access and use the management console from any web browser.

## Installation

### Requirements

- [Auth Service](auth-service.md) that has been set up with at least one user (ideally an admin user) and running.
- [Zone Service](zone-service.md) running.

### Install the CENM management console

The CENM management console is accessed via the [Gateway service](gateway-service.md). Once you have added the plugin binaries to the correct directory on the machine that hosts your Gateway Service, you can access the web service from any browser.

To install the

1. Download the latest Gateway Service binaries from [Artifactory](https://software.r3.com).
2. Download the CENM management console Gateway Plugin binaries from Artifactory.
3. Create a directory called `plugins` in the same directory as the Gateway Service `.jar` file (if you do not already have this directory for other plug-ins).
4. Copy the CENM Gateway Plugin `.jar` file to the `plugins` directory.
5. Configure the Gateway Service using the `auth { }` and `cenm { }` properties.
   Example configuration:
   ```
   auth {
        serverUrl = "https://auth-service:8081/"
        sslConfig = {
            trustStore = "/etc/corda/trust-stores/corda-ssl-trust-store.jks"
            trustStorePassword = "trustpass"
        }
        clientCredentials = {
            clientId = "farm1"
            clientSecret = "secret1"
        }
    }
    cenm {
        zoneHost: "zone-service"
        zonePort: 5063
        ssl = {
            keyStore = {
               keyPassword = "password"
             location = "/etc/corda/key-stores/farm-ssl-keys.jks"
               password = "password"
            }
            trustStore = {
               location = "/etc/corda/trust-stores/corda-ssl-trust-store.jks"
               password = "trustpass"
            }
           }
    }
    server {
        port = 8081
    }
   ```
6. Launch the Gateway Service.
7. Open your browser and use the Gateway Service's host and the `port` property from the configuration (`localhost:8081` in the example above).
8. The login page is displayed. Log in using the initial user credentials.
9. You can either open the **User Administration** page to manage users, groups, and roles (please note that this requires admin rights), or open the CENM management console to manage your CENM instance.

{{< note >}}
See the [CENM User Admin tool](user-admin.md) documentation for more information. This tool is accessed in the same way as the CENM management console.
{{< /note >}}

## User guide

### Access the CENM management console

The CENM management console is located in a directory within the machine that hosts your Gateway Service, followed by `/cenm`.

For example: http://10.230.41.12:8080/cenm

To access the CENM management console:

1. Navigate to the URL address for your CENM management console instance.

2. On the login screen, enter your user login credentials:

{{% figure zoom="/en/images/cenm-management-console-login-screen.png" alt="CENM management console login screen" %}}

3. Select **CENM Console**.

{{% figure zoom="/en/images/cenm-management-console-launcher.png" alt="CENM management console launcher screen" %}}

The CENM management console loads on the **Network Map** list screen.

{{% figure zoom="/en/images/cenm-management-console-network-map-list-screen.png" alt="CENM management console Network Map list screen" %}}

### Explore the Network Map Service

You can access network member details, filter information, and search using the Network Map Service screen.

### Check Identity Management Service progress

To access the Identity Manager Service, click **Identity Manager** in the top navigation area of the screen.

A list of requests and their status is shown.

#### Check onboarding and removal status

To check the status of members being onboarded into the network, click the **Onboarding** tab. You can see the status tag, and details of the request like the Request ID, and legal name of the prospective member.

To check the status of members being removed from the network, click the **Removal** tab. You can view the status tag for the removal progress, and details of the membership.

### Update services configuration files

You can access and edit the configuration files of these services:

* Identity Manager Service.
* Signing Service.
* Network Map Service.

### Update Network Parameters

You can view pending changes to the Network Parameters, and make new updates.

To edit the Network Parameters:

1. On the Network Parameters screen, click **Start Update Process**.

2. Give a name to the update in the **Name** field.

2. Use the calendar picker to schedule the time and date of the Flag Day - the period during which the network parameters will update.

3. Make the required changes in the **Basic Parameters** fields. Alternatively, select the **Code view** to make the changes in a command line within the console.

4. If required, add a Notary to the update.

5. Click **Set Parameters**.

    Now that the update has been scheduled, you can Advertise the update.

6. Once you have updated the parameters, scroll down and click the **Advertise Parameters Update**.

7. You can now see the nodes that have accepted the update, and those who are still pending.

    Once you have advertised the update, and the scheduled time has been reached, you can execute the flag day.

8. Scroll down and click **Execute Flag Day**.
