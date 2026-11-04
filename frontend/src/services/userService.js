import api from './api';

export const userService = {
  getUsers: async (role = null) => {
    const params = role ? { role } : {};
    const response = await api.get('/users', { params });
    return response.data;
  },

  getAgents: async () => {
    const response = await api.get('/users/agents');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await api.patch(`/users/${id}/status`);
    return response.data;
  }
};
