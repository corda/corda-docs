Project Planner Documentation: SME - Solutions Engineering
Intro - Are you writing a CorDapp yourself? If you aren't, you want access to BNO test environment and own production
sizing requirements. If you are writing the CorDapp you will need to consider the following: Development requirements,
operating system compatibility. VMs for test networks. UAT environment, QA environment, production environment.

Also, you must consider whether cloud or on-prem. - kubernetes? ansible? terraform?

Also, are you hosting nodes on behalf of others.

Everyone - Must consider DB requirements. For devs: h2 or postgres. For QA: real DB. For OS: Postgres. For Ent: Oracle
(deets), SQLserver, Postgres. Pre-prod UAT and Prod all the same.

Identify if you need an HSM. Production probably should be. Therefore, UAT should probably be on the same, or at least a virtual facsimile.

Sizing for VMs and containers - Minimum dev: 2 core, 2GB memory per node. Minimum for testing + prod: 4 core 4GB memory.
 Sized under appropriate load. External shared Artemis and External Corda Firewall - 2 VMs for artemis and 4 VMs for
 Firewall (two bridge, two for DMZ float for HA).

Firewall access required by external peers, ID manager, network map. Consider adding a load balancer in front of HA float.
 Consider proxy for web access to the network map and a SOCKS proxy for bridge access to the peers according to customer security policy.

In test environments you'll need a network map, doorman, and notary (CENM core services).

This is probably 30 machines so far.

Diagram for bill of materials so far. Estimate bandwidth and storage costs. Dependent on the CorDapp, but we can give
some basic numbers. Size of transactions in database, and size and number of messages in an operational flows, and number
of operational flows in one hour. Multiply for total cost and bandwidth.

Recommend a VM running a DB rather than a native cloud database.

We are very WRITE heavy on the database.


* = doc content
- = new doc

- Planning a Corda Deployment
    * What is your role?
        * CorDapp developer
        * Business Network Operators
        * Joining an existing network
    * What is your deployment strategy?
        * Cloud
        * On-prem
- CorDapp development
    * CorDapp development requirements
        * Operating system reqs
        * Machine reqs
    * Testing Environment requirements
- Business network members
    * Access to testing environments
    * Production sizing requirements
        * On-prem
        * Cloud
- Business network operators
    * If you are developing CorDapps as well, go read that
    * UAT Environment
    * QA Environment
    * Production environment
    * Security (HSM)

