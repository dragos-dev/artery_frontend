import { chains } from "@/app/chains";
import { infoAtom, selectedChainsStatusAtom } from "@/lib/atom";
import {$api} from "@/lib/axios";
import { Info, RequestCheck } from "@/lib/types";
import {useMutation} from "@tanstack/react-query";
import { useAtom } from "jotai";

export const useCheck = () => {
    const [, setInfo] = useAtom(infoAtom)

    return useMutation(
        async({ bridge_id, to_address }: { bridge_id: number, to_address: string }) => {
            const res: RequestCheck = await $api
                .post("/bridge/check", {
                    bridge_id,
                    to_address
                })
                .then((response) => response.data);

            return res;
        },
        {
            onSuccess: (res: RequestCheck) => {
                if (res.confirmed)
                    setInfo(prev => ({
                        maxAmount: prev?.maxAmount ?? 0,
                        commission: prev?.commission ?? 0,
                        activeBridge: undefined,
                        feePerTransfer: prev?.feePerTransfer ?? 0
                    }))
                console.log("Request check response", res);
            }
        }
    );
};
