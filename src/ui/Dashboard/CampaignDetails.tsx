type CampaignDetailsProps = {
    campaign: any;
  };
  
  const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaign }) => {
    if (!campaign) return <p>Select a campaign to view details.</p>;
  
    return (
      <div>
        <h2>{campaign.name}</h2>
        <p>{campaign.description}</p>
        <p>Goal: ${campaign.goal_amount}</p>
      </div>
    );
  };
  
  export default CampaignDetails