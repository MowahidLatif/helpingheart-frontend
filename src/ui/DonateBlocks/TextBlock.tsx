type TextBlockProps = {
  block: { id: string; type: string; props?: Record<string, unknown> };
};

export function TextBlock({ block }: TextBlockProps) {
  const p = block.props || {};
  const content = (p.content as string) || "";
  const align = ((p.align as string) || "left") as "left" | "center" | "right";

  const sanitized = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br />");

  return (
    <div
      className={`donate-block donate-block-text donate-block-text-${align}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
