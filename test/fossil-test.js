const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("FossilToken Testcases : ", function () {

    let utilityManager;
    let fossilToken;
    let liquidityMiningManager;
    let dinoToken;
    let dinoPool;
    let rewardsPool;

    before(async () => {
        [user_1, user_2, user_3] = await ethers.getSigners();
        console.log(`Deploying contract with the account: ${user_1.address}`);
    });

    // ------------------------------- Deploying Contracts -----------------------------------------

    it("Should deploy RewardsPool contract", async function () {
        const RewardsPool = await ethers.getContractFactory("RewardsPool");
        rewardsPool = await RewardsPool.deploy();
        await rewardsPool.deployed();
        console.log("RewardsPool contract deployed at : ", rewardsPool.address);
    });

    it("Should deploy UtilityManager contract", async function () {
        const UtilityManager = await ethers.getContractFactory("UtilityManager");
        utilityManager = await UtilityManager.deploy();
        await utilityManager.deployed();
        console.log("UtilityManager contract deployed at : ", utilityManager.address);
    });

    it("Should deploy FossilToken contract", async function () {
        const FossilToken = await ethers.getContractFactory("FossilToken");
        fossilToken = await FossilToken.deploy("Fossil", "FOS", "1000000000000000000000000000", utilityManager.address);
        await fossilToken.deployed();
        console.log("FossilToken contract deployed at : ", fossilToken.address);
    });

    it("Should deploy DinoToken contract", async function () {
        const DinoToken = await ethers.getContractFactory("DinoToken");
        dinoToken = await DinoToken.deploy("https://dinotoken/");
        await dinoToken.deployed();
        console.log("DinoToken contract deployed at : ", dinoToken.address);
    });

    it("Should deploy LiquidityMiningManager contract", async function () {
        const LiquidityMiningManager = await ethers.getContractFactory("LiquidityMiningManager");
        liquidityMiningManager = await LiquidityMiningManager.deploy(fossilToken.address, user_1.address, utilityManager.address);
        await liquidityMiningManager.deployed();
        console.log("LiquidityMiningManager contract deployed at : ", liquidityMiningManager.address);
    });

    it("Should deploy DinoPool contract", async function () {
        const DinoPool = await ethers.getContractFactory("DinoPool");
        dinoPool = await DinoPool.deploy(
            "Staked Dino Token",
            "SDT",
            dinoToken.address,
            fossilToken.address,
            "1000000000000000000",
            "600",
            utilityManager.address,
            rewardsPool.address,
            dinoToken.address
        );
        await dinoPool.deployed();
        console.log("DinoPool contract deployed at : ", dinoPool.address);
    });

    // ----------------------- Initialize UtilityManager -----------------------------------

    it("Should initialize UtilityManager values", async function () {
        await utilityManager.setContractAddress(fossilToken.address, dinoPool.address, liquidityMiningManager.address);
        let supply = await fossilToken.totalSupply();
        await utilityManager.updatePendingRewards(supply,1);
    });

    // ----------------------- Initialize RewardsPool -----------------------------------

    it("Should initialize RewardsPool values", async function () {
        await rewardsPool.setContractAddresses(dinoPool.address, fossilToken.address);
    });

    // ----------------------- Fossil Token View Functions -----------------------------------------

    it("Should check FossilToken totalSupply", async function () {
        let supply = await fossilToken.totalSupply();
        expect(supply).to.equal("1000000000000000000000000000");
    });

    it("Should check FossilToken name", async function () {
        let tokenName = await fossilToken.name();
        expect(tokenName).to.equal("Fossil");
    });

    it("Should check FossilToken symbol", async function () {
        let tokenSymbol = await fossilToken.symbol();
        expect(tokenSymbol).to.equal("FOS");
    });

    it("Should check FossilToken decimals", async function () {
        let tokenDecimals = await fossilToken.decimals();
        expect(tokenDecimals).to.equal(18);
    });

    // ----------------------- Initialize LiquidityMiningManager -----------------------------------

    it("Should initialize LiquidityMiningManager values", async function () {
        let govRole = await liquidityMiningManager.GOV_ROLE();
        let distributorRole = await liquidityMiningManager.REWARD_DISTRIBUTOR_ROLE();
        await liquidityMiningManager.grantRole(govRole, user_1.address);
        await liquidityMiningManager.grantRole(distributorRole, user_1.address);
        await liquidityMiningManager.addPool(dinoPool.address, "100");
        await liquidityMiningManager.setRewardPerSecond("1");
        let supply = await fossilToken.totalSupply();
        await fossilToken.approve(liquidityMiningManager.address, supply);
    });

    // ----------------------- Transfer NFT ------------------------------------

    it("Should transfer 2 NFT from user_1 to user_2", async function () {
        await dinoToken["safeTransferFrom(address,address,uint256)"](user_1.address, user_2.address, 0);
        await dinoToken["safeTransferFrom(address,address,uint256)"](user_1.address, user_2.address, 1);
        let balance = await dinoToken.balanceOf(user_2.address);
        expect(balance).to.equal(2);
    });

    it("Should give approval of token 0 & 1 to dinoPool", async function () {
        await dinoToken.connect(user_2).approve(dinoPool.address, 0);
        await dinoToken.connect(user_2).approve(dinoPool.address, 1);
    });

    // ----------------------- Stake NFT ------------------------------------

    it("Should deposit token 0 to dinoPool", async function () {
        await dinoPool.connect(user_2).deposit([0], 600, user_2.address);
        let deposits = await dinoPool.getDepositsOf(user_2.address);
        expect(deposits.length).to.greaterThanOrEqual(1);
    });

    // ----------------------- Distribute Rewards ------------------------------------

    it("Should deduct FossilToken for reward distribution after 10 minutes", async function () {
        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        await ethers.provider.send("evm_mine", [blockBefore.timestamp+600]);
        let oldBalance = await fossilToken.balanceOf(user_1.address);
        await liquidityMiningManager.distributeRewards();
        let newBalance = await fossilToken.balanceOf(user_1.address);
        expect(Number(newBalance)).to.lessThanOrEqual(Number(oldBalance));
    });

    it("Should change contract owner", async function () {
        let oldOwner = await fossilToken.contractOwner();
        await fossilToken.changeContractOwner(user_3.address);
        let newOwner = await fossilToken.contractOwner();
        expect(oldOwner).to.not.equal(newOwner);
    });

    it("New contract owner must have Admin role permission", async function () {
        let adminRole = await fossilToken.DEFAULT_ADMIN_ROLE();
        let result = await fossilToken.hasRole(adminRole, user_3.address);
        expect(result).to.equal(true);
    });

    it("Should mint more Fossil tokens", async function () {
        let oldSupply = await fossilToken.totalSupply();
        let minter = await fossilToken.MINTER_ROLE();
        await fossilToken.grantRole(minter,user_1.address);
        await fossilToken.connect(user_1).mint(user_1.address, "1000000000000000000000000000");
        let newSupply = await fossilToken.totalSupply();
        expect(BigNumber.from(oldSupply)).lt(BigNumber.from(newSupply));
    });

});


