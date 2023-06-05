import { ethers } from "hardhat";

const MAX_SALT = 10;

async function main() {
  const gasUsed = [];

  // deploy Factory contract
  const signer = (await ethers.getSigners())[0];
  const Factory = await ethers.getContractFactory("FactoryV1", signer);
  const factory = await Factory.deploy();
  await factory.deployed();

  // get Account contract address before deploy
  const Account = await ethers.getContractFactory("AccountV1", signer);
  const accountByteCode = Account.bytecode;
  const encoder = new ethers.utils.AbiCoder();
  const byteCode = `${accountByteCode}${encoder.encode(["address"], [signer.address]).slice(2)}`;
  console.log("pre Addr");
  for (let salt = 1; salt <= MAX_SALT; salt++) {
    const preDeciAddr = buildCreate2Address(factory.address, numberToUint256(salt), byteCode);
    console.log(preDeciAddr);
  }

  // deploy Account contract using create2
  console.log("real Addr");
  for (let salt = 1; salt <= MAX_SALT; salt++) {
    const tx = await factory.deploy(byteCode, salt);
    const receipt = await tx.wait();
    receipt.events?.forEach((event) => {
      console.log(event.args?.addr.toLowerCase());
    });
    gasUsed.push(receipt.gasUsed.toString());
  }

  console.log(gasUsed);
  // gas used -> 237065
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function numberToUint256(num: number) {
  const hex = num.toString(16);
  return `0x${"0".repeat(64 - hex.length)}${hex}`;
}

function buildCreate2Address(creatorAddress: string, saltHex: string, byteCode: string) {
  return `0x${ethers.utils
    .keccak256(
      `0x${["ff", creatorAddress, saltHex, ethers.utils.keccak256(byteCode)]
        .map((el) => el.replace(/0x/, ""))
        .join("")}`
    )
    .slice(-40)}`.toLowerCase();
}
