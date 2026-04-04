import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { DonationModal } from "./DonationModal";

const postMock = vi.fn();

vi.mock("@/lib/api", () => ({
  default: { post: (...args: unknown[]) => postMock(...args) },
  getErrorMessage: (err: unknown) =>
    err instanceof Error ? err.message : "Unknown error",
}));

describe("DonationModal", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("disables donate until a valid amount is selected", () => {
    render(
      <DonationModal
        open
        onClose={() => {}}
        campaignId="camp_123"
        campaignTitle="Save Oceans"
      />
    );

    expect(screen.getByRole("button", { name: /Donate/i })).toBeDisabled();
  });

  it("creates checkout once amount is selected", async () => {
    postMock.mockResolvedValue({
      data: { donation_id: "don_1", clientSecret: "pi_123_secret_123" },
    });
    const user = userEvent.setup();

    render(
      <DonationModal
        open
        onClose={() => {}}
        campaignId="camp_123"
        campaignTitle="Save Oceans"
      />
    );

    await user.click(screen.getByRole("button", { name: "$25" }));
    await user.click(screen.getByRole("button", { name: "Donate $25.00" }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledTimes(1);
    });
  });
});
