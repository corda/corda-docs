---
aliases:
- /head/flow-state-machines.html
- /HEAD/flow-state-machines.html
- /flow-state-machines.html
date: '2020-04-07T12:00:00Z'
menu:
  corda-os-4-8:
    identifier: corda-os-4-8-future-features
    parent: corda-os-4-8-flow-state-machines
    weight: 1300
tags:
- flow
- state
- machines
title: Future features
---


## Future features

The flow framework is a key part of the platform and will be extended in major ways in future. Here are some of
the features we have planned:


* Exception management, with a “flow hospital” tool to manually provide solutions to unavoidable
problems (for example, the other side doesn’t know about the trade).
* Being able to interact with people, either via some sort of external ticketing system, or email, or a custom UI.
For example to implement human transaction authorisations.
* A standard library of flows that can be easily sub-classed by local developers in order to integrate internal
reporting logic, or anything else that might be required as part of a communications lifecycle.
