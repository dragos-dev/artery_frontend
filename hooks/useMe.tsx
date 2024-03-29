import { infoAtom } from "@/lib/atom";
import {$api} from "@/lib/axios";
import { Info } from "@/lib/types";
import {useQuery} from "@tanstack/react-query";
import { useAtom } from "jotai";

export const useMe = () => {
    const [, setInfo] = useAtom(infoAtom)

    return useQuery({
        queryFn: async () => {
            const res: Info = await $api
                .get("/auth/info")
                .then((response) => response.data);

            setInfo(() => res)
            console.log("Info response", res);

            return res;
        },
        queryKey: ["info"],
        initialData: {} as Info,
    });
};
