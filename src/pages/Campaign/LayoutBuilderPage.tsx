import React from "react";
import { useParams } from "react-router-dom";

export default function LayoutBuilderPage() {
  const { campaignId } = useParams();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Layout Builder</h1>
      <p>
        Editing layout for campaign ID: <strong>{campaignId}</strong>
      </p>

      {/* You can later fetch the campaign data using this ID */}
      {/* e.g., useQuery(["campaign", campaignId], fetchCampaign) */}
    </div>
  );
}
