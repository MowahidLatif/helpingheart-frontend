import ProgressTube from "@/components/ReactionaryContent/ProgressTube";

type Props = {
  block: { id: string; type: string; props?: Record<string, unknown> };
  campaign: { goal?: number; total_raised?: number };
};

export function ProgressTubeBlock({ block, campaign }: Props) {
  const p = block.props || {};
  return (
    <ProgressTube
      goal={campaign.goal ?? 0}
      total_raised={campaign.total_raised ?? 0}
      label={typeof p.label === "string" ? p.label : undefined}
      show_percent={p.show_percent === true}
    />
  );
}
