import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const F = await ethers.getContractFactory("RiskRegistry");
  const c = await F.deploy(deployer.address, deployer.address); // owner & feeRecipient
  await c.waitForDeployment();
  const addr = await c.getAddress();
  console.log("RiskRegistry deployed to:", addr);

  // DEMO: public mode aç (kullanıcılar direkt yazabilsin)
  const tx = await c.setPublicMode(true);
  await tx.wait();
  console.log("Public mode enabled");
}
main().catch((e)=>{console.error(e);process.exit(1)});
