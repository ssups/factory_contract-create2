import { ethers } from "hardhat";

const MAX_SALT = 10;

async function main() {
  const gasUsed = [];

  // deploy Factory contract
  const signer = (await ethers.getSigners())[0];
  const Factory = await ethers.getContractFactory("FactoryV2", signer);
  const factory = await Factory.deploy();
  await factory.deployed();

  // get Account contract address before deploy
  console.log("pre Addr");
  for (let salt = 1; salt <= MAX_SALT; salt++) {
    const preDeciAddr = await factory.getAddress(signer.address, salt);
    console.log(preDeciAddr.toLowerCase());
  }

  // deploy Account contract using create2
  console.log("real Addr");
  for (let salt = 1; salt <= MAX_SALT; salt++) {
    const tx = await factory.deploy(salt);
    const receipt = await tx.wait();
    receipt.events?.forEach((event) => {
      console.log(event.args?.addr.toLowerCase());
    });

    gasUsed.push(receipt.gasUsed.toString());
  }

  console.log(gasUsed);
  // gas used -> 220918
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
