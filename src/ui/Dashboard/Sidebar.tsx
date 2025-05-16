type SidebarProps = {
  onSelectCampaign: (campaign: any) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onSelectCampaign }) => {
  const campaigns = [
    {
      title: "bill",
      goal_amount: 1000,
      description: "blank data",
    },
    {
      name: "tom",
      goal_amount: 897,
      description: "blank data",
    },
    {
      name: "jack",
      goal_amount: 587,
      description: "blank data",
    },
    {
      name: "henry",
      goal_amount: 5647,
      description: "blank data",
    },
  ];

  return (
    <div>
      <button onClick={() => console.log("open campaign modal")}>
        ➕ Add Campaign
      </button>
      <ul>
        {campaigns.map((c) => (
          <li key={c.name} onClick={() => onSelectCampaign(c)}>
            {c.goal_amount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
