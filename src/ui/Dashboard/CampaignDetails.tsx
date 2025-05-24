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
  const handleEdit = () => {
    navigate("/edit", { state: { campaignId: campaign.campaign_id } });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{campaign.name}</h2>
      <p>{campaign.description}</p>

      <div style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        <strong>🎯 Goal:</strong> ${campaign.goal_amount}
        <br />
        <strong>💰 Raised:</strong> ${campaign.total_donations || 0}
        <br />
        <strong>📈 Progress:</strong>{" "}
        {campaign.goal_amount
          ? `${(
              ((campaign.total_donations || 0) / campaign.goal_amount) *
              100
            ).toFixed(1)}%`
          : "N/A"}
        <br />
        <strong>🧍 Donors:</strong> {campaign.donor_count || 0}
        <br />
        <strong>📆 Created At:</strong> {campaign.created_at}
        <br />
        <strong>✅ Status:</strong>{" "}
        {campaign.is_completed ? "Completed" : "In Progress"}
      </div>

      <button onClick={handlePublish}>Preview & Publish</button>
      <button onClick={handleEdit}>Edit</button>

      <div style={{ marginTop: "2rem" }}>
        <h3>🧾 Recent Donations</h3>
        {campaign.recent_donations?.length > 0 ? (
          <ul>
            {campaign.recent_donations.map((d: any) => (
              <li key={d.id}>
                {d.donor_name || "Anonymous"} - ${d.amount} - {d.donated_at}
              </li>
            ))}
          </ul>
        ) : (
          <p>No donations yet.</p>
        )}
      </div>
    </div>
  );
};

export default CampaignDetails;
