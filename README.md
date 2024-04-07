# Sei Token

This project demonstrates Sei - an ERC20 token with some extensible features. Thoses features help token works more efficiently in the trending day of airdrop. Those features include:
## Whitelist faucet
This feature allow the admin of the contract to whitelist addresses that can mint token. The admin can also set the amount of tokens that can be minted by the whitelisted addresses. 

We can combine this feature with some backend check to prevent spamming users.

## Multiple recipients
This feature allow the user can send tokens to multiple recipients in one transaction. This feature is useful when the user want to send tokens to airdrop to many addresses.

# Running tasks
Try running some of the following tasks:

## Test
```shell
npx hardhat test
```
or 
```shell
REPORT_GAS=true npx hardhat test

```

## Build
```shell
npx hardhat compile

```

## Deploy
```shell
npx hardhat ignition deploy ./ignition/modules/Sei.ts
```
