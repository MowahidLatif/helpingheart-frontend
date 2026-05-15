import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { useCampaignLiveTotals } from "@/lib/useCampaignLiveTotals";
import type { Campaign } from "@/ui/DonateBlocks/BlockRenderer";
import { AiSiteRenderer } from "@/ui/AiSite/AiSiteRenderer";
import { AiSiteIframeRenderer } from "@/ui/AiSite/AiSiteIframeRenderer";
import { getIframeBundleContent, parseAiSiteRenderModelFromDb } from "@/lib/aiSiteRecipe";
import { notifyError } from "@/lib/notifications";

const ALLOWED_FONTS = ["Inter", "Georgia", "Roboto", "Merriweather", "Lato"];
const DEFAULT_ACCENT = "#1D9E75";
const DEFAULT_FONT = "Inter";

export default function FullCampaignEmbedPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams] = useSearchParams();

  const colorParam = searchParams.get("color") ?? "";
  const fontParam = searchParams.get("font") ?? DEFAULT_FONT;
  const accent = colorParam ? `#${colorParam.replace(/^#/, "")}` : DEFAULT_ACCENT;
  const font = ALLOWED_FONTS.includes(fontParam) ? fontParam : DEFAULT_FONT;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!campaignId) {
      setError("Missing campaign.");
      setLoading(false);
      return;
    }
    api
      .get<Campaign>(API_ENDPOINTS.campaigns.public(campaignId))
      .then((res) => {
        setCampaign(res.data);
        setError("");
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        notifyError(err, "Failed to load embed campaign.");
      })
      .finally(() => setLoading(false));
  }, [campaignId]);

  useCampaignLiveTotals(campaign?.id, Boolean(campaign?.id), (patch) => {
    setCampaign((prev) => (prev ? { ...prev, total_raised: patch.total_raised } : prev));
  });

  const renderModel = parseAiSiteRenderModelFromDb(campaign?.ai_site_recipe);
  const status = (campaign?.status ?? "").toLowerCase();
  const isPubliclyVisible = status === "active" || status === "completed";

  const onDonateClick = () => {
    if (!campaignId) return;
    const url = `${window.location.origin}/donate/${campaignId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const rootStyle = [`--hhf-accent: ${accent};`, `font-family: '${font}', sans-serif;`].join(" ");
  const containerStyle: React.CSSProperties = {
    minWidth: 320,
    boxSizing: "border-box",
    padding: "1rem",
    fontFamily: `'${font}', sans-serif`,
    fontSize: 14,
  };

  if (loading) {
    return <div style={containerStyle}>Loading…</div>;
  }

  if (error || !campaign) {
    return <div style={{ ...containerStyle, color: "#666" }}>{error || "Campaign not found."}</div>;
  }

  if (!isPubliclyVisible) {
    return <div style={{ ...containerStyle, color: "#666" }}>Campaign is not published yet.</div>;
  }

  return (
    <div style={containerStyle}>
      {rootStyle ? <style>{`:root { ${rootStyle} }`}</style> : null}
      {renderModel?.type === "dsl" ? (
        <AiSiteRenderer campaign={campaign} recipe={renderModel.recipe} onDonateClick={onDonateClick} />
      ) : renderModel?.type === "iframeBundle" ? (
        (() => {
          const content = getIframeBundleContent(renderModel.bundle, {
            publicView: true,
            allowDraftFallback: false,
          });
          if (!content) return <div style={{ color: "#666" }}>Campaign website is not published yet.</div>;
          return (
            <AiSiteIframeRenderer
              bundle={renderModel.bundle}
              content={content}
              onDonateClick={onDonateClick}
              title={`${campaign.title || "Campaign"} embed`}
            />
          );
        })()
      ) : (
        <div style={{ color: "#666", padding: "1rem" }}>This campaign has no AI site yet.</div>
      )}
    </div>
  );
}
