export default function Filters({ priority, onPriority, breached, onBreached, onReset }) {
  return (
    <div className="filters">
      <select value={priority} onChange={(e) => onPriority(e.target.value)}>
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <button
        className={`toggle-btn${breached ? ' active' : ''}`}
        onClick={() => onBreached(!breached)}
      >
        🔴 SLA Breached
      </button>

      {(priority || breached) && (
        <button className="filter-reset" onClick={onReset}>
          Clear
        </button>
      )}
    </div>
  );
}
