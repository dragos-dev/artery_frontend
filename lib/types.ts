import { StaticImageData } from "next/image"

export enum Chains {
    ARTR = "ARTR",
    BSC = "BSC",
}

export type SelectedChains = {
    from: number,
    to: number
}

export type Chain = {
    name: string,
    network: Chains,
    token: string,
    icon: StaticImageData
}

interface ActibeBridge {
    id: number;
    timeForOut: number;
    timeForEnd: number;
    depositAddress: string;
    amount: number;
    chains: {
        from: Chains;
        to: Chains;
    }
}

export interface Info {
    commission: number;
    activeBridge?: ActibeBridge;
    maxAmount: number;
    feePerTransfer: number;
}

export interface RequestBridge {
    id: number;
    depositAddress: string;
    amount: number;
}

export interface RequestCheck {
    exists: boolean;
    confirmed: boolean;
}