import Sidebar from "@/ui/Dashboard/Sidebar";
import CampaignDetails from "@/ui/Dashboard/CampaignDetails";
import { useState } from "react";

export default function DashboardPage() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Sidebar */}
      <div style={{ width: "25%", borderRight: "1px solid #eee" }}>
        <Sidebar onSelectCampaign={setSelectedCampaign} />
      </div>

      {/* Right Main Area */}
      <div style={{ flexGrow: 1, padding: "2rem" }}>
        <CampaignDetails campaign={selectedCampaign} />
      </div>
    </div>
  );
}
