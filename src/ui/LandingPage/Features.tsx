import React from "react";
import { Link } from "react-router-dom";
import { IconLaunch } from "@/ui/Icons/IconLaunch";
import { IconAISite } from "@/ui/Icons/IconAISite";
import { IconPayments } from "@/ui/Icons/IconPayments";
import { IconLiveFeed } from "@/ui/Icons/IconLiveFeed";
import { IconShare } from "@/ui/Icons/IconShare";
import { IconAnalytics } from "@/ui/Icons/IconAnalytics";
import { IconTeam } from "@/ui/Icons/IconTeam";
import { IconEmbed } from "@/ui/Icons/IconEmbed";

const FEATURES = [
  {
    icon: <IconLaunch />,
    title: "Campaign live in minutes",
    description:
      "Fill in a title, goal, and description. Your campaign page is live on your own subdomain the moment you publish. No designer, no developer.",
  },
  {
    icon: <IconAISite />,
    title: "AI-generated campaign site",
    description:
      "Describe your cause or paste your organization's URL. HelpingHandsFund's AI builds a fully styled campaign site — hero, story, media, donate button — in seconds.",
  },
  {
    icon: <IconPayments />,
    title: "Stripe Connect payouts",
    description:
      "Donors pay by card, Apple Pay, or Google Pay. Funds go directly to your connected Stripe account. No platform holds your money.",
  },
  {
    icon: <IconLiveFeed />,
    title: "Live donation feed",
    description:
      "Every donation appears on your campaign page the moment it clears. Donors see momentum building in real time, which drives more giving.",
  },
  {
    icon: <IconShare />,
    title: "Your own subdomain",
    description:
      "Your organization gets a permanent home at yourname.helpinghands.ca. Every campaign you run lives under that address.",
  },
  {
    icon: <IconAnalytics />,
    title: "Campaign analytics",
    description:
      "Track total raised, donor count, and per-campaign progress from a single dashboard. Export your donor list as CSV any time.",
  },
  {
    icon: <IconTeam />,
    title: "Team & permissions",
    description:
      "Invite staff or volunteers with owner, admin, or member roles. Control who can create campaigns, post updates, or manage tasks.",
  },
  {
    icon: <IconEmbed />,
    title: "Embeddable progress widget",
    description:
      "One iframe snippet adds a live donation progress bar to any external website — your org's homepage, a blog post, anywhere.",
  },
  {
    icon: <IconLaunch />,
    title: "Giveaway engine",
    description:
      "Attach a prize to any campaign and draw a winner from your donor list when you're ready. The announcement posts on the campaign page automatically.",
  },
];

const Features: React.FC = () => {
  return (
    <section className="landing-section landing-features">
      <div className="container">
        <div className="landing-section__title">
          <h2>Built for organizations that need results, not complexity.</h2>
          <p>
            Every feature is purpose-built for fundraising — nothing you don't need, everything you do.
          </p>
        </div>

        <div className="landing-features__grid">
          {FEATURES.map((feature, index) => (
            <div key={index} className="landing-feature-card">
              <div className="landing-feature-card__icon">{feature.icon}</div>
              <h3 className="landing-feature-card__title">{feature.title}</h3>
              <p className="landing-feature-card__description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-xl">
          <Link to="/signup" className="btn btn-secondary btn-lg">
            Create your first campaign
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;
