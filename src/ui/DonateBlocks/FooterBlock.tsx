type FooterBlockProps = {
  block: { id: string; type: string; props?: Record<string, unknown> };
};

export function FooterBlock({ block }: FooterBlockProps) {
  const p = block.props || {};
  const text = (p.text as string) || "";
  const showOrgName = p.show_org_name === true;

  return (
    <div className="donate-block donate-block-footer">
      <p>
        {text}
        {text && showOrgName && " · "}
        {showOrgName && "Powered by Helping Hands"}
      </p>
    </div>
  );
}
