const VALID_FORWARD = {
  open: 'in_progress',
  in_progress: 'resolved',
  resolved: 'closed',
};

const VALID_BACKWARD = {
  in_progress: 'open',
  resolved: 'in_progress',
  closed: 'resolved',
};

export function validateTransition(from, to) {
  if (VALID_FORWARD[from] === to) return { ok: true, direction: 'forward' };
  if (VALID_BACKWARD[from] === to) return { ok: true, direction: 'backward' };
  return {
    ok: false,
    message: `Invalid transition: '${from}' → '${to}'. Allowed next: '${VALID_FORWARD[from] || 'none'}', or back to '${VALID_BACKWARD[from] || 'none'}'.`,
  };
}
