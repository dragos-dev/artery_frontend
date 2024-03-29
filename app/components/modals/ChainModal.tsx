import { chains } from "@/app/chains";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAtom } from "jotai";
import { selectedChainsStatusAtom } from "@/lib/atom";

interface IChainsModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onSwitch: () => void;
    selectingChain: "from" | "to" | "none";
    setSelectingChain: React.Dispatch<React.SetStateAction<"none" | "from" | "to">>;
}

const ChainsModal = ({ open, setOpen, onSwitch, selectingChain, setSelectingChain }: IChainsModalProps) => {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [selectedChains, setSelectedChains] = useAtom(selectedChainsStatusAtom)

    useEffect(() => {
        if (open) onOpen()
        if (!isOpen) setOpen(() => false)
    }, [open, isOpen])

    return <Modal 
    isOpen={isOpen} 
    placement={"bottom-center"}
    classNames={{
      closeButton: "hidden sm:block z-[1]"
    }}
    className="bg-primary rounded-b-none m-0 sm:rounded-b-2xl overflow-visible"
    onOpenChange={onOpenChange} 
  >
    <ModalContent>
      {(onClose) => (
        <div className="relative">
          <div className="sm:hidden absolute left-0 right-0 mx-auto top-[-14px] w-[40px] h-[6px] bg-white rounded-[4px]"></div>
          <ModalHeader className="flex flex-col gap-1 text-2xl text-center">Select source chain</ModalHeader>
          <ModalBody className="flex flex-row justify-center gap-4 p-8">
            {chains.map(chain => <Button 
              key={chain.network}
              className="flex flex-col items-start bg-secondary p-4 justify-between w-[133px] h-[147px] rounded-[12px]"
              onClick={() => {
                const chainIndex = chains.indexOf(chain)
                switch(selectingChain) {
                  case "from": 
                    if (chainIndex == selectedChains.to) {
                      onSwitch()
                      break
                    }
                    setSelectedChains(prev => ({ ...prev, from: chainIndex }))
                    break
                  case "to": 
                    if (chainIndex == selectedChains.from) {
                      onSwitch()
                      break
                    }
                    setSelectedChains(prev => ({ ...prev, to: chainIndex }))
                    break
                }
                setSelectingChain(() => "none")
                onClose()
              }}>
              <Image src={chain.icon} alt="Network" height={36} width={36} className="flex-1 bg-white max-h-[36px] rounded-full" />
              <span className="text-white font-medium text-[18px] text-start text-wrap max-w-full">
                {chain.name}
              </span>
            </Button>)}
            
          </ModalBody>
        </div>
      )}
    </ModalContent>
  </Modal>
}

export default ChainsModal