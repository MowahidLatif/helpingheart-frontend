import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState("draft");
  const [giveawayPrize, setGiveawayPrize] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: any = {
        title: title.trim(),
        goal: parseFloat(goal) || 0,
        status,
      };
      if (giveawayPrize) {
        payload.giveaway_prize_cents = Math.round(parseFloat(giveawayPrize) * 100);
      }

      const response = await api.post(API_ENDPOINTS.campaigns.create, payload);
      const campaignId = response.data.id;
      navigate(`/campaign/page-layout/${campaignId}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Create a New Campaign</h1>
      <p>
        Fill out the basic details to start building your donation campaign.
      </p>

      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>
          Campaign Title:
          <input
            type="text"
            placeholder="e.g. Save the Rainforest"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <br />
        <br />

        <label>
          Goal Amount ($):
          <input
            type="number"
            placeholder="e.g. 5000"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            min="0"
            step="0.01"
          />
        </label>
        <br />
        <br />

        <label>
          Giveaway Prize (optional, $):
          <input
            type="number"
            placeholder="e.g. 1000"
            value={giveawayPrize}
            onChange={(e) => setGiveawayPrize(e.target.value)}
            min="0"
            step="0.01"
          />
        </label>
        <br />
        <br />

        <label>
          Status:
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </label>
        <br />
        <br />

        <button type="submit" disabled={loading || !title.trim()}>
          {loading ? "Creating..." : "Continue to Layout Editor"}
        </button>
      </form>
    </div>
  );
};

export default CreateCampaignPage;
