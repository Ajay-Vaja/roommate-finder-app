import api from './api';

export const getProperties = (filters = {}) => {
  const queryParams = { ...filters };
  if (Array.isArray(queryParams.localities)) {
    queryParams.localities = queryParams.localities.join(',');
  }
  const params = new URLSearchParams(queryParams).toString();
  return api.get(`/properties?${params}`);
};

export const getProperty = (id) => api.get(`/properties/${id}`);

export const createProperty = (data) => api.post('/properties', data);

export const getMyProperties = () => api.get('/user/properties');

export const toggleSaveProperty = (id) => api.post(`/properties/${id}/save`);

export const getSavedProperties = () => api.get('/user/saved-properties');
