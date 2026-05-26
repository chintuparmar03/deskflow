import TicketCard from './TicketCard.jsx';

const COLUMNS = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

export default function Board({ tickets, onMove, onDelete }) {
  return (
    <div className="board">
      {COLUMNS.map(({ key, label }) => {
        const col = tickets.filter((t) => t.status === key);
        return (
          <div key={key} className={`column col-${key}`}>
            <div className="column-header">
              <div className="column-title">
                <span className="column-dot" />
                {label}
              </div>
              <span className="column-count">{col.length}</span>
            </div>
            <div className="column-body">
              {col.length === 0 && <div className="empty-col">No tickets</div>}
              {col.map((t) => (
                <TicketCard key={t.id} ticket={t} onMove={onMove} onDelete={onDelete} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
