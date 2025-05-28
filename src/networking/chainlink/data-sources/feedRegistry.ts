import { ethers } from "ethers";

const ETH_MAINNET_FEED_REGISTRY_ADDRESS =
  "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf";

const FEED_REGISTRY_ABI = [
  {
    inputs: [
      { internalType: "address", name: "base", type: "address" },
      { internalType: "address", name: "quote", type: "address" },
    ],
    name: "getCurrentPhaseId",
    outputs: [
      { internalType: "uint16", name: "currentPhaseId", type: "uint16" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "base", type: "address" },
      { internalType: "address", name: "quote", type: "address" },
      { internalType: "uint16", name: "phaseId", type: "uint16" },
    ],
    name: "getPhaseRange",
    outputs: [
      { internalType: "uint80", name: "startingRoundId", type: "uint80" },
      { internalType: "uint80", name: "endingRoundId", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "base", type: "address" },
      { internalType: "address", name: "quote", type: "address" },
      { internalType: "uint80", name: "_roundId", type: "uint80" },
    ],
    name: "getRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "base", type: "address" },
      { internalType: "address", name: "quote", type: "address" },
    ],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const provider = new ethers.InfuraProvider(
  "mainnet",
  process.env.INFURA_API_KEY
);

export const feedRegistry = new ethers.Contract(
  ETH_MAINNET_FEED_REGISTRY_ADDRESS,
  FEED_REGISTRY_ABI,
  provider
);
