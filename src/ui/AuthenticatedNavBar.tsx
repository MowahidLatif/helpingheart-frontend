import { useNavigate, Link } from "react-router-dom";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AuthenticatedNavBar = () => {
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const userName = user.name || user.email || "";
  const initials = getInitials(userName) || "U";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  return (
    <nav className="navbar navbar--auth">
      <Link to="/dashboard" className="navbar-brand">
        <span className="navbar-logo">HH</span>
        <span className="d-tablet-none">Helping Hands</span>
      </Link>
      <div className="navbar-menu">
        <Link to="/dashboard" className="navbar-link">
          Campaigns
        </Link>
        <Link to="/setting" className="navbar-link">
          Settings
        </Link>
        <div className="navbar-user">
          <span className="navbar-avatar">{initials}</span>
          <span className="d-tablet-none">{userName}</span>
        </div>
        <button type="button" className="btn btn-sm btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AuthenticatedNavBar;
