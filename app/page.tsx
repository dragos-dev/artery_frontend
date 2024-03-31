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
import { chains } from "./chains";
import { useAccount } from "wagmi";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAtom } from "jotai";
import { authenticatedStatusAtom, infoAtom, selectedChainsStatusAtom } from "@/lib/atom";
import ChainsModal from "./components/modals/ChainModal";
import SwapModal from "./components/modals/SwapModal";
import { useMe } from "@/hooks/useMe";
import toast from "react-hot-toast";

export default function Home() {
  const [authenticated] = useAtom(authenticatedStatusAtom)

  const [chainsModalOpen, setChainsModalOpen] = useState(false)
  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [selected, setSelected] = React.useState("transfer");
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const [selectedChains, setSelectedChains] = useAtom(selectedChainsStatusAtom)
  const [selectingChain, setSelectingChain] = useState<"none" | "from" | "to">("none")
  const [info] = useAtom(infoAtom)

  const [swapAmountFrom, setSwapAmountFrom] = useState(0)
  const [swapAmountTo, setSwapAmountTo]  = useState(0)


  useEffect(() => {
    setSwapAmountTo(() => info?.commission !== undefined ? (swapAmountFrom > info.commission ? Number((swapAmountFrom - info.commission).toFixed(2)) : 0) : 0)
  }, [swapAmountFrom])
  
  useEffect(() => {console.log(selectedChains)}, [authenticated, selectedChains.from, selectedChains.to])

  useEffect(() => {
    if (info?.activeBridge) setSwapModalOpen(() => true)
  }, [info])

  const onSwitch = () => {
    let lastSelectedChainFrom = selectedChains?.from
    let lastSelectedChainTo = selectedChains?.to

    if (isNaN(lastSelectedChainFrom) || isNaN(lastSelectedChainTo)) return

    setSelectedChains(() => ({ from: lastSelectedChainTo, to: lastSelectedChainFrom }))
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 gap-4 sm:gap-10">
      <ChainsModal open={chainsModalOpen} setOpen={setChainsModalOpen} onSwitch={onSwitch} selectingChain={selectingChain} setSelectingChain={setSelectingChain} />
      <SwapModal open={swapModalOpen} setOpen={setSwapModalOpen} amount={swapAmountFrom} />

      <div className="display flex gap-4">
        <Image src={NotificationIcon} alt="Notification" />
        <p className="text-[18px] text-center">Transfer from/to Polygon zkEVM is temporarily paused due to the planned network infrastructure migration. Service will resume as soon as it is done.</p>
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
                    <CardBody className="flex flex-col items-center text-white overflow-hidden gap-5 min-h-full p-6">
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex items-center gap-5">
                            <span>
                              From
                            </span>
                            <Button onClick={() => {
                              setSelectingChain(() => "from")
                              setChainsModalOpen(() => true)
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
                                <div className="relative w-[70px] pointer-events-none flex items-center justify-end">
                                  <span className="absolute top-[-38px] text-[14px] text-third truncate">Max: {info?.maxAmount ?? "..."}</span>
                                  <span className="text-white text-small">{chains[selectedChains.from].token}</span>
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
                                setChainsModalOpen(() => true)
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
                                label="Send:"
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
                                    <span className="absolute top-[-38px] text-[14px] text-third truncate">Max: {info?.maxAmount ?? "..."}</span>
                                    <span className="text-white text-small">{chains[selectedChains.to].token}</span>
                                  </div>
                                }
                              />
                          </div>
                        </div>
                        
                        <Button className="w-full bg-white font-medium text-[18px] p-10" onClick={() => {
                           if ((!isConnected || localStorage.getItem('token')) && openConnectModal) {
                            openConnectModal()
                          } else {
                            swapAmountFrom < 5000 ? toast.error("Минимальная сумма бриджа - 5000") : setSwapModalOpen(() => true)
                          }
                        }}>
                          {(authenticated == 'loading' || authenticated === null) ? <CircularProgress color="default" aria-label="Loading..." /> : authenticated =='authenticated' ? "Swap" : "Connect Wallet"}
                        </Button>
                    </CardBody>
                  </Card>
                </Tab>
                <Tab key="liquidity" title="Liquidity">
                  
                </Tab>
                <Tab key="history" className="lg:hidden w-[110px]" title={<Image src={selected == 'history' ? HistoryIcon : HistoryLightIcon} alt="History" />}>
                  
                </Tab>
              </Tabs>
        </div>
        <div className="hidden lg:flex flex-1 justify-end gap-3">
            <Button className="flex place-items-center font-medium text-[18px] gap-[10px] text-white bg-primary p-6">
              <Image src={HistoryLightIcon} alt="History" />
              History
            </Button>
            <Button className="flex place-items-center font-medium text-[18px] text-primary bg-white p-6" onClick={() => {
                if ((!isConnected || localStorage.getItem('token')) && openConnectModal) {
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
