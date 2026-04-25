import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { getTenantOrgSubdomainFromHost } from "@/lib/hostTenant";
import { BlockRenderer, Campaign } from "@/ui/DonateBlocks/BlockRenderer";
import { DonationModal } from "@/components/DonationModal/DonationModal";
import { AiSiteRenderer } from "@/ui/AiSite/AiSiteRenderer";
import {
  getDonatePresetsFromRecipe,
  getSeoDescriptionFromRecipe,
  parseAiSiteRecipeFromDb,
} from "@/lib/aiSiteRecipe";
import { useCampaignLiveTotals } from "@/lib/useCampaignLiveTotals";
import { notifyError } from "@/lib/notifications";

const DEFAULT_PRESETS = [5, 10, 25, 50, 100];

function getPresetAmounts(campaign: Campaign | null): number[] {
  const recipe = parseAiSiteRecipeFromDb(campaign?.ai_site_recipe);
  if (recipe) return getDonatePresetsFromRecipe(recipe);
  if (!campaign?.page_layout?.blocks) return DEFAULT_PRESETS;
  const donateBlock = campaign.page_layout.blocks.find((b) => b.type === "donate_button");
  const presets = donateBlock?.props?.preset_amounts;
  if (Array.isArray(presets) && presets.length > 0) {
    return presets.filter((n) => typeof n === "number" && n > 0);
  }
  return DEFAULT_PRESETS;
}

export default function DonatePage() {
  const { org, slug, campaignId, siteSlug } = useParams<{
    org?: string;
    slug?: string;
    campaignId?: string;
    siteSlug?: string;
  }>();
  const orgResolved = org ?? getTenantOrgSubdomainFromHost() ?? undefined;
  const slugResolved = slug ?? siteSlug ?? undefined;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (orgResolved && slugResolved) {
      api
        .get(API_ENDPOINTS.campaigns.publicByOrgSlug(orgResolved, slugResolved))
        .then((res) => {
          setCampaign(res.data);
          setError("");
        })
        .catch((err) => {
          setError(getErrorMessage(err));
          notifyError(err, "Failed to load campaign.");
        })
        .finally(() => setLoading(false));
    } else if (campaignId) {
      api
        .get(API_ENDPOINTS.campaigns.public(campaignId))
        .then((res) => {
          setCampaign(res.data);
          setError("");
        })
        .catch((err) => {
          setError(getErrorMessage(err));
          notifyError(err, "Failed to load campaign.");
        })
        .finally(() => setLoading(false));
    } else {
      setError("Missing campaign");
      setLoading(false);
    }
  }, [orgResolved, slugResolved, campaignId]);

  useCampaignLiveTotals(campaign?.id, Boolean(campaign?.id), (patch) => {
    setCampaign((prev) =>
      prev ? { ...prev, total_raised: patch.total_raised } : prev,
    );
  });

  const presets = getPresetAmounts(campaign);
  const aiRecipe = parseAiSiteRecipeFromDb(campaign?.ai_site_recipe);
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const stripeConfigured = stripeKey && stripeKey.startsWith("pk_");

  const seo = useMemo(() => {
    if (!campaign) return null;
    const recipe = parseAiSiteRecipeFromDb(campaign.ai_site_recipe);
    const titleBase = campaign.title?.trim() || "Campaign";
    const title = `${titleBase} · Donate`;
    const fromRecipe = getSeoDescriptionFromRecipe(recipe);
    const description =
      fromRecipe || `Support ${titleBase}. Make a secure donation.`;
    const canonical =
      typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
    return { title, description, canonical };
  }, [campaign]);

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
      {seo ? (
        <Helmet>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
          <meta property="og:title" content={seo.title} />
          <meta property="og:description" content={seo.description} />
          <meta property="og:type" content="website" />
          {seo.canonical ? <link rel="canonical" href={seo.canonical} /> : null}
          <meta name="twitter:card" content="summary" />
        </Helmet>
      ) : null}
      {/* Missing, corrupt, or invalid ai_site_recipe parses as null → classic blocks (defaultBlocks if no page_layout). */}
      {aiRecipe ? (
        <AiSiteRenderer
          campaign={campaign}
          recipe={aiRecipe}
          onDonateClick={() => setModalOpen(true)}
        />
      ) : (
        <BlockRenderer campaign={campaign} onDonateClick={() => setModalOpen(true)} />
      )}
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
