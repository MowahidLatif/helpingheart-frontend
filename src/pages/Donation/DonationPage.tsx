import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const UserDonationPage = () => {
  const { username } = useParams();
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    axios.get(`/api/get_page/${username}`).then((res) => {
      if (res.data.status === "success") {
        setPageData(res.data.data);
      }
    });
  }, [username]);

  if (!pageData) return <p>Loading...</p>;

  return (
    <div>
        Hello Donations Page.
    </div>
    // <div style={{ backgroundColor: pageData.theme_color }}>
    //   <img src={pageData.logo_url} alt="Logo" />
    //   <h1>{pageData.bio}</h1>
    //   <p>Goal: ${pageData.goal_amount}</p>
    //   <progress value={pageData.current_amount} max={pageData.goal_amount} />
    // </div>
  );
};

export default UserDonationPage;
