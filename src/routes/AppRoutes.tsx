import { RouteObject } from "react-router-dom";
import SignUp from "@/pages/SignUp/SignUp";
import HomePage from "@/pages/Home/HomePage";
import LandingPage from "@/pages/Landing/LandingPage";
import HowItWorks from "@/pages/HowItWorks/HowItWorks";
import Pricing from "@/pages/Pricing/Pricing";
import About from "@/pages/About/About";
import FAQ from "@/pages/FAQ/FAQ";
import Contact from "@/pages/Contract/Contact";
import Dashboard from "@/pages/Dashboard/DashboardPage";

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
];
