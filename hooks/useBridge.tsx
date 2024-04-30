import { chains } from "@/app/chains";
import { infoAtom, selectedChainsStatusAtom } from "@/lib/atom";
import {$api} from "@/lib/axios";
import { Info, RequestBridge } from "@/lib/types";
import {useMutation} from "@tanstack/react-query";
import { useAtom } from "jotai";

export const useBridge = () => {
    const [, setInfo] = useAtom(infoAtom)
    const [selectedChains] = useAtom(selectedChainsStatusAtom)

    return useMutation(
        async(amount: number) => {
            const res: RequestBridge = await $api
                .post("/bridge/request", {
                    chains: {
                        from: chains[selectedChains.from].network,
                        to: chains[selectedChains.to].network,
                    },
                    amount
                })
                .then((response) => response.data);

            return res;
        },
        {
            onSuccess: (res: RequestBridge) => {
                setInfo(prev => ({
                    maxAmount: prev?.maxAmount ?? 0,
                    commission: prev?.commission ?? 0,
                    activeBridge: {
                        id: res.id,
                        depositAddress: res.depositAddress,
                        timeForOut: 1000 * 60 * 30,
                        timeForEnd: new Date().getTime() + 1000 * 60 * 30,
                        amount: res.amount,
                    },
                    feePerTransfer: prev?.feePerTransfer ?? 0
                }))
                console.log("Request bridge response", res);
            }
        }
    );
};
