const FORWARD = { open: 'in_progress', in_progress: 'resolved', resolved: 'closed' };
const BACKWARD = { in_progress: 'open', resolved: 'in_progress', closed: 'resolved' };

const FORWARD_LABEL = {
  open: '→ In Progress',
  in_progress: '→ Resolved',
  resolved: '→ Closed',
};

const BACKWARD_LABEL = {
  in_progress: '← Open',
  resolved: '← In Progress',
  closed: '← Resolved',
};

function formatAge(minutes) {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${Math.floor(minutes / 1440)}d`;
}

export default function TicketCard({ ticket, onMove, onDelete }) {
  const { id, subject, customer_email, priority, status, ageMinutes, slaBreached } = ticket;

  return (
    <div className="ticket-card">
      <div className="card-top">
        <div className="card-subject">{subject}</div>
        <span className={`priority-badge badge-${priority}`}>{priority}</span>
      </div>
      <div className="card-meta">
        <span className="card-email" title={customer_email}>{customer_email}</span>
        <span className="card-age">⏱ {formatAge(ageMinutes)}</span>
        {slaBreached && <span className="breach-badge">SLA !</span>}
      </div>
      <div className="card-actions">
        {BACKWARD[status] && (
          <button className="move-btn" onClick={() => onMove(id, BACKWARD[status])}>
            {BACKWARD_LABEL[status]}
          </button>
        )}
        {FORWARD[status] && (
          <button className="move-btn" onClick={() => onMove(id, FORWARD[status])}>
            {FORWARD_LABEL[status]}
          </button>
        )}
        <button className="delete-btn" onClick={() => onDelete(id)}>✕</button>
      </div>
    </div>
  );
}
