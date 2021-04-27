---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-whitelisting-classes-with-the-corda-node
    parent: corda-os-4-8-flow-state-machines
    weight: 1230
tags:
- flow
- state
- machines
title: Whitelisting classes with the Corda node
---

## Whitelisting classes with the Corda node

For security reasons, we do not want Corda nodes to be able to just receive instances of any class on the classpath
via messaging, since this has been exploited in other Java application containers in the past.  Instead, we require
every class contained in messages to be whitelisted. Some classes are whitelisted by default (see `DefaultWhitelist`),
but others outside of that set need to be whitelisted either by using the annotation `@CordaSerializable` or via the
plugin framework.  See [Object serialization](serialization.md).  You can see above that the `SellerTradeInfo` has been annotated.
