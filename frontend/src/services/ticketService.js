import api from './api';

export const ticketService = {
  getTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  getTicketById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  createTicket: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },

  updateStatus: async (id, status, resolutionNotes = '') => {
    const response = await api.patch(`/tickets/${id}/status`, { status, resolutionNotes });
    return response.data;
  },

  updatePriority: async (id, priority) => {
    const response = await api.patch(`/tickets/${id}/priority`, null, { params: { priority } });
    return response.data;
  },

  assignTicket: async (id, agentId, notes = '') => {
    const response = await api.post(`/tickets/${id}/assign`, { agentId, notes });
    return response.data;
  },

  addComment: async (id, commentText, internal = false) => {
    const response = await api.post(`/tickets/${id}/comments`, { commentText, internal });
    return response.data;
  }
};
