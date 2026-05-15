import React from "react";
import { Link } from "react-router-dom";
import { IconLiveFeed } from "@/ui/Icons/IconLiveFeed";
import { IconAISite } from "@/ui/Icons/IconAISite";
import { IconPayments } from "@/ui/Icons/IconPayments";
import { IconShare } from "@/ui/Icons/IconShare";
import { IconEmbed } from "@/ui/Icons/IconEmbed";
import { IconTeam } from "@/ui/Icons/IconTeam";

const BADGES = [
  { icon: <IconLiveFeed size={18} />, label: "Real-time donation feed" },
  { icon: <IconAISite size={18} />, label: "AI-generated campaign site" },
  { icon: <IconPayments size={18} />, label: "Stripe-powered payouts" },
  { icon: <IconShare size={18} />, label: "Custom org subdomain" },
  { icon: <IconEmbed size={18} />, label: "Embeddable progress widget" },
  { icon: <IconTeam size={18} />, label: "Team roles & permissions" },
];

const Hero: React.FC = () => {
  return (
    <section className="landing-hero">
      <div className="container">
        <div className="landing-hero__content">
          <h1 className="landing-hero__title">
            Launch a fundraising campaign that gets funded.
          </h1>
          <p className="landing-hero__subtitle">
            HelpingHandsFund gives nonprofits and community organizers an
            AI-built campaign page, live donation tracking, and Stripe payouts
            — with no monthly subscription.
          </p>

          <div className="landing-hero__cta">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start your campaign
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary btn-lg">
              See how it works
            </Link>
          </div>

          <div className="landing-hero__features">
            {BADGES.map((b) => (
              <span key={b.label} className="landing-hero__feature-badge">
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
