import API from './api';

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const getMe = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

export const testCandidateEndpoint = async () => {
  const response = await API.get('/candidate/test');
  return response.data;
};

export const testRecruiterEndpoint = async () => {
  const response = await API.get('/recruiter/test');
  return response.data;
};

export const checkHealth = async () => {
  const response = await API.get('/health');
  return response.data;
};
