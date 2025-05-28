import BtcIcon from "@/images/bitcoin-icon.svg";
import EthIcon from "@/images/ethereum-icon.svg";
import LinkIcon from "@/images/chainlink-icon.svg";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

const USD_ADDRESS = "0x0000000000000000000000000000000000000348";

export const assetIcons: Record<string, StaticImport> = {
  btc: BtcIcon,
  eth: EthIcon,
  link: LinkIcon,
} as const;

export const ASSETS = [
  {
    symbol: "btc",
    name: "Bitcoin",
    address: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    quote: USD_ADDRESS,
    decimals: 8,
  },
  {
    symbol: "eth",
    name: "Ethereum",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    quote: USD_ADDRESS,
    decimals: 8,
  },
  {
    symbol: "link",
    name: "Chainlink",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    quote: USD_ADDRESS,
    decimals: 8,
  },
] as const;

export type Asset = (typeof ASSETS)[number];
