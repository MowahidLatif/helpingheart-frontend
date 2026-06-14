import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { getTenantOrgSubdomainFromHost } from "@/lib/hostTenant";
import type { Campaign } from "@/ui/DonateBlocks/BlockRenderer";
import { DonationModal } from "@/components/DonationModal/DonationModal";
import { AiSiteRenderer } from "@/ui/AiSite/AiSiteRenderer";
import { AiSiteIframeRenderer } from "@/ui/AiSite/AiSiteIframeRenderer";
import {
  getIframeBundleContent,
  getDonatePresetsFromRecipe,
  getSeoDescriptionFromRenderModel,
  parseAiSiteRenderModelFromDb,
} from "@/lib/aiSiteRecipe";
import { useCampaignLiveTotals } from "@/lib/useCampaignLiveTotals";
import { notifyError } from "@/lib/notifications";

const DEFAULT_PRESETS = [5, 10, 25, 50, 100];

function getPresetAmounts(campaign: Campaign | null): number[] {
  const model = parseAiSiteRenderModelFromDb(campaign?.ai_site_recipe);
  if (model?.type === "dsl") return getDonatePresetsFromRecipe(model.recipe);
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
  const [liveRaffleEntryCount, setLiveRaffleEntryCount] = useState<number | null>(null);
  const [campaignPhase, setCampaignPhase] = useState<"active" | "closing" | "completed">("active");

  useEffect(() => {
    if (orgResolved && slugResolved) {
      api
        .get(API_ENDPOINTS.campaigns.publicByOrgSlug(orgResolved, slugResolved))
        .then((res) => {
          setCampaign(res.data);
          setError("");
          const s = (res.data?.status || "").toLowerCase();
          if (s === "closing") setCampaignPhase("closing");
          else if (s === "completed") setCampaignPhase("completed");
          else setCampaignPhase("active");
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
          const s = (res.data?.status || "").toLowerCase();
          if (s === "closing") setCampaignPhase("closing");
          else if (s === "completed") setCampaignPhase("completed");
          else setCampaignPhase("active");
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

  useCampaignLiveTotals(
    campaign?.id,
    Boolean(campaign?.id),
    (patch) => {
      setCampaign((prev) =>
        prev ? { ...prev, total_raised: patch.total_raised } : prev,
      );
    },
    () => setLiveRaffleEntryCount((c) => (c ?? 0) + 1),
    () => setCampaignPhase("closing"),
    () => setCampaignPhase("completed"),
  );

  const presets = getPresetAmounts(campaign);
  const renderModel = parseAiSiteRenderModelFromDb(campaign?.ai_site_recipe);
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const stripeConfigured = stripeKey && stripeKey.startsWith("pk_");

  const seo = useMemo(() => {
    if (!campaign) return null;
    const titleBase = campaign.title?.trim() || "Campaign";
    const title = `${titleBase} · Donate`;
    const fromRecipe = getSeoDescriptionFromRenderModel(renderModel);
    const description =
      fromRecipe || `Support ${titleBase}. Make a secure donation.`;
    const canonical =
      typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
    return { title, description, canonical };
  }, [campaign, renderModel]);

  const status = (campaign?.status ?? "").toLowerCase();
  const isPubliclyVisible = status === "active" || status === "closing" || status === "completed";

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

  if (!isPubliclyVisible) {
    return (
      <div className="donate-page">
        <p className="donation-error">
          This campaign is not published yet.
        </p>
      </div>
    );
  }

  return (
    <div className="donate-page donate-page-blocks">
      {campaignPhase === "closing" && (
        <div style={{
          background: "#fff7e6",
          border: "1px solid #ffd591",
          borderRadius: 8,
          padding: "0.75rem 1.25rem",
          margin: "1rem 0",
          textAlign: "center",
          fontSize: 14,
          color: "#874d00",
        }}>
          This campaign has ended — finalizing results (up to 15 minutes)&hellip;
        </div>
      )}
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
      {renderModel?.type === "dsl" ? (
        <AiSiteRenderer
          campaign={campaign}
          recipe={renderModel.recipe}
          onDonateClick={campaignPhase === "closing" ? () => undefined : () => setModalOpen(true)}
          liveRaffleEntryCount={liveRaffleEntryCount}
        />
      ) : renderModel?.type === "iframeBundle" ? (
        (() => {
          const content = getIframeBundleContent(renderModel.bundle, {
            publicView: true,
            allowDraftFallback: false,
          });
          if (!content) {
            return (
              <p className="donation-error">
                This campaign website is not published yet.
              </p>
            );
          }
          return (
            <AiSiteIframeRenderer
              bundle={renderModel.bundle}
              content={content}
              onDonateClick={() => setModalOpen(true)}
              title={`${campaign.title || "Campaign"} AI site`}
            />
          );
        })()
      ) : (
        <p className="donation-error">
          This campaign page is not ready yet. The organizer hasn&apos;t generated their site.
        </p>
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
