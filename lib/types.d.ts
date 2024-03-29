import { StaticImport } from "next"

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
    icon: StaticImport
}

interface ActibeBridge {
    id: number;
    timeForOut: number;
    depositAddress: string;
    amount: number;
}

export interface Info {
    commission: number;
    activeBridge?: ActibeBridge;
    maxAmount: number;
}

export interface RequestBridge {
    id: number;
    depositAddress: string;
    amount: number;
}