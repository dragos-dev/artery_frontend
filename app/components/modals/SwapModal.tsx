import { chains, evmChains } from "@/app/chains";
import { infoAtom, selectedChainsStatusAtom } from "@/lib/atom";
import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, Progress, Skeleton, useDisclosure } from "@nextui-org/react";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import Timer from "../utils/Timer";
import toast from "react-hot-toast";
import { useAccount, useContractWrite } from "wagmi";
import tokenABI from "@/public/abi/token.json";
import { waitForTransaction } from "@wagmi/core";
import { useBridge } from "@/hooks/useBridge";
import { useMe } from "@/hooks/useMe";
import { useCheck } from "@/hooks/useCheck";
import { CONTRACT_ADDRESS } from "@/lib/data";
import { Chains } from "@/lib/types";
import axios from "axios";
import { $api } from "@/lib/axios";
import Image from 'next/image';
import SuccessIcon from "@/public/success.png";
import ErrorIcon from "@/public/error.png";

interface ISwapModalProps {
    open: boolean;
    onClose: () => void;
    amount: number;
}

const SwapModal = ({ open, onClose, amount }: ISwapModalProps) => {
    const [selectedChains, setSelectedChains] = useAtom(selectedChainsStatusAtom)
    const [info] = useAtom(infoAtom)
    const {refetch} = useMe()
    const [loading, setLoading] = useState(true)
    const {writeAsync} = useContractWrite({
        address: CONTRACT_ADDRESS,
        abi: tokenABI,
        functionName: 'transfer'
    })
    const {data: checkData, mutate: sendCheck} = useCheck()
    const [bridging, setBridging] = useState(false)
    const [toAddress, setToAddress] = useState("")
    const { address } = useAccount()
    const [success, setSuccess] = useState(false)
    const [timedOut, setTimedOut] = useState(false)

    useEffect(() => {
        if (evmChains.includes(chains?.[selectedChains?.from]?.network)) setToAddress(() => address as `0x${string}`)
    }, [address])

    useEffect(() => {
        if (info?.activeBridge?.timeForOut && info.activeBridge.timeForOut < 0) {
            // toast.error("Время истекло")
            // onClose()
            setTimedOut(() => true)
        }
        setLoading(() => false)
    }, [info, open, bridging])

    const send = async() => {
        try {
            const transaction = await writeAsync({ args: [info?.activeBridge?.depositAddress, (info?.activeBridge?.amount ?? amount) * 1e18] })

            toast.success("Транзакция отправлена. Ждите подтверждения.")
        } catch (e) {
            console.log(e)
            toast.error("Error")
        }

        // const result = await waitForTransaction({ hash: transaction.hash, timeout: 1000 * 60 * 30 })

        // if (result.status == 'success') toast.success("Транзакция успешно обработана.")
    }
    
    const check = () => {
        if (!info?.activeBridge?.id) return

        sendCheck({ bridge_id: info.activeBridge.id, to_address: toAddress })
    }

    const cancel = async() => {
        if (!info?.activeBridge?.id) return

        const res = (await $api.delete("/bridge", { params: { id: info.activeBridge.id } })).data

        if (res) {
            toast.error("Swap отменен.")
            onClose()
        }
    }

    useEffect(() => {
        if (open) {
            if (checkData?.exists && checkData?.confirmed) {
                setSuccess(() => true)
            } else {
                toast.error("Еще не поступило переводов, ожидайте.")
            }
        }
    }, [checkData?.exists])

    return <Modal 
        isOpen={open} 
        placement={"bottom-center"}
        classNames={{
        closeButton: "hidden sm:block z-[1]",
        }}
        hideCloseButton
        className="bg-primary rounded-b-none m-0 sm:rounded-b-2xl max-w-[793px] min-h-[446px] overflow-visible"
        onOpenChange={() => {
            console.log("open change", open)
            onClose()
        }}
    >
    <ModalContent>
      {() => (
        <div className="relative">
          <div className="sm:hidden absolute left-0 right-0 mx-auto top-[-14px] w-[40px] h-[6px] bg-white rounded-[4px]"></div>
            {!success ? <>
                <ModalHeader className="flex flex-col gap-1 text-2xl text-center">Write address for sending</ModalHeader>
                <ModalBody className="flex flex-col items-center justify-center gap-8 p-8 max-w-[496px] mx-auto">
                    <div className="flex flex-col gap-[12px] max-w-full">
                            <span className="text-wrap text-center">Отправьте сумму <span className="text-[22px] font-semibold">{info?.activeBridge?.amount ?? amount} {chains[selectedChains.from].token}</span> на адрес кошелька Artery</span>
                            {info?.activeBridge?.timeForOut && info?.activeBridge?.timeForEnd ? <>
                            {loading ? <Skeleton className="rounded-lg bg-secondary before:opacity-10 w-[20%] ml-auto">
                                <div className="h-[24px] rounded-lg max-w-full"></div>
                            </Skeleton> : <span className="text-[14px] text-right">осталось <span className="text-[18px] font-semibold"><Timer timestamp={info.activeBridge.timeForEnd - info.activeBridge.timeForOut} timeTo={info.activeBridge.timeForEnd} /></span></span>}
                            {loading ? <Skeleton className="rounded-lg bg-secondary before:opacity-10">
                                <div className="h-[12px] rounded-lg max-w-full"></div>
                            </Skeleton> : 
                            <Progress aria-label="Loading..." value={(30 - info.activeBridge.timeForOut / (1000 * 60)) / 30 * 100} classNames={{ indicator: 'bg-white', track: 'bg-secondary' }} className="max-w-full"/>}
                            </> : null}
                            {loading ? <Skeleton className="rounded-lg bg-secondary before:opacity-10 w-[50%] mx-auto">
                                <div className="h-[54px] rounded-lg max-w-full"></div>
                            </Skeleton> : <div className="flex justify-center mx-auto place-items-center max-w-full bg-secondary h-[54px] rounded-2xl px-2">
                                <span className="truncate px-3">{info?.activeBridge?.depositAddress}</span>
                                <Button className="bg-white px-0 min-w-[40px]" onClick={() => {
                                    window.navigator.clipboard.writeText(info?.activeBridge?.depositAddress ?? "")
                                    toast.success("Скопировано")
                                }}>
                                    📄
                                </Button>
                            </div>}
                        </div>
                        <div className="flex flex-col gap-4">
                            {evmChains.includes(chains[selectedChains.from].network) ? <div className="w-full flex flex-col gap-4">
                                <Button onClick={send} className="h-[74px] bg-secondary text-white w-full font-medium text-[18px]">
                                        Send
                                </Button>
                            </div> : null}
                            <Input type="text" label="Введите адрес на который отправить токены" value={toAddress} onChange={e => setToAddress(() => e.target.value)} classNames={{
                                inputWrapper: "h-[102px] bg-secondary data-[hover=true]:bg-secondary group-data-[focus=true]:bg-secondary",
                                label: "text-[14px] font-medium text-third pb-[5px]",
                                input: "text-[36px] font-medium !text-white"
                            }} />
                            <div className="w-full flex flex-col gap-4">
                                <Button className="h-[74px] bg-white w-full font-medium text-[18px]" onClick={check}>
                                    Check payment
                                </Button>
                                <Button onClick={cancel} className="h-[74px] bg-secondary text-red-500 w-full font-medium text-[18px]">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                </ModalBody>
            </> : !timedOut ? <>
            <ModalHeader className="flex flex-col gap-1 text-2xl text-center">Успешно! Свап выполнен</ModalHeader>
            <ModalBody className="flex flex-col items-center justify-center gap-8 p-8 max-w-[496px] mx-auto">
                <div className="flex flex-col gap-10 max-w-full">
                    <Image src={SuccessIcon} alt="" className="w-[200px] h-[200px] sm:w-[400px] sm:h-[400px]" />
                    <Button onClick={onClose} className="h-[74px] bg-white text-secondary w-full font-medium text-[18px]">
                        OK
                    </Button>
                </div>
            </ModalBody>
            </> : <>
            <ModalHeader className="flex flex-col gap-1 text-2xl text-center">Ошибка! Превышено время ожидания</ModalHeader>
            <ModalBody className="flex flex-col items-center justify-center gap-8 p-8 max-w-[496px] mx-auto">
                <div className="flex flex-col gap-10 max-w-full">
                    <Image src={ErrorIcon} alt="" className="w-[200px] h-[200px] sm:w-[400px] sm:h-[400px]" />
                    <Button onClick={onClose} className="h-[74px] bg-white text-secondary w-full font-medium text-[18px]">
                        OK
                    </Button>
                </div>
            </ModalBody>
            </>}
        </div>)}
    </ModalContent>
  </Modal>
}

export default SwapModal