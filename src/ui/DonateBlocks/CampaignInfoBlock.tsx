type CampaignInfoBlockProps = {
  block: { id: string; type: string; props?: Record<string, unknown> };
  campaign: {
    goal?: number;
    total_raised?: number;
    latest_winner?: { donor: string; amount_cents: number; created_at: string };
  };
  donationsCount?: number;
};

export function CampaignInfoBlock({ block, campaign }: CampaignInfoBlockProps) {
  const p = block.props || {};
  const showGoal = p.show_goal !== false;
  const showProgressBar = p.show_progress_bar !== false;
  const showWinner = p.show_winner === true;
  const goal = campaign.goal ?? 0;
  const raised = campaign.total_raised ?? 0;
  const percent = goal > 0 ? Math.min(100, (raised / goal) * 100) : 0;
  const latestWinner = campaign.latest_winner;

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
      {showWinner && latestWinner && (
        <p className="donate-block-winner" style={{ marginTop: "0.75rem" }}>
          Congratulations to <strong>{latestWinner.donor}</strong> — our giveaway winner!
          {latestWinner.created_at && (
            <span style={{ fontSize: "0.9em", color: "#666" }}>
              {" "}(Drawn {new Date(latestWinner.created_at).toLocaleDateString()})
            </span>
          )}
        </p>
      )}
    </div>
  );
}
