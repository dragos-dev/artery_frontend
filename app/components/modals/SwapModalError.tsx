import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, Progress, Skeleton, useDisclosure } from "@nextui-org/react";
import Image from "next/image"
import ErrorIcon from "@/public/error.png"

interface ISwapModaErrorProps {
    open: boolean;
    onClose: () => void;
}

const SwapModalError = ({ open, onClose }: ISwapModaErrorProps) => {
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
          <ModalHeader className="flex flex-col gap-1 text-2xl text-center">Ошибка! Недостаточно средств в пуле</ModalHeader>
          <ModalBody className="flex flex-col items-center justify-center gap-8 p-8 max-w-[496px] mx-auto">
            <div className="flex flex-col gap-10 max-w-full">
                <Image src={ErrorIcon} alt="" className="w-[200px] h-[200px] sm:w-[400px] sm:h-[400px]" />
                <Button onClick={onClose} className="h-[74px] bg-white text-secondary w-full font-medium text-[18px]">
                    OK
                </Button>
            </div>
          </ModalBody>
        </div>
      )}
    </ModalContent>
  </Modal>
}

export default SwapModalError