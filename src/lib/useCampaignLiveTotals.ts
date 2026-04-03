import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants";
import api from "@/lib/api";

/** Same host as API unless overridden (e.g. split deploy). */
export const SOCKET_BASE_URL =
  (import.meta.env.VITE_SOCKET_BASE_URL as string | undefined)?.trim() || API_BASE_URL;

const POLL_MS = 45_000;
const CONNECT_FALLBACK_MS = 4_000;

export type LiveTotalsPatch = {
  total_raised: number;
  donations_count?: number;
};

/**
 * Subscribes to Socket.IO `donation` events for the campaign room; falls back to
 * polling GET /api/campaigns/:id/progress when the socket is disconnected.
 */
export function useCampaignLiveTotals(
  campaignId: string | undefined,
  enabled: boolean,
  onTotals: (patch: LiveTotalsPatch) => void,
): void {
  const onTotalsRef = useRef(onTotals);
  onTotalsRef.current = onTotals;

  useEffect(() => {
    if (!campaignId || !enabled) return;

    const applyProgressPayload = (data: {
      total_raised?: number;
      donations_count?: number;
    }) => {
      if (typeof data.total_raised !== "number") return;
      onTotalsRef.current({
        total_raised: data.total_raised,
        donations_count:
          typeof data.donations_count === "number" ? data.donations_count : undefined,
      });
    };

    const fetchProgress = () => {
      api
        .get(API_ENDPOINTS.campaigns.progress(campaignId))
        .then((res) => applyProgressPayload(res.data))
        .catch(() => {
          /* ignore */
        });
    };

    let pollTimer: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => {
      if (pollTimer) return;
      fetchProgress();
      pollTimer = setInterval(fetchProgress, POLL_MS);
    };
    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const socket: Socket = io(SOCKET_BASE_URL, {
      transports: ["websocket", "polling"],
      path: "/socket.io",
    });

    const onDonation = (payload: { total_raised?: number }) => {
      if (typeof payload.total_raised === "number") {
        onTotalsRef.current({ total_raised: payload.total_raised });
      }
    };

    socket.on("connect", () => {
      stopPolling();
      socket.emit("join_campaign", { campaign_id: campaignId });
    });

    socket.on("donation", onDonation);

    socket.on("disconnect", () => {
      startPolling();
    });

    socket.on("connect_error", () => {
      startPolling();
    });

    const fallbackTimer = window.setTimeout(() => {
      if (!socket.connected) startPolling();
    }, CONNECT_FALLBACK_MS);

    return () => {
      clearTimeout(fallbackTimer);
      stopPolling();
      socket.off("donation", onDonation);
      socket.disconnect();
    };
  }, [campaignId, enabled]);
}
