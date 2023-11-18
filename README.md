# NFT DINO

## Description:
 
NFT Dino is a DAO platform where one can stake his DINO Token(NFT) to earn passive income in form of Fossil Tokens(ERC 20). This platform provides staking of NFT's from minimum 10 minutes to maximum of 365 days and accordingly rewards are distributed.
One can stake multiple NFT's at a time in the platform and can be unstaked after staking time period is over.
And rewards can be claimed just after the staking.
Reward distribution occurs once in every 24 hours by the admin.

### Important Points :

- Only DINO Token (NFT) can be staked.
- Fossil Tokens(ERC 20) are the reward tokens.
- Unstaking is possible after lock up period ends.
- Minimum staking period is 10 minutes and maximum 365 days.
- Claiming of rewards is allowed just after the staking & admin has distributed rewards.

### Techologies Used:

- Hardhat
- Solidity

### List of Libraries/Framework used:

- Mocha
- Chai
- Ethers
- Openzepplin

### Directory layout
       
├── contracts                    
├── docs                    
├── scripts                   
├── test             
└── README.md

### How to install and run :

- Run `npm install` to install all dependencies

- Run `npx hardhat compile` to compile all the contracts

- Run `npx hardhat run scripts/deploy-script.js` to deploy all the contracts

### Run Test Cases :

- Run `npx hardhat test` to execute all the testcases of the contracts

### Contracts

| S No. |    Contract Name       |               Rinkeby Testnet Address              |
|-------|------------------------|----------------------------------------------------|
|   1   |     FossilToken        |     0xAb850e50dc92EF5b0963DfbBDbA60DF3f7589EC4     |
|   2   |    UtilityManager      |     0x70e03045C3f38cCc5317F96DD1661FC10C6e4CC7     |
|   3   |      DinoToken         |     0x4843F4764a0af800bBe3730068D7EACab37E1458     |
|   4   |       DinoPool         |     0x6f630FaFB6f53D15ee2069870fFB04A186F637aB     |
|   5   | LiquidityMiningManager |     0x3AaEc9a4883ee162b4Bd3858a43a44fBd13B0187     |
|   6   |      RewardsPool       |     0xeB108f0308170dB6845F50B7D221905e22557d40     |

