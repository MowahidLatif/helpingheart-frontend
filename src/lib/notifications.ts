import { message } from "antd";
import { getErrorMessage } from "@/lib/api";

export function notifySuccess(content: string): void {
  message.success(content);
}

export function notifyWarn(content: string): void {
  message.warning(content);
}

export function notifyError(error: unknown, fallback = "Something went wrong"): void {
  const content =
    typeof error === "string" ? error : getErrorMessage(error) || fallback;
  message.error(content || fallback);
}
