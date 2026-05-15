import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { Campaign } from "@/ui/DonateBlocks/BlockRenderer";
import { DonationModal } from "@/components/DonationModal/DonationModal";
import { AiSiteRenderer } from "@/ui/AiSite/AiSiteRenderer";
import { getDonatePresetsFromRecipe, parseAiSiteRecipeFromDb } from "@/lib/aiSiteRecipe";
import { notifyError } from "@/lib/notifications";

const DEFAULT_PRESETS = [5, 10, 25, 50, 100];

function getPresetAmounts(campaign: Campaign | null): number[] {
  const recipe = parseAiSiteRecipeFromDb(campaign?.ai_site_recipe);
  if (recipe) return getDonatePresetsFromRecipe(recipe);
  return DEFAULT_PRESETS;
}

export default function PreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const campaignId: string | undefined = location.state?.campaignId;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!campaignId) {
      setError("No campaign selected. Go to Dashboard and click a campaign to preview.");
      setLoading(false);
      return;
    }
    api
      .get(API_ENDPOINTS.campaigns.public(campaignId))
      .then((res) => {
        setCampaign(res.data);
        setError("");
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        notifyError(err, "Failed to load campaign preview.");
      })
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (loading) {
    return (
      <div className="preview-page">
        <p>Loading preview…</p>
      </div>
    );
  }

  if (error || !campaignId || !campaign) {
    return (
      <div className="preview-page">
        <h1>Preview Campaign</h1>
        <p className="preview-error">{error || "Campaign not found."}</p>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    );
  }

  const presets = getPresetAmounts(campaign);
  const aiRecipe = parseAiSiteRecipeFromDb(campaign.ai_site_recipe);

  return (
    <div className="preview-page">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.5rem",
          borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb",
        }}
      >
        <button onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
        <span style={{ fontWeight: 600 }}>Previewing: {campaign.title}</span>
        <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>This is a preview</span>
      </div>

      <div className="donate-page donate-page-blocks">
        {aiRecipe ? (
          <AiSiteRenderer
            campaign={campaign}
            recipe={aiRecipe}
            onDonateClick={() => setModalOpen(true)}
            stickyDonate={false}
          />
        ) : (
          <p style={{ padding: "2rem", color: "#6b7280" }}>
            No AI site has been generated for this campaign yet. Use the AI site builder to create one.
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
    </div>
  );
}
