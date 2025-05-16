import { useLocation } from "react-router-dom";

const PreviewPage = () => {
  const location = useLocation();
  const campaign_id = location.state?.campaignId;

  // Optional: fetch full campaign data using this ID
  // with axios/React Query and render the preview

  return (
    <div>
      <h1>Preview Campaign</h1>
      <p>Campaign ID: {campaign_id}</p>
    </div>
  );
};

export default PreviewPage;
