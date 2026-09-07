import api from './client';

export const inquiriesApi = {
  submitInquiry: async (data) => {
    const res = await api.post('/inquiries', data);
    return res.data;
  },
  getMyInquiries: async () => {
    const res = await api.get('/inquiries/my');
    return res.data;
  },
  getAgentInquiries: async (params = {}) => {
    const res = await api.get('/inquiries/agent', { params });
    return res.data;
  },
  updateInquiryStatus: async (id, status, agentNotes = null) => {
    const res = await api.patch(`/inquiries/${id}/status`, { status, agent_notes: agentNotes });
    return res.data;
  },
};
