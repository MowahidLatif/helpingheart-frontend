import CampaignAiWizardPage from "@/pages/Campaign/CampaignAiWizardPage";

/**
 * Multi-step flow: campaign details → assets → AI prompt → generation → live preview.
 */
export default function CreateCampaignPage() {
  return <CampaignAiWizardPage mode="new" />;
}
