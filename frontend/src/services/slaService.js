import api from './api';

export const slaService = {
  getSlaRules: async () => {
    const res = await api.get('/sla/rules');
    return res.data;
  },

  updateSlaRule: async (id, ruleData) => {
    const res = await api.put(`/sla/rules/${id}`, ruleData);
    return res.data;
  },

  triggerSlaCheck: async () => {
    const res = await api.post('/sla/check-breaches');
    return res.data;
  },
};

export default slaService;
