import { BrowserRouter as Router, useRoutes, useLocation } from "react-router-dom";
import NavBar from "@/ui/NavBar";
import AuthenticatedNavBar from "@/ui/AuthenticatedNavBar";
import { routes } from "@/routes/AppRoutes";

function AppRoutesWrapper() {
  const routing = useRoutes(routes);
  return routing;
}

function AppContent() {
  const isAuthenticated = localStorage.getItem("token") !== null;
  const location = useLocation();
  const isEmbed = location.pathname.startsWith("/embed");

  return (
    <>
      {!isEmbed && (isAuthenticated ? <AuthenticatedNavBar /> : <NavBar />)}
      <AppRoutesWrapper />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
