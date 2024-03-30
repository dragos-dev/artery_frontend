import { chains, evmChains } from "@/app/chains";
import { infoAtom, selectedChainsStatusAtom } from "@/lib/atom";
import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, Progress, Skeleton, useDisclosure } from "@nextui-org/react";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import Timer from "../utils/Timer";
import toast from "react-hot-toast";
import { useContractWrite } from "wagmi";
import tokenABI from "@/public/abi/token.json";
import { waitForTransaction } from "@wagmi/core";
import { useBridge } from "@/hooks/useBridge";

interface ISwapModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    amount: number;
}

const SwapModal = ({ open, setOpen, amount }: ISwapModalProps) => {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [selectedChains, setSelectedChains] = useAtom(selectedChainsStatusAtom)
    const [info] = useAtom(infoAtom)
    const [loading, setLoading] = useState(true)
    const addressToDeposit = "0x7ECBaf84d675e0986cB3425716A194A7232dFC09"
    const {writeAsync} = useContractWrite({
        address: "0x7ECBaf84d675e0986cB3425716A194A7232dFC09",
        abi: tokenABI,
        functionName: 'transfer',
        args: [addressToDeposit, (info?.activeBridge?.amount ?? amount) * 1_000_000]
    })
    const {mutate} = useBridge()

    useEffect(() => {
        if (open) // onOpen()
        if (!isOpen) setOpen(() => false)
    }, [open, isOpen])

    useEffect(() => {
        if (!info?.activeBridge) mutate(amount)
        setLoading(() => false)
    }, [info])

    const swap = async() => {
        const transaction = await writeAsync()

        toast.custom("Транзакция отправлена. Ждите подтверждения.")

        // const result = await waitForTransaction({ hash: transaction.hash, timeout: 1000 * 60 * 30 })

        // if (result.status == 'success') toast.success("Транзакция успешно обработана.")
    }

    return <Modal 
    isOpen={isOpen} 
    placement={"bottom-center"}
    classNames={{
      closeButton: "hidden sm:block z-[1]",
    }}
    className="bg-primary rounded-b-none m-0 sm:rounded-b-2xl max-w-[793px] min-h-[446px] overflow-visible"
    onOpenChange={onOpenChange} 
  >
    <ModalContent>
      {(onClose) => (
        <div className="relative">
          <div className="sm:hidden absolute left-0 right-0 mx-auto top-[-14px] w-[40px] h-[6px] bg-white rounded-[4px]"></div>
          <ModalHeader className="flex flex-col gap-1 text-2xl text-center">Write address for sending</ModalHeader>
          <ModalBody className="flex flex-col items-center justify-center gap-8 p-8 max-w-[496px] mx-auto">
            <div className="flex flex-col gap-[12px] max-w-full">
                <span className="text-wrap text-center">Отправьте сумму <span className="text-[22px] font-semibold">{info?.activeBridge?.amount ?? amount} {chains[selectedChains.from].token}</span> на адрес кошелька Artery</span>
                {loading ? <Skeleton className="rounded-lg bg-secondary before:opacity-10 w-[20%] ml-auto">
                    <div className="h-[24px] rounded-lg max-w-full"></div>
                </Skeleton> : <span className="text-[14px] text-right">осталось <span className="text-[18px] font-semibold"><Timer timestamp={1711738711} timeTo={1720000000} /></span></span>}
                {loading ? <Skeleton className="rounded-lg bg-secondary before:opacity-10">
                    <div className="h-[12px] rounded-lg max-w-full"></div>
                </Skeleton> : 
                <Progress aria-label="Loading..." value={60} classNames={{ indicator: 'bg-white', track: 'bg-secondary' }} className="max-w-full"/>}
                {loading ? <Skeleton className="rounded-lg bg-secondary before:opacity-10 w-[50%] mx-auto">
                    <div className="h-[54px] rounded-lg max-w-full"></div>
                </Skeleton> : <div className="flex justify-center mx-auto place-items-center max-w-full bg-secondary h-[54px] rounded-2xl px-2">
                    <span className="truncate px-3">{addressToDeposit}</span>
                    <Button className="bg-white px-0 min-w-[40px]" onClick={() => {
                        window.navigator.clipboard.writeText(addressToDeposit)
                        toast.success("Скопировано")
                    }}>
                        📄
                    </Button>
                </div>}
            </div>
            <div className="flex flex-col gap-9">
                <Input type="text" label="Введите адрес на который отправить токены" classNames={{
                    inputWrapper: "h-[102px] bg-secondary data-[hover=true]:bg-secondary group-data-[focus=true]:bg-secondary",
                    label: "text-[14px] font-medium text-third pb-[5px]",
                    input: "text-[36px] font-medium !text-white"
                }} />
                <div className="w-full flex flex-col gap-4">
                    <Button className="h-[74px] bg-white w-full font-medium text-[18px]">
                        Check payment
                    </Button>
                    {evmChains.includes(chains[selectedChains.from].network) ? <Button onClick={swap} className="h-[74px] bg-secondary text-white w-full font-medium text-[18px]">
                        Send
                    </Button> : null}
                </div>
            </div>
          </ModalBody>
        </div>
      )}
    </ModalContent>
  </Modal>
}

export default SwapModal