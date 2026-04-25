import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { useCampaignLiveTotals } from "@/lib/useCampaignLiveTotals";
import { BlockRenderer, Campaign } from "@/ui/DonateBlocks/BlockRenderer";
import { AiSiteRenderer } from "@/ui/AiSite/AiSiteRenderer";
import { parseAiSiteRecipeFromDb } from "@/lib/aiSiteRecipe";
import { notifyError } from "@/lib/notifications";

const ALLOWED_FONTS = ["Inter", "Georgia", "Roboto", "Merriweather", "Lato"];
const DEFAULT_FONT = "Inter";

export default function FullCampaignEmbedPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams] = useSearchParams();

  const colorParam = searchParams.get("color") ?? "";
  const fontParam = searchParams.get("font") ?? DEFAULT_FONT;
  const accent = colorParam ? `#${colorParam.replace(/^#/, "")}` : null;
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

  const aiRecipe = parseAiSiteRecipeFromDb(campaign?.ai_site_recipe);

  const onDonateClick = () => {
    if (!campaignId) return;
    const url = `${window.location.origin}/donate/${campaignId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const rootStyle = [
    accent ? `--accent: ${accent};` : "",
    `font-family: '${font}', sans-serif;`,
  ]
    .filter(Boolean)
    .join(" ");

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontFamily: `'${font}', sans-serif`, fontSize: 14 }}>
        Loading campaign…
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div style={{ padding: "2rem", fontFamily: `'${font}', sans-serif`, fontSize: 14, color: "#666" }}>
        {error || "Campaign not found."}
      </div>
    );
  }

  return (
    <div style={{ minWidth: 320, boxSizing: "border-box" }}>
      {rootStyle ? <style>{`:root { ${rootStyle} }`}</style> : null}
      {aiRecipe ? (
        <AiSiteRenderer campaign={campaign} recipe={aiRecipe} onDonateClick={onDonateClick} />
      ) : (
        <BlockRenderer campaign={campaign} onDonateClick={onDonateClick} />
      )}
    </div>
  );
}
