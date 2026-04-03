import { useMemo } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router, useRoutes, useLocation } from "react-router-dom";
import NavBar from "@/ui/NavBar";
import AuthenticatedNavBar from "@/ui/AuthenticatedNavBar";
import Footer from "@/ui/Footer";
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

  const showFooter = showNav && !isAuthenticated;

  return (
    <>
      {showNav && (isAuthenticated ? <AuthenticatedNavBar /> : <NavBar />)}
      <AppRoutesWrapper />
      {showFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;
