import api from './client';

export const favoritesApi = {
  getFavorites: async () => {
    const res = await api.get('/favorites');
    return res.data;
  },
  addFavorite: async (propertyId) => {
    const res = await api.post('/favorites', { property_id: propertyId });
    return res.data;
  },
  removeFavorite: async (propertyId) => {
    const res = await api.delete(`/favorites/${propertyId}`);
    return res.data;
  },
  checkFavorite: async (propertyId) => {
    const res = await api.get(`/favorites/check/${propertyId}`);
    return res.data;
  },
};
