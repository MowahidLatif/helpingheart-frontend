import { useParams } from "react-router-dom";
import CampaignAiWizardPage from "@/pages/Campaign/CampaignAiWizardPage";

/**
 * Resume AI flow for an existing campaign (dashboard "AI site builder").
 * Opens on preview if a recipe exists; otherwise starts at assets.
 */
export default function AiSiteWizardPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  if (!campaignId) {
    return <p>Missing campaign.</p>;
  }
  return <CampaignAiWizardPage mode="resume" initialCampaignId={campaignId} />;
}
