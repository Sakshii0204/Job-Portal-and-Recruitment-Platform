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

// ================= Phase 2: Candidate Profile =================
export const getCandidateProfile = async () => {
  const response = await API.get('/candidate/profile');
  return response.data;
};

export const updateCandidateProfile = async (profileData) => {
  const response = await API.put('/candidate/profile', profileData);
  return response.data;
};

// ================= Phase 2: Jobs =================
export const getJobs = async (params = {}) => {
  const response = await API.get('/jobs', { params });
  return response.data;
};

export const getJobById = async (id) => {
  const response = await API.get(`/jobs/${id}`);
  return response.data;
};

// ================= Phase 2: Applications =================
export const applyForJob = async (applicationData) => {
  const response = await API.post('/applications', applicationData);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await API.get('/applications/my');
  return response.data;
};

export const checkJobApplicationStatus = async (jobId) => {
  const response = await API.get(`/applications/status/${jobId}`);
  return response.data;
};

// ================= Phase 3: Recruiter Module =================
export const getRecruiterStats = async () => {
  const response = await API.get('/recruiter/dashboard/stats');
  return response.data;
};

export const createRecruiterJob = async (jobData) => {
  const response = await API.post('/recruiter/jobs', jobData);
  return response.data;
};

export const getRecruiterJobs = async () => {
  const response = await API.get('/recruiter/jobs');
  return response.data;
};

export const getRecruiterJobById = async (id) => {
  const response = await API.get(`/recruiter/jobs/${id}`);
  return response.data;
};

export const updateRecruiterJob = async (id, jobData) => {
  const response = await API.put(`/recruiter/jobs/${id}`, jobData);
  return response.data;
};

export const closeRecruiterJob = async (id) => {
  const response = await API.put(`/recruiter/jobs/${id}/close`);
  return response.data;
};

export const deleteRecruiterJob = async (id) => {
  const response = await API.delete(`/recruiter/jobs/${id}`);
  return response.data;
};

export const getJobApplicants = async (jobId) => {
  const response = await API.get(`/recruiter/jobs/${jobId}/applications`);
  return response.data;
};

export const getApplicationDetails = async (id) => {
  const response = await API.get(`/recruiter/applications/${id}`);
  return response.data;
};

export const updateApplicationStatus = async (id, status) => {
  const response = await API.put(`/recruiter/applications/${id}/status`, { status });
  return response.data;
};


