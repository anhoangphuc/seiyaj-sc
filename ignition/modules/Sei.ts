import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SeiModule = buildModule("SeiModule", (m) => {
  const sei = m.contract("Seiyaj", []);

  return { sei: sei };
});

export default SeiModule;
