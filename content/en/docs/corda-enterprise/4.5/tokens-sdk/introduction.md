---
date: '2020-05-10T12:00:00Z'
menu: tokens-sdk
tags:
- building
- against
- release
title: Introducing the Tokens SDK
---

# The Token SDK

The Token SDK provides you with the fastest and easiest way to create tokens that represent any kind of asset on your network. This asset can be anything you want it to be - conceptual, physical, valuable or not. You can create a token to represent something outside of the network, or something that only exists on the ledger - like a Corda-native digital currency.

With the SDK, you can define your token and its attributes, then add functionality to a CorDapp so the token can be **issued**, **moved**, and **redeemed** on a ledger.

## Upgrade from v 1.1 to 1.2

If you have developed a CorDapp that uses the Tokens SDK V1.1, you can upgrade to 1.2:

1. Change the V number (version number) in your CorDapp's relevant Gradle file from 1.1 to 1.2.

2. Remove all references to `selection` and `money` JARS. The functions of these JARS has been moved into `workflows` in V1.2.

3. Recompile your CorDapp.

4. Communicate the change to parties consuming your CorDapp accordingly, along with your recommended steps for upgrading.


## What's in the Token SDK

The Token SDK is contained in two JAR files which includes all the required dependencies for your CorDapp, including:

* **Contracts**, which contains the base token types, states and contracts needed to create a token, including token type definitions for fiat and digital currencies.
* **Workflows**, which contains the flows for issuing, moving, redeeming tokens, and selection workflows, which allow a party to select which source of fungible tokens they will use to pay with in a transaction.

As the **Contracts** JAR contains the ability to define and create tokens, and the **Workflows** JAR contains the flows required to use them, you must add both JARS to your CorDapp's folder in order to use the Token SDK.

## The anatomy of a token

You can create tokens in Corda to represent anything of value. This could be a representation of an asset that exists outside of your network, like diamonds, or US dollars, or it could represent something that only exists inside your network, like a new digital currency that is native to the ledger itself. In the case of a ledger-native digital currency, the token itself is the object of value - it *is* the asset.

Your token can represent both fungible and non-fungible assets. These assets can evolve (evolvable) over time or remain the same (non-evolvable):

* **Fungible tokens** are represented by the `FungibleToken` *class* and can be split and merged – just as the assets they represent, like money or stocks - can be split and merged.

* **Non-fungible** tokens are represented by the `NonFungibleTokens` *state*, and cannot be split and merged - just as the assets they represent, like physical diamonds or a house – cannot be split and merged.

* **Evolvable assets** change over time - not just in value, but in other ways, such as the condition of a car, or size of a house.

* **Non-evolvable assets** have no way of changing over time. While the FX markets may fluctuate, a US dollar bill does not change into a different state. It cannot evolve into a 1 Euro coin.

| Asset  |   Fungibility   | Evolvability | On / off ledger asset |
| :------------- | :------------- | :------------- | :------------- |
| US Dollar  | Fungible       | non-evolvable      | Off-ledger asset       |
| Ledger-native coin | Fungible  | non-evolvable | On-ledger asset  |
| Diamonds | Non-Fungible | Evolvable | Off-ledger asset |

## Create tokens using the Token SDK

When you know what kind of token you want to introduce into the network, you can start defining it. The requirements for each token depend on whether it is fungible, and whether it can evolve over time.  

Use the list below to understand what needs to be included in the token you want to create. 

### `Tokentype` - the units of a token

A `TokenType` defines the unit of your token.

To create a new `TokenType`, you must give it:

* An identifier, like USD.
* Fractional digits to define how much it can be broken down by. USD has two fractional digits because the smallest possible unit is 0.01 USD (a cent).

You can also give a `TokenType` an optional custom identifier, which is then fixed to that customised `TokenType` and *cannot change* over time. If your tokens represent wines, and you create a custom `WineColor` identifier, a **white wine** token cannot turn into a **red wine** token.

### `EvolvableTokenType` - a token type that can change over time

An `EvolvableTokenType` has properties that can change over time. This is represented in Corda by a `LinearState`. To create and issue an `EvolvableTokenType`, you must:

* Define the `TokenType` - the unit and decimal fractions.
* Define the evolvable attributes that can change over time.
* Identify at least one signatory service that can approve the newly evolved state. This is called a `Maintainer`.

In the example below, the evolvable token is for a diamond. You can see the evolvable attributes, which are the attributes included in a grading report for a diamond.

