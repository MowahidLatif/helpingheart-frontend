import React from "react";
import { useNavigate } from "react-router-dom";

const CreateCampaignPage = () => {
  const navigate = useNavigate();

  const handleSubmit = async () => {
    // e.preventDefault();
    // const newCampaign = {
    //   title,
    //   description,
    //   goal_amount,
    //   layout_type
    // };

    // Simulate POST to backend and get new campaign
    // const response = await axios.post("/api/campaigns", newCampaign);
    // const campaignId = response.data.id;

    // navigate(`/campaign/layout-builder/${campaignId}`);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Create a New Campaign</h1>
      <p>
        Fill out the basic details to start building your donation campaign.
      </p>

      <form>
        <label>
          Campaign Title:
          <input type="text" placeholder="e.g. Save the Rainforest" />
        </label>
        <br />
        <br />

        <label>
          Campaign Description:
          <textarea
            placeholder="Describe your cause and how donations will help..."
            rows={5}
          />
        </label>
        <br />
        <br />

        <label>
          Goal Amount:
          <input type="number" placeholder="e.g. 5000" />
        </label>
        <br />
        <br />

        <label>
          Choose Layout Type:
          <select>
            <option value="basic">Basic</option>
            <option value="media-heavy">Media-Focused</option>
            <option value="testimonial">Testimonial Style</option>
          </select>
        </label>
        <br />
        <br />

        <button type="submit">Continue to Layout Editor</button>
      </form>
    </div>
  );
};

export default CreateCampaignPage;
