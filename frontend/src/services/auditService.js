import api from './api';

export const auditService = {
  getAuditLogs: async (page = 0, size = 20) => {
    const res = await api.get('/audit-logs', { params: { page, size } });
    return res.data;
  },
};

export default auditService;
