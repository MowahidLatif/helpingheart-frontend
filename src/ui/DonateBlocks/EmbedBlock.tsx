type EmbedBlockProps = {
  block: { id: string; type: string; props?: Record<string, unknown> };
};

export function EmbedBlock({ block }: EmbedBlockProps) {
  const p = block.props || {};
  const url = (p.url as string) || "";
  const height = Math.min(1000, Math.max(100, (p.height as number) || 400));

  if (!url) {
    return (
      <div className="donate-block donate-block-embed">
        <p>No embed URL configured.</p>
      </div>
    );
  }

  return (
    <div className="donate-block donate-block-embed">
      <iframe
        src={url}
        title="Embed"
        width="100%"
        height={height}
        frameBorder={0}
        allowFullScreen
      />
    </div>
  );
}
