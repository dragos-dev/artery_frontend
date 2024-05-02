"use client";

import Image from "next/image";
import NotificationIcon from "@/public/notification.svg";
import { Button, Card, CardBody, Input, Link, Tab, Tabs, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, CircularProgress } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import HistoryIcon from "@/public/history.svg";
import HistoryLightIcon from "@/public/history_light.svg"
import BNBChainIcon from "@/public/bnb-chain-binance-smart-chain-logo 1.svg"
import ArteryIcon from "@/public/artery.svg"
import ArrowDownIcon from "@/public/arrow_down.svg"
import SwapIcon from "@/public/swap.svg"
import TelegramIcon from "@/public/telegram.svg"
import TwitterIcon from "@/public/twitter.svg"
import InstagramIcon from "@/public/instagram.svg"
import GithubIcon from "@/public/github.svg"
import { chains, evmChains } from "./chains";
import { useAccount, useContractRead } from "wagmi";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAtom } from "jotai";
import { authenticatedStatusAtom, infoAtom, selectedChainsStatusAtom } from "@/lib/atom";
import ChainsModal from "./components/modals/ChainModal";
import SwapModal from "./components/modals/SwapModal";
import { useMe } from "@/hooks/useMe";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESS, MIN_BRIDGE_SUM } from "@/lib/data";
import { useBridge } from "@/hooks/useBridge";
import * as abi from "@/public/abi/token.json"
import SwapModalError from "./components/modals/SwapModalError";
import { Chains, HistoryBridge } from "@/lib/types";
import { $api } from "@/lib/axios";

