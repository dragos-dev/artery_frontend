import { Chain, Chains } from "../lib/types.d";
import BNBChainIcon from "@/public/bnb-chain-binance-smart-chain-logo 1.svg"
import ArteryIcon from "@/public/artery.svg"

export const chains: Chain[] = [
    {
        name: "BNB Chain",
        network: Chains.BSC,
        token: "WARTR",
        icon: BNBChainIcon
    },
    {
        name: "Artery Network",
        network: Chains.ARTR,
        token: "ARTR",
        icon: ArteryIcon
    }
]

export const evmChains = [Chains.BSC]