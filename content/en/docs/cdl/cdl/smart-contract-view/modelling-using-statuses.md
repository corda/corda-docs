---
title: Modelling with statuses
date: 2020-10-15T00:00:00+01:00
menu:
  cdl:
    parent: "cdl-smart-contract-view"
    identifier: "cdl-smart-contract-view-modelling-using-statuses"
    weight: 50

tags:
- cdl
- cordapp design language
- smart contract
- cordapp diagram
- statuses
---

# Modelling using Statuses

An underlying assumption of CDL is that the States in the Smart Contract can have different *statuses* and that in different statuses you need to define the different form that a transaction can or must take.

This is similar to a Finite State Machine in computer science. The classic example of which is a clothes washing machine that has two states, 'Full of water' and 'Empty'. The washing machine's Finite State Machine should have the constraint that the user can only execute the 'Open door' command when the washing machine is in the 'Empty' State. If it doesn't, somebody is going to end up with a very wet floor.

So statuses become a key driver of Smart Contract behaviour.

{{< note >}}
For simple Smart Contracts there may only be one, implicit status. The Smart Contract view works, there's just only one status box with all actions and constraints hanging of that one box.
{{< /note >}}
