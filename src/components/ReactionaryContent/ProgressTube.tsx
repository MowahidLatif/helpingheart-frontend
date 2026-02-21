type Props = {
  goal: number;
  total_raised: number;
  label?: string;
  show_percent?: boolean;
};

export default function ProgressTube({ goal, total_raised, label, show_percent }: Props) {
  const percent = goal > 0 ? Math.min(100, (total_raised / goal) * 100) : 0;

  return (
    <div className="donate-block donate-block-progress-tube">
      {label && <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{label}</p>}
      <p style={{ marginBottom: "0.5rem" }}>
        <strong>${Number(total_raised).toLocaleString()}</strong> of $
        {Number(goal).toLocaleString()} goal
        {show_percent && (
          <span style={{ marginLeft: "0.5rem", color: "#666" }}>
            ({Math.round(percent)}%)
          </span>
        )}
      </p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
