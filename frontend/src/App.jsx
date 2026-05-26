import { useEffect, useState, useCallback } from 'react';
import { getTickets, getStats, updateTicket, deleteTicket } from './api.js';
import StatsStrip from './components/StatsStrip.jsx';
import Filters from './components/Filters.jsx';
import Board from './components/Board.jsx';
import CreateTicketForm from './components/CreateTicketForm.jsx';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [priority, setPriority] = useState('');
  const [breached, setBreached] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setError('');
    try {
      const params = {};
      if (priority) params.priority = priority;
      if (breached) params.breached = 'true';
      const [ticketsRes, statsRes] = await Promise.all([getTickets(params), getStats()]);
      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch {
      setError('Failed to load tickets. Check your API connection.');
    } finally {
      setLoading(false);
    }
  }, [priority, breached]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleMove(id, newStatus) {
    try {
      const { data } = await updateTicket(id, { status: newStatus });
      setTickets((prev) => prev.map((t) => (t.id === id ? data : t)));
      const statsRes = await getStats();
      setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Transition failed');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this ticket?')) return;
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      const statsRes = await getStats();
      setStats(statsRes.data);
    } catch {
      alert('Delete failed');
    }
  }

  function handleCreated(ticket) {
    setTickets((prev) => [ticket, ...prev]);
    getStats().then((r) => setStats(r.data));
  }

  function resetFilters() {
    setPriority('');
    setBreached(false);
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Desk<span>Flow</span></h1>
      </div>

      <StatsStrip stats={stats} />

      <Filters
        priority={priority}
        onPriority={setPriority}
        breached={breached}
        onBreached={setBreached}
        onReset={resetFilters}
      />

      {loading && <div className="global-loading">Loading tickets…</div>}
      {error && <div className="global-error">{error}</div>}

      {!loading && (
        <>
          <Board tickets={tickets} onMove={handleMove} onDelete={handleDelete} />
          <CreateTicketForm onCreated={handleCreated} />
        </>
      )}
    </div>
  );
}
