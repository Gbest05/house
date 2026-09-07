import api from './client';

export const adminApi = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
  getProperties: async (params = {}) => {
    const res = await api.get('/admin/properties', { params });
    return res.data;
  },
  approveProperty: async (id) => {
    const res = await api.put(`/admin/properties/${id}/approve`);
    return res.data;
  },
  rejectProperty: async (id, reason) => {
    const res = await api.put(`/admin/properties/${id}/reject`, { reason });
    return res.data;
  },
  suspendProperty: async (id) => {
    const res = await api.put(`/admin/properties/${id}/suspend`);
    return res.data;
  },
  getAgents: async (params = {}) => {
    const res = await api.get('/admin/agents', { params });
    return res.data;
  },
  verifyAgent: async (id, action = 'approve', reason = '') => {
    const res = await api.put(`/admin/agents/${id}/verify`, { action, reason });
    return res.data;
  },
  getUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },
  toggleUserActive: async (id) => {
    const res = await api.patch(`/admin/users/${id}/toggle-active`);
    return res.data;
  },
  getAnnouncements: async () => {
    const res = await api.get('/admin/announcements');
    return res.data;
  },
  createAnnouncement: async (data) => {
    const res = await api.post('/admin/announcements', data);
    return res.data;
  },
};
