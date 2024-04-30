import { AuthenticationStatus } from "@rainbow-me/rainbowkit";
import { Info, SelectedChains } from "./types"
import { atom } from "jotai";

export const authenticatedStatusAtom = atom<AuthenticationStatus | null>(null);

export const selectedChainsStatusAtom = atom<SelectedChains>({ from: 0, to: 1 });

export const infoAtom = atom<Info | null>(null)