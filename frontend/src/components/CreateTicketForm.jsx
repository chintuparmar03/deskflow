import { useState } from 'react';
import { createTicket } from '../api.js';

const EMPTY = { subject: '', description: '', customer_email: '', priority: 'medium' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateTicketForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const e = {};
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.customer_email.trim()) e.customer_email = 'Email is required';
    else if (!EMAIL_RE.test(form.customer_email)) e.customer_email = 'Enter a valid email';
    if (!form.priority) e.priority = 'Priority is required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      const { data } = await createTicket(form);
      onCreated(data);
      setForm(EMPTY);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      const msg = err.response?.data?.errors?.join(', ') || err.response?.data?.error || 'Something went wrong';
      setErrors({ _global: msg });
    } finally {
      setLoading(false);
    }
  }

  function set(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  return (
    <div className="create-form-section">
      <h2>New Ticket</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-field">
            <label>Subject</label>
            <input value={form.subject} onChange={set('subject')} placeholder="Brief issue summary" />
            {errors.subject && <span className="field-error">{errors.subject}</span>}
          </div>

          <div className="form-field">
            <label>Customer Email</label>
            <input type="email" value={form.customer_email} onChange={set('customer_email')} placeholder="customer@example.com" />
            {errors.customer_email && <span className="field-error">{errors.customer_email}</span>}
          </div>

          <div className="form-field full">
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={set('description')} placeholder="Describe the issue..." />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="form-field">
            <label>Priority</label>
            <select value={form.priority} onChange={set('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-field" style={{ justifyContent: 'flex-end' }}>
            {errors._global && <span className="field-error">{errors._global}</span>}
            {success && <span className="form-success">✓ Ticket created!</span>}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating…' : 'Create Ticket'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
