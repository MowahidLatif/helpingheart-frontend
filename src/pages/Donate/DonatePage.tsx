import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { BlockRenderer, Campaign } from "@/ui/DonateBlocks/BlockRenderer";
import { DonationModal } from "@/components/DonationModal/DonationModal";

const DEFAULT_PRESETS = [5, 10, 25, 50, 100];

function getPresetAmounts(campaign: Campaign | null): number[] {
  if (!campaign?.page_layout?.blocks) return DEFAULT_PRESETS;
  const donateBlock = campaign.page_layout.blocks.find((b) => b.type === "donate_button");
  const presets = donateBlock?.props?.preset_amounts;
  if (Array.isArray(presets) && presets.length > 0) {
    return presets.filter((n) => typeof n === "number" && n > 0);
  }
  return DEFAULT_PRESETS;
}

export default function DonatePage() {
  const { org, slug, campaignId } = useParams<{
    org?: string;
    slug?: string;
    campaignId?: string;
  }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (org && slug) {
      api
        .get(API_ENDPOINTS.campaigns.publicByOrgSlug(org, slug))
        .then((res) => {
          setCampaign(res.data);
          setError("");
        })
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    } else if (campaignId) {
      api
        .get(API_ENDPOINTS.campaigns.public(campaignId))
        .then((res) => {
          setCampaign(res.data);
          setError("");
        })
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    } else {
      setError("Missing campaign");
      setLoading(false);
    }
  }, [org, slug, campaignId]);

  const presets = getPresetAmounts(campaign);
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const stripeConfigured = stripeKey && stripeKey.startsWith("pk_");

  if (loading) {
    return (
      <div className="donate-page">
        <p>Loading campaign…</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="donate-page">
        <p className="donation-error">{error || "Campaign not found."}</p>
      </div>
    );
  }

  if (!stripeConfigured) {
    return (
      <div className="donate-page">
        <p className="donation-error">
          Payment is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to your environment.
        </p>
      </div>
    );
  }

  return (
    <div className="donate-page donate-page-blocks">
      <BlockRenderer
        campaign={campaign}
        onDonateClick={() => setModalOpen(true)}
      />
      <DonationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        campaignId={campaign.id}
        campaignTitle={campaign.title || "Campaign"}
        presetAmounts={presets}
      />
    </div>
  );
}