**Kotlin:**
```kotlin
/** Creating an evolveable TokenType */
@BelongsToContract(DiamondGradingReportContract::class)
data class DiamondGradingReport(
        val caratWeight: BigDecimal,
        val color: ColorScale,
        val clarity: ClarityScale,
        val cut: CutScale,
        val assessor: Party,
        val requester: Party,
        override val linearId: UniqueIdentifier = UniqueIdentifier()
) : EvolvableTokenType() {
        override val maintainers: List<Party>
            get() = listOf()             
        override val fractionDigits: Int
            get() = 2
}

val diamond = DiamondGradingReport("1.0", DiamondGradingReport.ColorScale.A, DiamondGradingReport.ClarityScale.A, DiamondGradingReport.CutScale.A, gic.legalIdentity(), denise.legalIdentity())
```
**Java:**
```java
public final class DiamondGradingReport extends EvolvableTokenType {
    private final BigDecimal caratWeight;
    private final ColorScale color;
    private final ClarityScale clarity;
    private final CutScale cut;
    private final Party assessor;
    private final Party requester;
    private final UniqueIdentifier linearId;

    @NotNull
    public List getMaintainers() {
        return CollectionsKt.emptyList();
    }

    public int getFractionDigits() {
        return 2;
    }

    @NotNull
    public final BigDecimal getCaratWeight() {
        return this.caratWeight;
    }

    @NotNull
    public final ColorScale getColor() {
        return this.color;
    }

    @NotNull
    public final ClarityScale getClarity() {
        return this.clarity;
    }

    @NotNull
    public final CutScale getCut() {
        return this.cut;
    }

    @NotNull
    public final Party getAssessor() {
        return this.assessor;
    }

    @NotNull
    public final Party getRequester() {
        return this.requester;
    }

    @NotNull
    public UniqueIdentifier getLinearId() {
        return this.linearId;
    }

    public DiamondGradingReport(
            BigDecimal caratWeight,
            ColorScale color,
            ClarityScale clarity,
            CutScale cut,
            Party assessor,
            Party requester,
            UniqueIdentifier linearId) {
        super();
        this.caratWeight = caratWeight;
        this.color = color;
        this.clarity = clarity;
        this.cut = cut;
        this.assessor = assessor;
        this.requester = requester;
        this.linearId = linearId;
    }
}

DiamondGradingReport diamond = new DiamondGradingReport("1.0", DiamondGradingReport.ColorScale.A, DiamondGradingReport.ClarityScale.A, DiamondGradingReport.CutScale.A, gic.getLegalIdentity(), denise.getLegalIdentity())
```

### `FungibleToken` class

A fungible token is represented by the `FungibleToken` class.

To create and issue a fungible token, you must ensure it has:

* A `TokenType` - which you can define manually, or use define using a specified fiat or digital currency.
* A `Holder` so the person holding the token is clear.
* An `Amount` to show how many units the token is worth.
* An `IssuedTokenType` which defines who issued the token. A fungible token can only be exchanged for fungible tokens with the same issuer.

Fungible tokens can be split using a flow initiated by the **Move** command. This allows a party to send some of the value of a single token to more than one recipient. Just like you can split a 10 USD bill between two people (as long as someone has change).

In the below example, Alice issues a token representing a BitCoin. This token is generated using the Token SDK's built-in `money` library.

**Kotlin:**
```kotlin
                    val fungibleToken = 1 of DigitalCurrency.getInstance("BTC") issuedBy aliceParty heldBy aliceParty
```

**Java:**

```java
FungibleToken fungibleToken = new FungibleTokenBuilder()
        .withAmount(1)
        .ofTokenType(DigitalCurrency.getInstance("BTC"))
        .issuedBy(aliceParty)
        .heldBy(aliceParty)
        .buildFungibleToken();
```

### `NonFungilbeToken` class

A non-fungible token cannot be split and merged, and represents a unique asset. To create a `NonFungibleToken` you must:

* Define the `TokenType` - the name of the unit of your token. As the token cannot be split, the digital fraction value can only be 1. [CHECK THIS]
* Define the first `Holder` of the token type. The holder of the token must be approved by a maintainer each time the token moves from party to party.
* Define at least one `Maintainer` with the power to authorise any changes to the token. This includes every change of `Holder` and changes of attributes if it is also an `EvolvableTokenType`.
* Define any custom attributes of the token.
* Define the issuer of the token using the `IssuedTokenType`.

In this example, Alice issues a unit of digital currency that cannot be split into any smaller pieces, and does not have attributes that evolve over time.

**Kotlin:**

```kotlin
val nonFungibleToken = 1 of DigitalCurrency.getInstance("BTC") heldBy aliceParty
```
**Java:**

```java
IssuedTokenType issuedRubles = new IssuedTokenType(ALICE.getParty(), DigitalCurrency.getInstance("BTC"));
new NonFungibleToken(issuedRubles, ALICE.getParty(), new UniqueIdentifier());
```

## What you can do with the Token SDK  

Once you have established what type of token you want to create, you can use the Token SDK to perform the following key tasks:

