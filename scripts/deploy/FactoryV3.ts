import { ethers } from "hardhat";

async function main() {
  const MAX_SALT = 10;
  const signer = (await ethers.getSigners())[0];

  // deploy factory
  const Factory = await ethers.getContractFactory("FactoryV3");
  const factory = await Factory.deploy();
  await factory.deployed();

  const Account = await ethers.getContractFactory("Product");
  const accountBytecode = Account.bytecode;

  // make bytecode with constructor parameter
  const encoder = new ethers.utils.AbiCoder();
  const bytecode = `${accountBytecode}${encoder.encode(["uint256"], [10_0000]).slice(2)}`;

  // get address before deploy contract
  console.log("pre Addr");
  for (let salt = 1; salt <= MAX_SALT; salt++) {
    const addr = await factory.getAddress(salt, bytecode);
    console.log(addr.toLowerCase());
  }

  // deploy Account contract using create2
  console.log("real Addr");
  for (let salt = 1; salt <= MAX_SALT; salt++) {
    const tx = await factory.deploy(bytecode, salt, 0);
    const receipt = await tx.wait();
    receipt.events?.forEach((event) => {
      console.log(event.args?.addr.toLowerCase());
    });
  }
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
