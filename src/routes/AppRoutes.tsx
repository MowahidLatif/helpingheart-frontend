import { RouteObject } from "react-router-dom";
import SignUp from "@/pages/SignUp/SignUp";
import SettingsPage from "@/pages/Setting/SettingsPage";
import BillingSuccessPage from "@/pages/Setting/BillingSuccessPage";
// import SignIn from "@/pages/SignIn/SignIn";
import LandingPage from "@/pages/Landing/LandingPage";
import WaitlistPage from "@/pages/Waitlist/WaitlistPage";
import HowItWorks from "@/pages/HowItWorks/HowItWorks";
import Pricing from "@/pages/Pricing/Pricing";
import About from "@/pages/About/About";
import FAQ from "@/pages/FAQ/FAQ";
import Contact from "@/pages/Contract/Contact";
import Dashboard from "@/pages/Dashboard/DashboardPage";
import AllTasksPage from "@/pages/Dashboard/AllTasksPage";
import DashboardLayout from "@/ui/Dashboard/DashboardLayout";
import OrgUsersPage from "@/pages/OrgUsers/OrgUsersPage";
import ResetCredentials from "@/pages/ResetCredentials/ResetCredentials";
import PreviewPage from "@/pages/Preview/Preview";
import DonatePage from "@/pages/Donate/DonatePage";
import ThankYouPage from "@/pages/Donate/ThankYouPage";
import CreateCampaignPage from "@/pages/Campaign/CreateCampaignPage";
import LayoutBuilderPage from "@/pages/Campaign/LayoutBuilderPage";
import AiSiteWizardPage from "@/pages/Campaign/AiSiteWizardPage";
import DesignStudioPage from "@/pages/Campaign/DesignStudioPage";
import TenantPublicHome from "@/pages/Campaign/TenantPublicHome";
import ProgressEmbedPage from "@/pages/Embed/ProgressEmbedPage";
import FullCampaignEmbedPage from "@/pages/Embed/FullCampaignEmbedPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import FreeEntryPage from "@/pages/Raffle/FreeEntryPage";
import ClaimPrizePage from "@/pages/Raffle/ClaimPrizePage";
import RulesPage from "@/pages/Raffle/RulesPage";

/** Routes when the SPA is served on `{org}.{VITE_PUBLIC_SITE_HOST_SUFFIX}` (public sites only). */
export const tenantPublicOnlyRoutes: RouteObject[] = [
  { path: "/", element: <TenantPublicHome /> },
  { path: "/:siteSlug", element: <DonatePage /> },
];

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <LandingPage />,
  },
  { path: "/signup", element: <SignUp /> },
  // { path: "/signin", element: <SignIn /> },
  {
    path: "/waitlist",
    element: <WaitlistPage />,
  },
  {
    path: "/how-it-works",
    element: <HowItWorks />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/faq",
    element: <FAQ />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: "users",
        element: (
          <ProtectedRoute requiredRoles={["owner", "admin"]}>
            <OrgUsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "tasks",
        element: (
          <ProtectedRoute>
            <AllTasksPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/reset-credentials",
    element: <ResetCredentials />,
  },
  {
    path: "/preview",
    element: (
      <ProtectedRoute>
        <PreviewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/embed/progress/:campaignId",
    element: <ProgressEmbedPage />,
  },
  {
    path: "/embed/full/:campaignId",
    element: <FullCampaignEmbedPage />,
  },
  {
    path: "/donate/:campaignId/thank-you",
    element: <ThankYouPage />,
  },
  {
    path: "/donate/:org/:slug",
    element: <DonatePage />,
  },
  {
    path: "/donate/:campaignId",
    element: <DonatePage />,
  },
  {
    path: "/settings/billing/success",
    element: (
      <ProtectedRoute>
        <BillingSuccessPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/campaign/new",
    element: (
      <ProtectedRoute requiredPermissions={["campaign:create"]}>
        <CreateCampaignPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/campaign/layout-builder/:campaignId",
    element: (
      <ProtectedRoute requiredPermissions={["campaign:edit"]}>
        <LayoutBuilderPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/campaign/ai-site/:campaignId",
    element: (
      <ProtectedRoute requiredPermissions={["campaign:edit"]}>
        <AiSiteWizardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/campaign/design-studio/:campaignId",
    element: (
      <ProtectedRoute requiredPermissions={["campaign:edit"]}>
        <DesignStudioPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/campaigns/:slug/raffle/free-entry",
    element: <FreeEntryPage />,
  },
  {
    path: "/campaigns/:slug/raffle/rules",
    element: <RulesPage />,
  },
  {
    path: "/raffles/claim",
    element: <ClaimPrizePage />,
  },
];
