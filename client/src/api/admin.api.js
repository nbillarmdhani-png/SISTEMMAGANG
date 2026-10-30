import api from './axios';

// ─────────────────────────────────────────────
//  Admin – Stats
// ─────────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/stats').then((r) => r.data.data);

// ─────────────────────────────────────────────
//  Admin – Users
// ─────────────────────────────────────────────
export const getAdminUsers = () => api.get('/admin/users').then((r) => r.data.data);
export const updateAdminUserStatus = (id, is_active) =>
  api.patch(`/admin/users/${id}`, { is_active }).then((r) => r.data);

// ─────────────────────────────────────────────
//  Admin – Companies (Mitra)
// ─────────────────────────────────────────────
export const getAdminCompanies = () => api.get('/admin/companies').then((r) => r.data.data);
export const createAdminCompany = (data) => api.post('/admin/companies', data).then((r) => r.data.data);
export const updateAdminCompany = (id, data) => api.put(`/admin/companies/${id}`, data).then((r) => r.data.data);
export const deleteAdminCompany = (id) => api.delete(`/admin/companies/${id}`).then((r) => r.data);

// ─────────────────────────────────────────────
//  Admin – Positions (Lowongan)
// ─────────────────────────────────────────────
export const getAdminPositions = () => api.get('/admin/positions').then((r) => r.data.data);
export const getAdminPosition = (id) => api.get(`/admin/positions/${id}`).then((r) => r.data.data);
export const createAdminPosition = (data) => api.post('/admin/positions', data).then((r) => r.data.data);
export const updateAdminPosition = (id, data) => api.put(`/admin/positions/${id}`, data).then((r) => r.data.data);
export const deleteAdminPosition = (id) => api.delete(`/admin/positions/${id}`).then((r) => r.data);

// ─────────────────────────────────────────────
//  Admin – Competencies + Categories
// ─────────────────────────────────────────────
export const getAdminCompetencies = () => api.get('/admin/competencies').then((r) => r.data.data);
export const createAdminCompetency = (data) => api.post('/admin/competencies', data).then((r) => r.data.data);
export const updateAdminCompetency = (id, data) => api.put(`/admin/competencies/${id}`, data).then((r) => r.data.data);
export const deleteAdminCompetency = (id) => api.delete(`/admin/competencies/${id}`).then((r) => r.data);

export const getAdminCategories = () => api.get('/admin/competency-categories').then((r) => r.data.data);
export const createAdminCategory = (data) => api.post('/admin/competency-categories', data).then((r) => r.data.data);
export const updateAdminCategory = (id, data) => api.put(`/admin/competency-categories/${id}`, data).then((r) => r.data.data);
export const deleteAdminCategory = (id) => api.delete(`/admin/competency-categories/${id}`).then((r) => r.data);

export const getAdminStudyPrograms = () => api.get('/admin/study-programs').then((r) => r.data.data);
export const createAdminStudyProgram = (data) => api.post('/admin/study-programs', data).then((r) => r.data.data);
export const updateAdminStudyProgram = (id, data) => api.put(`/admin/study-programs/${id}`, data).then((r) => r.data.data);
export const deleteAdminStudyProgram = (id) => api.delete(`/admin/study-programs/${id}`).then((r) => r.data);

// ─────────────────────────────────────────────
//  Admin – Applications (Lamaran)
// ─────────────────────────────────────────────
export const getAdminApplications = () => api.get('/admin/applications').then((r) => r.data.data);
export const updateAdminApplicationStatus = (id, data) =>
  api.patch(`/admin/applications/${id}`, data).then((r) => r.data);
export const exportAdminApplicationsCSV = () =>
  api.get('/admin/applications/export', { responseType: 'blob' });
