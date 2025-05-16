import { useNavigate } from "react-router-dom";

type CampaignDetailsProps = {
  campaign: any;
};

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaign }) => {
  const navigate = useNavigate();

  if (!campaign) return <p>Select a campaign to view details.</p>;

  const handlePublish = () => {
    navigate("/preview", { state: { campaignId: campaign.campaign_id } });
  };

  return (
    <div>
      <h2>{campaign.name}</h2>
      <button onClick={handlePublish}>Publish</button>
      <p>{campaign.description}</p>
      <p>Goal: ${campaign.goal_amount}</p>
    </div>
  );
};

export default CampaignDetails;
