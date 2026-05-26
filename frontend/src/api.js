import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const createTicket = (data) => api.post('/tickets', data);
export const getTickets = (params) => api.get('/tickets', { params });
export const updateTicket = (id, data) => api.patch(`/tickets/${id}`, data);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`);
export const getStats = () => api.get('/tickets/stats');
