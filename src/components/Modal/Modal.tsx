import React from "react";
import { Modal as AntdModal } from "antd";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <AntdModal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable
      destroyOnHidden
      centered
    >
      {children}
    </AntdModal>
  );
};

export default Modal;
