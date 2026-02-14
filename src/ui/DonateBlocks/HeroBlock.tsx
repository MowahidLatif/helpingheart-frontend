type HeroBlockProps = {
  block: { id: string; type: string; props?: Record<string, unknown> };
  campaign: { title?: string };
};

export function HeroBlock({ block, campaign }: HeroBlockProps) {
  const p = block.props || {};
  const title = (p.title as string) || (campaign.title as string) || "Campaign";
  const subtitle = (p.subtitle as string) || "";
  const imageUrl = p.image_url as string | undefined;
  const backgroundColor = (p.background_color as string) || undefined;

  return (
    <div
      className="donate-block donate-block-hero"
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      {imageUrl && (
        <div className="donate-block-hero-image">
          <img src={imageUrl} alt="" />
        </div>
      )}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
