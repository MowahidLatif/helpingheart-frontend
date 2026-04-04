import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./api";

describe("getErrorMessage", () => {
  it("returns backend error when provided", () => {
    const err = new AxiosError("Request failed");
    err.response = {
      data: { error: "Campaign not found" },
      status: 404,
      statusText: "Not Found",
      headers: {},
      config: {} as never,
    };
    expect(getErrorMessage(err)).toBe("Campaign not found");
  });

  it("returns generic message for unknown values", () => {
    expect(getErrorMessage({})).toBe("An unknown error occurred");
  });
});
