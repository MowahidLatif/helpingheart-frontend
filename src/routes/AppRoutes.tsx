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
import ResetCredentials from "@/pages/ResetCredentials/ResetCredentials";
import PreviewPage from "@/pages/Preview/Preview";
import CreateCampaignPage from "@/pages/Campaign/CreateCampaignPage";
import LayoutBuilderPage from "@/pages/Campaign/LayoutBuilderPage";

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
    element: <Dashboard />,
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
    path: "/settings",
    element: <SettingsPage />,
  },
  {
    path: "/campaign/new",
    element: <CreateCampaignPage />,
  },
  {
    path: "/campaign/layout-builder/:campaignId",
    element: <LayoutBuilderPage />,
  },
];
