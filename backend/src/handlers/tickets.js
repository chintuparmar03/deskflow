import supabase from '../lib/supabase.js';
import { computeDerived } from '../utils/sla.js';
import { validateTransition } from '../utils/transitions.js';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

export async function createTicket(req, res) {
  let body;
  try {
    body = await parseBody(req);
  } catch {
    return send(res, 400, { error: 'Invalid JSON body' });
  }

  const { subject, description, customer_email, priority } = body;
  const errors = [];

  if (!subject || !subject.trim()) errors.push('subject is required');
  if (!description || !description.trim()) errors.push('description is required');
  if (!customer_email || !customer_email.trim()) errors.push('customer_email is required');
  else if (!EMAIL_RE.test(customer_email)) errors.push('customer_email is invalid');
  if (!priority) errors.push('priority is required');
  else if (!PRIORITIES.includes(priority)) errors.push(`priority must be one of: ${PRIORITIES.join(', ')}`);

  if (errors.length) return send(res, 422, { errors });

  const { data, error } = await supabase
    .from('tickets')
    .insert([{ subject: subject.trim(), description: description.trim(), customer_email: customer_email.trim(), priority }])
    .select()
    .single();

  if (error) return send(res, 500, { error: error.message });
  return send(res, 201, computeDerived(data));
}

export async function listTickets(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const statusFilter = url.searchParams.get('status');
  const priorityFilter = url.searchParams.get('priority');
  const breachedFilter = url.searchParams.get('breached');

  if (statusFilter && !STATUSES.includes(statusFilter))
    return send(res, 400, { error: `status must be one of: ${STATUSES.join(', ')}` });
  if (priorityFilter && !PRIORITIES.includes(priorityFilter))
    return send(res, 400, { error: `priority must be one of: ${PRIORITIES.join(', ')}` });

  let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });
  if (statusFilter) query = query.eq('status', statusFilter);
  if (priorityFilter) query = query.eq('priority', priorityFilter);

  const { data, error } = await query;
  if (error) return send(res, 500, { error: error.message });

  let result = data.map(computeDerived);
  if (breachedFilter === 'true') result = result.filter((t) => t.slaBreached);

  return send(res, 200, result);
}

export async function updateTicket(req, res, id) {
  let body;
  try {
    body = await parseBody(req);
  } catch {
    return send(res, 400, { error: 'Invalid JSON body' });
  }

  const { data: existing, error: fetchErr } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !existing) return send(res, 404, { error: 'Ticket not found' });

  const updates = {};

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status))
      return send(res, 422, { error: `status must be one of: ${STATUSES.join(', ')}` });

    if (body.status !== existing.status) {
      const check = validateTransition(existing.status, body.status);
      if (!check.ok) return send(res, 422, { error: check.message });

      updates.status = body.status;

      if (body.status === 'resolved') updates.resolved_at = new Date().toISOString();
      if (body.status === 'in_progress' && check.direction === 'backward') updates.resolved_at = null;
    }
  }

  if (body.subject !== undefined) updates.subject = body.subject.trim();
  if (body.description !== undefined) updates.description = body.description.trim();
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority))
      return send(res, 422, { error: `priority must be one of: ${PRIORITIES.join(', ')}` });
    updates.priority = body.priority;
  }

  if (!Object.keys(updates).length) return send(res, 400, { error: 'No valid fields to update' });

  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return send(res, 500, { error: error.message });
  return send(res, 200, computeDerived(data));
}

export async function deleteTicket(req, res, id) {
  const { data: existing } = await supabase.from('tickets').select('id').eq('id', id).single();
  if (!existing) return send(res, 404, { error: 'Ticket not found' });

  const { error } = await supabase.from('tickets').delete().eq('id', id);
  if (error) return send(res, 500, { error: error.message });
  return send(res, 200, { message: 'Ticket deleted' });
}

export async function getStats(req, res) {
  const { data, error } = await supabase.from('tickets').select('*');
  if (error) return send(res, 500, { error: error.message });

  const withDerived = data.map(computeDerived);

  const byStatus = {};
  const byPriority = {};
  STATUSES.forEach((s) => (byStatus[s] = 0));
  PRIORITIES.forEach((p) => (byPriority[p] = 0));

  let breachedCount = 0;
  for (const t of withDerived) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    if (t.slaBreached) breachedCount++;
  }

  return send(res, 200, { byStatus, byPriority, breachedUnresolved: breachedCount });
}
