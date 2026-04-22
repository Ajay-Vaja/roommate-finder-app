import api from './api';

export const getProperties = () => api.get('/properties');
export const getProperty = (id) => api.get(`/properties/${id}`);
