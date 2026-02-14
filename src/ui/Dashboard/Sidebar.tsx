import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  status: string;
  total_raised: number;
  giveaway_prize_cents?: number;
};

type SidebarProps = {
  onSelectCampaign: (campaign: Campaign | null) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onSelectCampaign }) => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(API_ENDPOINTS.campaigns.list);
      setCampaigns(response.data);
    } catch (err) {
      const errMsg = getErrorMessage(err);
      console.error('Failed to load campaigns:', errMsg);
      setError(errMsg);
      // Don't redirect on error - let ProtectedRoute handle auth
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <button onClick={() => navigate("/campaign/new")} style={{ marginBottom: "1rem" }}>
        ➕ Add Campaign
      </button>
      <h2>Campaigns</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && campaigns.length === 0 ? (
        <p>No campaigns yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {campaigns.map((c) => (
            <li
              key={c.id}
              onClick={() => onSelectCampaign(c)}
              style={{
                cursor: "pointer",
                marginBottom: "0.5rem",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <strong>{c.title}</strong>
              <br />
              <small>
                ${c.total_raised || 0} / ${c.goal} · {c.status}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
