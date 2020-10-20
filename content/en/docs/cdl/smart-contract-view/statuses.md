---
title: Statuses
date: 2020-10-15T00:00:00+01:00
menu:
  cordapp-design-language:
    parent: cdl-smart-contract-view
    identifier: cdl-smart-contract-view-statuses
    weight: 80

tags:
- cdl
- cordapp design language
- smart contract
- cordapp diagram
- statuses
---

# Statuses

Once we have defined the state, we need to show the different statuses that the state can be in. We do this by having a copy of the State for each status.

{{< figure zoom="../resources/cdl-agreement-smart-contract-statuses.png" width="1000" title="Click to zoom image in new tab/window" >}}

The properties shown in each status box may differ. This allows the designer to highlight the properties which are salient for that status even though they are actually a view of the same underlying class which must implement the union of all properties on the diagram.

In this example the participants remain consistent in all statues but this will not always be the case.


Note: to prevent an explosion of complexity, CDL mandates the following rules:
- We define the Primary state type as the state type in the Smart Contract which has a status field.
- There can only be one Primary state type per Smart Contract, although there can be multiple Smart Contracts operating and interacting in a single transaction each of which have their own Primary state type.
- Other state types in this Smart Contract cannot have a status field.
- A transaction's inputs can only contain primary states with a single status.
- A transaction's outputs can only contain primary states with a single status, although this can be different from the input status.

(Don't worry too much about these rules to start with, you won't hit the level of complexity where they come in to play yet. They are designed to avoid statuses branching and taking parallel paths through the Smart Contract allowed paths, e.g. a transaction with an input state in the PROPOSED status should not be allowed to have two output states one with REJECTED and one with AGREED statuses.)
