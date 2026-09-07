import api from './client';

export const propertiesApi = {
  getProperties: async (params = {}) => {
    const res = await api.get('/properties', { params });
    return res.data;
  },
  getProperty: async (id) => {
    const res = await api.get(`/properties/${id}`);
    return res.data;
  },
  getLocations: async () => {
    const res = await api.get('/properties/locations');
    return res.data;
  },
  getTypes: async () => {
    const res = await api.get('/properties/types');
    return res.data;
  },
  getFacilities: async () => {
    const res = await api.get('/properties/facilities');
    return res.data;
  },
  createProperty: async (data) => {
    const res = await api.post('/properties', data);
    return res.data;
  },
  updateProperty: async (id, data) => {
    const res = await api.put(`/properties/${id}`, data);
    return res.data;
  },
  deleteProperty: async (id) => {
    const res = await api.delete(`/properties/${id}`);
    return res.data;
  },
  toggleAvailability: async (id, status) => {
    const res = await api.patch(`/properties/${id}/availability`, { availability_status: status });
    return res.data;
  },
  getMyProperties: async (params = {}) => {
    const res = await api.get('/properties/my', { params });
    return res.data;
  },
};