function Home() {
  const [authenticated] = useAtom(authenticatedStatusAtom)

  const chainsModalOpen = useDisclosure()
  const swapModalOpen = useDisclosure() 
  const swapModalError = useDisclosure()

  const [selected, setSelected] = React.useState("transfer");
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const [selectedChains, setSelectedChains] = useAtom(selectedChainsStatusAtom)
  const [selectingChain, setSelectingChain] = useState<"none" | "from" | "to">("none")
  const [info] = useAtom(infoAtom)
  const {mutate, isError, isSuccess} = useBridge()
  const [hideFromMax, setHideFromMax] = useState(false)
  const {data: balance, refetch} = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: Array.from(abi),
    functionName: 'balanceOf',
    args: [address],
    watch: true
  })

  useEffect(() => {
    setHideFromMax(() => chains[selectedChains?.to]?.network != Chains.ARTR)
}, [selectedChains])

  useEffect(() => {
    if (isSuccess) swapModalOpen.onOpen()
  }, [isSuccess])

  useEffect(() => {
    if (isError) swapModalError.onOpen()
  }, [isError])

  const [swapAmountFrom, setSwapAmountFrom] = useState(0)
  const [swapAmountTo, setSwapAmountTo]  = useState(0)

  const [userBalance, setUserBalance] = useState("")

  useEffect(() => {
    if (evmChains.includes(chains?.[selectedChains?.from]?.network)) {
      const value = (Number(balance) / 1e6).toFixed(0)
      setUserBalance(() => !isNaN(Number(value)) ? `${value}` : "")
    }
  }, [address, balance, selectedChains?.from])

  useEffect(() => {
    setSwapAmountTo(() => info?.commission !== undefined ? (swapAmountFrom > info.commission ? Number((swapAmountFrom - info.commission - (swapAmountFrom * 5 / 1e3)).toFixed(2)) : 0) : 0)
  }, [swapAmountFrom])
  
  useEffect(() => {console.log(selectedChains)}, [authenticated, selectedChains.from, selectedChains.to])

  useEffect(() => {
    if (info?.activeBridge) swapModalOpen.onOpen()
  }, [info])

  const onSwitch = () => {
    let lastSelectedChainFrom = selectedChains?.from
    let lastSelectedChainTo = selectedChains?.to

    if (isNaN(lastSelectedChainFrom) || isNaN(lastSelectedChainTo)) return

    setSelectedChains(() => ({ from: lastSelectedChainTo, to: lastSelectedChainFrom }))
  }

  const addToken = async() => {
    const tokenSymbol = 'WARTR';
    const tokenDecimals = 6;
    
    if (!('ethereum' in window)) return

    try {
      const wasAdded = await (window.ethereum as any).request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: CONTRACT_ADDRESS, 
            symbol: tokenSymbol, 
            decimals: tokenDecimals, 
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  const [bridges, setBridges] = useState<HistoryBridge[]>([])

  const getBridges = async() => {
    const res = (await $api.get("/bridge")).data

    console.log(res)

    if (!res) return

    setBridges(() => res)
  } 

  return (
    <main className="flex min-h-screen flex-col items-center p-4 gap-4 sm:gap-10">
      <ChainsModal open={chainsModalOpen.isOpen} onClose={chainsModalOpen.onClose} onSwitch={onSwitch} selectingChain={selectingChain} setSelectingChain={setSelectingChain} />
      <SwapModal open={swapModalOpen.isOpen} onClose={swapModalOpen.onClose} amount={swapAmountFrom} />
      <SwapModalError open={swapModalError.isOpen} onClose={swapModalError.onClose} />

      <div className="display flex gap-4">
        <Image src={NotificationIcon} alt="Notification" />
        <p className="text-[18px] text-center">Transfer from/to TON is temporarily paused due to the planned network infrastructure migration. Service will resume as soon as it is done.</p>
      </div>
      <div className="w-full lg:px-[50px] flex gap-3 justify-between">
        <div className="flex-1 hidden lg:block"></div>
        <div className="flex-1 flex flex-col items-center">
              <Tabs
                fullWidth
                size="md"
                aria-label="Tabs form"
                className="lg:w-[462px]"
                classNames={{
                  tabList: "bg-primary h-[60px] font-medium",
                  tab: "h-[52px] lg:w-[223px] rounded-[12px]",
                  tabContent: "text-white text-[18px] lg:w-[231px]",
                  panel: "pt-8 w-full flex justify-center"
                }}
                selectedKey={selected}
                onSelectionChange={key => setSelected(key.toString())}
              >
                <Tab key="transfer" title="Transfer">
                  <Card className="max-w-full bg-transparent lg:bg-primary w-full lg:w-[545px] min-h-[400px]">
                    <CardBody className="flex flex-col items-center text-white overflow-hidden gap-5 min-h-full p-0 lg:p-6">
                        <Button className="w-full bg-secondary font-medium text-white text-[18px] p-10" onClick={addToken}>
                          Add WARTR Token
                        </Button>

                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex items-center gap-5">
                            <span>
                              From
                            </span>
                            <Button onClick={() => {
                              setSelectingChain(() => "from")
                              chainsModalOpen.onOpen()
                            }} className="flex place-items-center font-medium text-[16px] gap-[25px] text-white bg-secondary p-6">
                              <div className="flex gap-[10px]">
                                <div className="bg-white rounded-full w-[20px] h-[20px]">
                                  <Image src={chains[selectedChains.from].icon} alt="Network" />
                                </div>
                                <span>{chains[selectedChains.from].name}</span>
                              </div>
                              <Image src={ArrowDownIcon} alt="Arrow down" height={8} width={16} />
                            </Button>
                          </div>
                          <div className="bg-secondary pt-5 rounded-[12px]">
                            <Input
                              type="number"
                              label="Send:"
                              placeholder="0.00"
                              disabled={!isConnected}
                              value={swapAmountFrom ? swapAmountFrom.toString() : ""}
                              onChange={e => {
                                  const value = Number(e.target.value)
                                  if (isNaN(value)) return
                                  setSwapAmountFrom(() => value)
                              }}
                              labelPlacement="outside"
                              className="h-[60px]"
                              classNames={{
                                input: "!text-white font-medium text-[36px] !placeholder-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                label: "!text-third px-5",
                                inputWrapper: "bg-transparent px-5 data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent"
                              }}
                              endContent={
                                <div className="relative min-w-[70px] pointer-events-none flex items-center justify-end">
                                  {!hideFromMax ? <span className="absolute top-[-38px] text-[14px] text-third truncate">Max: {info?.maxAmount ? Math.floor(info.maxAmount) : "..."}</span> : null}
                                  <span className="text-white text-small">{(evmChains.includes(chains[selectedChains.from].network) && userBalance) ? `${userBalance} ` : ``}{chains[selectedChains.from].token}</span>
                                </div>
                              }
                            />
                          </div>
                        </div>
                        
                        <div className="min-h-[52px]">
                          <Button onClick={onSwitch} className="!w-[52px] !min-w-[52px] h-[52px] p-[14px] bg-secondary">
                            <Image src={SwapIcon} alt="Switch" />
                          </Button>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex items-center gap-5">
                              <span>
                                To
                              </span>
                              <Button onClick={() => {
                                setSelectingChain(() => "to")
                                chainsModalOpen.onOpen()
                              }} className="flex place-items-center font-medium text-[16px] gap-[25px] text-white bg-secondary p-6">
                                <div className="flex gap-[10px]">
                                  <div className="bg-white rounded-full w-[20px] h-[20px]">
                                    <Image src={chains[selectedChains.to].icon} alt="Network" />
                                  </div>
                                  <span>{chains[selectedChains.to].name}</span>
                                </div>
                                <Image src={ArrowDownIcon} alt="Arrow down" height={8} width={16} />
                              </Button>
                          </div>
                          <div className="bg-secondary pt-5 rounded-[12px]">
                              <Input
                                type="number"
                                label="Receive:"
                                placeholder="0.00"
                                value={swapAmountTo ? swapAmountTo.toString() : ""}
                                disabled
                                labelPlacement="outside"
                                className="h-[60px]"
                                classNames={{
                                  input: "!text-white font-medium text-[36px] !placeholder-white",
                                  label: "!text-third px-5",
                                  inputWrapper: "bg-transparent px-5 data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent"
                                }}
                                endContent={
                                  <div className="relative w-[70px] pointer-events-none flex items-center justify-end">
                                    {/* <span className="absolute top-[-38px] text-[14px] text-third truncate">Max: {info?.maxAmount ? Math.floor(info.maxAmount) : "..."}</span> */}
                                    <span className="text-white text-small">{chains[selectedChains.to].token}</span>
                                  </div>
                                }
                              />
                          </div>
                        </div>
                        
                        <Button className="w-full bg-white font-medium text-[18px] p-10" onClick={() => {
                           if ((!isConnected || !localStorage.getItem('token')) && openConnectModal) {
                            openConnectModal()
                          } else {
                            if (swapAmountFrom < MIN_BRIDGE_SUM) {
                              toast.error(`Минимальная сумма бриджа - ${MIN_BRIDGE_SUM}`) 
                            } else {
                              mutate(swapAmountFrom)
                            }
                          }
                        }}>
                          {(authenticated == 'loading' || authenticated === null) ? <CircularProgress color="default" aria-label="Loading..." /> : authenticated =='authenticated' ? "Swap" : "Connect Wallet"}
                        </Button>
                    </CardBody>
                  </Card>
                </Tab>
                <Tab key="liquidity" title="Liquidity">
                  
                </Tab>
                <Tab key="history" title="History">
                <Card className="flex flex-col gap-6 max-w-full bg-transparent lg:bg-primary w-full lg:w-[461px] lg:p-6">
                    {bridges?.length ? bridges.map(bridge => <CardBody className="flex flex-col items-center text-white bg-secondary rounded-[16px] overflow-hidden gap-5 flex-1">
                        <h1 className="font-semibold text-[20px] opacity-70">Свап</h1>
                        <div className="flex flex-col gap-4 w-full">
                          <div className="flex justify-between w-full gap-4">
                            <span>
                              Из
                            </span>
                            <div className="flex gap-[10px]">
                              <Image src={chains?.find(el => el.network == bridge.chain_from)?.icon ?? ""} alt="chain" />
                              <span>{chains?.find(el => el.network == bridge.chain_from)?.name}</span>
                            </div>
                          </div>
                          <div className="flex justify-between w-full gap-4">
                            <span>
                              В
                            </span>
                            <div className="flex gap-[10px]">
                              <Image src={chains?.find(el => el.network == bridge.chain_to)?.icon ?? ""} alt="chain" />
                              <span>{chains?.find(el => el.network == bridge.chain_to)?.name}</span>
                            </div>
                          </div>
                          <div className="flex justify-between w-full gap-4">
                            <span>
                              Сумма
                            </span>
                            <span>
                              {bridge.amount} ARTR
                            </span>
                          </div>
                          <div className="flex justify-end">
                            <span className="text-[12px] text-purple">{new Date(bridge.timestamp).toDateString()}</span>
                          </div>
                        </div>
                    </CardBody>) : null}
                  </Card>
                </Tab>
              </Tabs>
        </div>
        <div className="hidden lg:flex flex-1 justify-end gap-3">
            <Button 
              className={`flex place-items-center font-medium text-[18px] gap-[10px] text-white bg-primary p-6 ${selected == 'history' ? "bg-white text-secondary" : ""}`} 
              onClick={() => {
                if ((!isConnected || !localStorage.getItem('token')) && openConnectModal) {
                  openConnectModal()
                } else {
                  getBridges()
                  setSelected(() => "history")
                }
              }}>
              <Image src={selected == 'history' ? HistoryIcon : HistoryLightIcon} alt="History" />  
              History
            </Button>
            <Button className="flex place-items-center font-medium text-[18px] text-primary bg-white p-6" onClick={() => {
                if ((!isConnected || !localStorage.getItem('token')) && openConnectModal) {
                  openConnectModal()
                } else if (openAccountModal) {
                  openAccountModal()
                }
            }}>
              {(authenticated == 'loading' || authenticated === null) ? <CircularProgress classNames={{
                svg: "h-6 w-6"
              }} color="default" aria-label="Loading..." /> : authenticated =='authenticated' ? `${address?.slice(0, 10)}...` : "Connect Wallet"}
            </Button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-[11px]">
          <span className="text-third">Created by <Link href="https://t.me/devkid2" target="_blank" className="text-white text-[18px]">aqua</Link></span>
          <div className="flex justify-center gap-1">
            <Link href="https://t.me" target="_blank" className="flex justify-center w-[40px] h-[40px] rounded-[16px] bg-secondary">
              <Image src={TelegramIcon} alt="Telegram" />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="flex justify-center w-[40px] h-[40px] rounded-[16px] bg-secondary">
              <Image src={TwitterIcon} alt="Twitter" />
            </Link>
            <Link href="https://instagram.com" target="_blank" className="flex justify-center w-[40px] h-[40px] rounded-[16px] bg-secondary">
              <Image src={InstagramIcon} alt="Instagram" />
            </Link>
            <Link href="https://github.com" target="_blank" className="flex justify-center w-[40px] h-[40px] rounded-[16px] bg-secondary">
              <Image src={GithubIcon} alt="Github" />
            </Link>
          </div>
        </div>
    </main>
  );
}

export default Home;