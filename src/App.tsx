import { useMemo } from "react";
import { BrowserRouter as Router, useRoutes, useLocation } from "react-router-dom";
import NavBar from "@/ui/NavBar";
import AuthenticatedNavBar from "@/ui/AuthenticatedNavBar";
import { routes, tenantPublicOnlyRoutes } from "@/routes/AppRoutes";
import { getTenantOrgSubdomainFromHost } from "@/lib/hostTenant";

function AppRoutesWrapper() {
  const isTenantHost = useMemo(() => !!getTenantOrgSubdomainFromHost(), []);
  const routing = useRoutes(isTenantHost ? tenantPublicOnlyRoutes : routes);
  return routing;
}

function AppContent() {
  const isAuthenticated = localStorage.getItem("token") !== null;
  const location = useLocation();
  const isEmbed = location.pathname.startsWith("/embed");
  const isTenantHost = useMemo(() => !!getTenantOrgSubdomainFromHost(), []);
  const showNav = !isEmbed && !isTenantHost;

  return (
    <>
      {showNav && (isAuthenticated ? <AuthenticatedNavBar /> : <NavBar />)}
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
