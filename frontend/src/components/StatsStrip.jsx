export default function StatsStrip({ stats }) {
  if (!stats) return null;

  const { byStatus = {}, byPriority = {}, breachedUnresolved = 0 } = stats;

  return (
    <div className="stats-strip">
      <div className="stat-card open">
        <div className="label">Open</div>
        <div className="value">{byStatus.open ?? 0}</div>
      </div>
      <div className="stat-card in_progress">
        <div className="label">In Progress</div>
        <div className="value">{byStatus.in_progress ?? 0}</div>
      </div>
      <div className="stat-card resolved">
        <div className="label">Resolved</div>
        <div className="value">{byStatus.resolved ?? 0}</div>
      </div>
      <div className="stat-card closed">
        <div className="label">Closed</div>
        <div className="value">{byStatus.closed ?? 0}</div>
      </div>
      <div className="stat-card breached">
        <div className="label">SLA Breached</div>
        <div className="value">{breachedUnresolved}</div>
      </div>
    </div>
  );
}
