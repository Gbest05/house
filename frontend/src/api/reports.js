import api from './client';

export const reportsApi = {
  submitReport: async (data) => {
    const res = await api.post('/reports', data);
    return res.data;
  },
  getReports: async (params = {}) => {
    const res = await api.get('/reports', { params });
    return res.data;
  },
  updateReport: async (id, status, adminNotes = null, suspendProperty = false) => {
    const res = await api.patch(`/reports/${id}`, {
      status,
      admin_notes: adminNotes,
      suspend_property: suspendProperty,
    });
    return res.data;
  },
};