* **Define** your token. Using the readymade utilities contained in the contract JAR, you can define all the required attributes and custom attributes of your tokens.

* **Issue** tokens onto your ledger so they can be used as part of a transaction.

* **Move** the token from at least one party to at least one other party in a transaction.

    * **Select** which specific tokens are to be used to settle a transaction. This applies when a party has more than one 'wallet' or 'pot' of tokens that can be used to settle a transaction.

* **Redeem** and remove the token from the ledger, for example when a party finally takes ownership of their real-life diamond and the token it represents can no longer be used.

## Install the Token SDK

Depending on your plan for issuing tokens onto your network - whether you are ready to deploy tokens in an enterprise scenario or experimenting - there are different ways to install the Tokens SDK:

* [Use the kotlin token SDK template](###get-started-using-the-kotlin-token-sdk-template) template to get started and issue tokens locally. This is a great way to learn about the Token SDK through practical application, but may not be suitable for your enterprise deployment.
* [Clone the latest repo](###build-token-sdk-against-corda-release-branch).
* [Install the binaries directly to your local maven repository](###add-token-sdk-dependencies-to-an-existing-cordapp).

For each of the these steps, follow the instructions below.

### Get started using the Kotlin Token SDK template

To get started quickly with the Token SDK, use the **Tokens template** which is a branch on the kotlin version of the **CorDapp template**.

To use the tokens template:

1. Use the following commands to clone the Kotlin CorDapp template, and checkout the token-template branch:

```
    git clone http://github.com/corda/cordapp-template-kotlin
    cd cordapp-template-kotlin
    git checkout token-template
```

2. Open the token-template branch of the repo with your preferred coding tool. The recommended tool is IntelliJ because it works well with Gradle.

You now have a template repo with the token SDK dependencies
included and some example code to illustrate how to use the token SDK.

**To test your token SDK set up locally:**

1. Use command line to create three nodes:

    .```
    /gradlew clean deployNodes
    ./build/nodes/runnodes
    ```

2. Issue some currency tokens from `PartyA` to `PartyB` from Party A's
shell with the following command:

    ```
    start ExampleFlowWithFixedToken currency: GBP, amount: 100, recipient: PartyB
    ```

See the token template code [here](https://github.com/corda/cordapp-template-kotlin/tree/token-template)
for more information.

### Build Token SDK against Corda release branch

Often, in order to use the latest `token-sdk` master you will need to build against a specific Corda release branch until
the required changes make it into a Corda release. At the time of writing tokens `1.1-SNAPSHOT` requires Corda **THIS IS OUT OF DATE - PLEASE PROVIDE CORRECT INFORMATION**
`4.3-SNAPSHOT`. You can build this branch with the following commands:

    ```
    git clone https://github.com/corda/corda
    git fetch
    git checkout origin release/os/4.3
    ```

Then run a `./gradlew clean install` from the root directory.

### Add Token SDK dependencies to an existing CorDapp

1. Add a variable for the tokens release group and the version you
wish to use. Set the Corda version to the one you have installed locally:

```
    buildscript {
        ext {
            tokens_release_version = '1.1'
            tokens_release_group = 'com.r3.corda.lib.tokens'
        }
    }
```

2.  Add the tokens development artifactory repository to the
list of repositories for your project:

```
    repositories {
        maven { url 'https://ci-artifactory.corda.r3cev.com/artifactory/corda-lib' }
        maven { url 'https://ci-artifactory.corda.r3cev.com/artifactory/corda-lib-dev' }
    }
```

3. Add the `token-sdk` dependencies to the `dependencies` block
in each module of your CorDapp. For contract modules add:

    cordaCompile "$tokens_release_group:tokens-contracts:$tokens_release_version"

4. In your workflow `build.gradle` add:

    cordaCompile "$tokens_release_group:tokens-workflows:$tokens_release_version"

5. To use the `deployNodes` task, add the following dependencies to your root `build.gradle` file:

    cordapp "$tokens_release_group:tokens-contracts:$tokens_release_version"
    cordapp "$tokens_release_group:tokens-workflows:$tokens_release_version"

6. Add the following to the `deployNodes` task with the following syntax:

    nodeDefaults {
        projectCordapp {
            deploy = false
        }
        cordapp("$tokens_release_group:tokens-contracts:$tokens_release_version")
        cordapp("$tokens_release_group:tokens-workflows:$tokens_release_version")
    }

### Install the token SDK binaries

You can build the `token-sdk` from source, by publishing the binaries to your local maven repository. In a command line window, enter:

```
    git clone http://github.com/corda/token-sdk
    cd token-sdk
    ./gradlew clean install
```

The dependencies are now added to your CorDapp, allowing you to write the code to create your tokens.
