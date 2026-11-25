import api from './api';

export const kbService = {
  getArticles: async (params = {}) => {
    const res = await api.get('/kb', { params });
    return res.data;
  },

  getSuggestions: async (query) => {
    const res = await api.get('/kb/suggestions', { params: { query } });
    return res.data;
  },

  getArticleById: async (id) => {
    const res = await api.get(`/kb/${id}`);
    return res.data;
  },

  createArticle: async (articleData) => {
    const res = await api.post('/kb', articleData);
    return res.data;
  },

  updateArticle: async (id, articleData) => {
    const res = await api.put(`/kb/${id}`, articleData);
    return res.data;
  },

  deleteArticle: async (id) => {
    const res = await api.delete(`/kb/${id}`);
    return res.data;
  },

  voteHelpful: async (id, helpful) => {
    const res = await api.post(`/kb/${id}/feedback`, null, { params: { helpful } });
    return res.data;
  },
};

export default kbService;
