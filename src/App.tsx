import { useMemo } from "react";
import { App as AntdApp, ConfigProvider } from "antd";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router, useRoutes, useLocation } from "react-router-dom";
import NavBar from "@/ui/NavBar";
import AuthenticatedNavBar from "@/ui/AuthenticatedNavBar";
import Footer from "@/ui/Footer";
import { routes, tenantPublicOnlyRoutes } from "@/routes/AppRoutes";
import { getTenantOrgSubdomainFromHost } from "@/lib/hostTenant";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import { antdTheme } from "@/lib/antdTheme";

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
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
        <div className="hh-app">
          <HelmetProvider>
            <Router>
              <AppErrorBoundary>
                <AppContent />
              </AppErrorBoundary>
            </Router>
          </HelmetProvider>
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
