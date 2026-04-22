import api from './api';

export const getUserContext = () => api.get('/users/me');
export const updateUser = (data) => api.put('/users/me', data);
