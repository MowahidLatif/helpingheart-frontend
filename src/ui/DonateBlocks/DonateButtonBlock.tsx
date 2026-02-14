type DonateButtonBlockProps = {
  block: { id: string; type: string; props?: Record<string, unknown> };
  onDonateClick: () => void;
};

export function DonateButtonBlock({ block, onDonateClick }: DonateButtonBlockProps) {
  const p = block.props || {};
  const label = (p.label as string) || "Donate";

  return (
    <div className="donate-block donate-block-donate-button">
      <button
        type="button"
        className="donate-block-donate-cta"
        onClick={onDonateClick}
      >
        {label}
      </button>
    </div>
  );
}
