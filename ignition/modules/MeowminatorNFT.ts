// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const input_baseTokenURI =
  "ipfs://bafkreidil4xokktdnzqflmvvpkvvoyzdpp7uufrmzx3ottrlc3rrx2kvqu";

const MeowminatorModule = buildModule("MeowminatorModule", (m) => {
  const baseTokenURI = m.getParameter("baseTokenURI", input_baseTokenURI);

  // testnet
  // const Meowminator = m.contract("MeowminatorNFT", [
  //   new Date("2025-04-15 08:00:00").getTime() / 1000,
  //   new Date("2025-05-15 05:00:00").getTime() / 1000,
  //   baseTokenURI,
  // ]);

  // mainnet
  const Meowminator = m.contract("MeowminatorNFT", [
    new Date("2025-04-16 13:00:00").getTime() / 1000,
    new Date("2025-05-16 13:00:00").getTime() / 1000,
    baseTokenURI,
  ]);

  return { Meowminator };
});

export default MeowminatorModule;
