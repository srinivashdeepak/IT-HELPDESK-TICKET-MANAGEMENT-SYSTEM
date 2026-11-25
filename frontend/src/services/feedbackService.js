import api from './api';

export const feedbackService = {
  submitFeedback: async (ticketId, feedbackData) => {
    const res = await api.post(`/feedback/ticket/${ticketId}`, feedbackData);
    return res.data;
  },

  getFeedback: async (ticketId) => {
    const res = await api.get(`/feedback/ticket/${ticketId}`);
    return res.data;
  },

  getRecentFeedback: async () => {
    const res = await api.get('/feedback/recent');
    return res.data;
  },
};

export default feedbackService;
