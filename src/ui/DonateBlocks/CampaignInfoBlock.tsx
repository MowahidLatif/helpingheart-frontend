type CampaignInfoBlockProps = {
  block: { id: string; type: string; props?: Record<string, unknown> };
  campaign: { goal?: number; total_raised?: number };
  donationsCount?: number;
};

export function CampaignInfoBlock({ block, campaign }: CampaignInfoBlockProps) {
  const p = block.props || {};
  const showGoal = p.show_goal !== false;
  const showProgressBar = p.show_progress_bar !== false;
  const goal = campaign.goal ?? 0;
  const raised = campaign.total_raised ?? 0;
  const percent = goal > 0 ? Math.min(100, (raised / goal) * 100) : 0;

  return (
    <div className="donate-block donate-block-campaign-info">
      {showGoal && (
        <p>
          <strong>${Number(raised).toLocaleString()}</strong> of $
          {Number(goal).toLocaleString()} goal
        </p>
      )}
      {showProgressBar && goal > 0 && (
        <div className="donate-block-progress">
          <div
            className="donate-block-progress-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
