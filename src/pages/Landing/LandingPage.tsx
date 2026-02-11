import React from "react";
import HeroSection from "@/ui/LandingPage/Hero";
import Features from "@/ui/LandingPage/Features";
import HowItWorks from "@/ui/LandingPage/HowItWorks";
import SocialProof from "@/ui/LandingPage/SocialProof";
import Comparision from "@/ui/LandingPage/Comparision";
import DonationVisualization from "@/ui/LandingPage/DonationVisual";
import FAQ from "@/ui/LandingPage/FAQ";
import FinalCTA from "@/ui/LandingPage/FinalCTA";

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <HeroSection />
      <Features />
      <HowItWorks />
      <SocialProof />
      <Comparision />
      <DonationVisualization />
      <FAQ />
      <FinalCTA />
    </div>
  );
};

export default LandingPage;
