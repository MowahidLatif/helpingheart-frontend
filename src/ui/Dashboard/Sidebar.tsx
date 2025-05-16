type SidebarProps = {
  onSelectCampaign: (campaign: any) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onSelectCampaign }) => {
  const campaigns = [
    {
      name: "bill",
      goal_amount: 1000,
      description: "dfgadfasd",
      campaign_id: 1,
    },
    {
      name: "tom",
      goal_amount: 897,
      description: "zfgnsafdszvsdvCCSD",
      campaign_id: 2,
    },
    {
      name: "jack",
      goal_amount: 587,
      description: "asdhgnbfdvzszgxchnxfb",
      campaign_id: 3,
    },
    {
      name: "henry",
      goal_amount: 5647,
      description: "34567654323478765433467876543234567876543456",
      campaign_id: 4,
    },
  ];

  return (
    <div>
      <button onClick={() => console.log("open campaign modal")}>
        ➕ Add Campaign
      </button>
      <h2>Campaigns</h2>
      {campaigns.length === 0 ? (
        <p>No campaigns yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {campaigns.map((c) => (
            <li
              key={c.campaign_id}
              onClick={() => onSelectCampaign(c)}
              style={{ cursor: "pointer", marginBottom: "0.5rem" }}
            >
              {c.goal_amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
