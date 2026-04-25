import { Input, Modal } from "antd";
import React from "react";

type ConfirmOptions = {
  title: string;
  content: React.ReactNode;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
};

export async function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      title: options.title,
      content: options.content,
      okText: options.okText ?? "Confirm",
      cancelText: options.cancelText ?? "Cancel",
      okButtonProps: options.danger ? { danger: true } : undefined,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

type PromptOptions = {
  title: string;
  placeholder?: string;
  okText?: string;
  cancelText?: string;
};

export async function promptForText(options: PromptOptions): Promise<string> {
  return new Promise<string>((resolve) => {
    let value = "";
    Modal.confirm({
      title: options.title,
      content: (
        <Input
          placeholder={options.placeholder ?? ""}
          onChange={(event) => {
            value = event.target.value;
          }}
          autoFocus
        />
      ),
      okText: options.okText ?? "Submit",
      cancelText: options.cancelText ?? "Cancel",
      onOk: () => resolve(value.trim()),
      onCancel: () => resolve(""),
    });
  });
}
