const SLA_MINUTES = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320,
};

export function computeDerived(ticket) {
  const now = Date.now();
  const created = new Date(ticket.created_at).getTime();
  const ageMinutes = Math.floor((now - created) / 60000);

  const isUnresolved = ticket.status !== 'resolved' && ticket.status !== 'closed';
  const slaBreached = isUnresolved && ageMinutes > SLA_MINUTES[ticket.priority];

  return { ...ticket, ageMinutes, slaBreached };
}

export { SLA_MINUTES };
