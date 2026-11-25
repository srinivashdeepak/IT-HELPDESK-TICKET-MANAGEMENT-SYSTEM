import api from './api';

export const announcementService = {
  getActiveAnnouncements: async () => {
    const res = await api.get('/announcements/active');
    return res.data;
  },

  getAllAnnouncements: async () => {
    const res = await api.get('/announcements');
    return res.data;
  },

  createAnnouncement: async (announcementData) => {
    const res = await api.post('/announcements', announcementData);
    return res.data;
  },

  updateAnnouncement: async (id, announcementData) => {
    const res = await api.put(`/announcements/${id}`, announcementData);
    return res.data;
  },

  deleteAnnouncement: async (id) => {
    const res = await api.delete(`/announcements/${id}`);
    return res.data;
  },
};

export default announcementService;
