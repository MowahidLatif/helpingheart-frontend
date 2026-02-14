import { HeroBlock } from "./HeroBlock";
import { CampaignInfoBlock } from "./CampaignInfoBlock";
import { DonateButtonBlock } from "./DonateButtonBlock";
import { TextBlock } from "./TextBlock";
import { MediaGalleryBlock } from "./MediaGalleryBlock";
import { EmbedBlock } from "./EmbedBlock";
import { FooterBlock } from "./FooterBlock";

export type LatestWinner = {
  donor: string;
  amount_cents: number;
  created_at: string;
};

export type Campaign = {
  id: string;
  title?: string;
  slug?: string;
  goal?: number;
  total_raised?: number;
  giveaway_prize_cents?: number;
  latest_winner?: LatestWinner;
  page_layout?: { blocks?: Array<{ id: string; type: string; props?: Record<string, unknown> }> };
};

export type Block = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
};

function defaultBlocks(campaign: Campaign): Block[] {
  return [
    {
      id: "hero-1",
      type: "hero",
      props: {
        title: campaign.title || "Campaign",
        subtitle: "Thank you for your support.",
      },
    },
    {
      id: "info-1",
      type: "campaign_info",
      props: { show_goal: true, show_progress_bar: true, show_donations_count: true, show_winner: true },
    },
    {
      id: "donate-1",
      type: "donate_button",
      props: { preset_amounts: [5, 10, 25, 50, 100], label: "Donate" },
    },
    {
      id: "footer-1",
      type: "footer",
      props: { show_org_name: true },
    },
  ];
}

type BlockRendererProps = {
  campaign: Campaign;
  onDonateClick: () => void;
  donationsCount?: number;
};

export function BlockRenderer({ campaign, onDonateClick }: BlockRendererProps) {
  const blocks =
    campaign.page_layout?.blocks && campaign.page_layout.blocks.length > 0
      ? campaign.page_layout.blocks
      : defaultBlocks(campaign);

  return (
    <>
      {blocks.map((block) => {
        const key = block.id;
        switch (block.type) {
          case "hero":
            return <HeroBlock key={key} block={block} campaign={campaign} />;
          case "campaign_info":
            return <CampaignInfoBlock key={key} block={block} campaign={campaign} />;
          case "donate_button":
            return (
              <DonateButtonBlock key={key} block={block} onDonateClick={onDonateClick} />
            );
          case "text":
            return <TextBlock key={key} block={block} />;
          case "media_gallery":
            return (
              <MediaGalleryBlock key={key} block={block} campaignId={campaign.id} />
            );
          case "embed":
            return <EmbedBlock key={key} block={block} />;
          case "footer":
            return <FooterBlock key={key} block={block} />;
          default:
            return (
              <div key={key} className="donate-block donate-block-unknown">
                [Unknown block: {block.type}]
              </div>
            );
        }
      })}
    </>
  );
}
