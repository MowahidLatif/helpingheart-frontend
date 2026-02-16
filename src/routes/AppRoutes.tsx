import { RouteObject } from "react-router-dom";
import SignUp from "@/pages/SignUp/SignUp";
import SettingsPage from "@/pages/Setting/SettingsPage";
import SignIn from "@/pages/SignIn/SignIn";
import HomePage from "@/pages/Home/HomePage";
import LandingPage from "@/pages/Landing/LandingPage";
import HowItWorks from "@/pages/HowItWorks/HowItWorks";
import Pricing from "@/pages/Pricing/Pricing";
import About from "@/pages/About/About";
import FAQ from "@/pages/FAQ/FAQ";
import Contact from "@/pages/Contract/Contact";
import Dashboard from "@/pages/Dashboard/DashboardPage";
import DashboardLayout from "@/ui/Dashboard/DashboardLayout";
import OrgUsersPage from "@/pages/OrgUsers/OrgUsersPage";
import ResetCredentials from "@/pages/ResetCredentials/ResetCredentials";
import PreviewPage from "@/pages/Preview/Preview";
import DonatePage from "@/pages/Donate/DonatePage";
import ThankYouPage from "@/pages/Donate/ThankYouPage";
import CreateCampaignPage from "@/pages/Campaign/CreateCampaignPage";
import LayoutBuilderPage from "@/pages/Campaign/LayoutBuilderPage";
import PageLayoutBuilder from "@/pages/Campaign/PageLayoutBuilder";
import ProtectedRoute from "@/components/ProtectedRoute";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/SignIn",
    element: <SignIn />,
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
      { path: "users", element: <OrgUsersPage /> },
    ],
  },
  {
    path: "/reset-credentials",
    element: <ResetCredentials />,
  },
  {
    path: "/preview",
    element: <PreviewPage />,
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
      <ProtectedRoute>
        <CreateCampaignPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/campaign/layout-builder/:campaignId",
    element: (
      <ProtectedRoute>
        <LayoutBuilderPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/campaign/page-layout/:campaignId",
    element: (
      <ProtectedRoute>
        <PageLayoutBuilder />
      </ProtectedRoute>
    ),
  },
];
