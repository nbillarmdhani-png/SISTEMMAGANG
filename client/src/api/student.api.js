import api from './axios';

// Positions (katalog publik)
export const getPositions = (params) =>
  api.get('/positions', { params }).then((r) => r.data);

export const getPositionById = (id) =>
  api.get(`/positions/${id}`).then((r) => r.data.data);

// Student competencies
export const getMyCompetencies = () =>
  api.get('/students/me/competencies').then((r) => r.data.data);

export const addCompetency = (data) =>
  api.post('/students/me/competencies', data).then((r) => r.data.data);

export const deleteCompetency = (kompetensiId) =>
  api.delete(`/students/me/competencies/${kompetensiId}`).then((r) => r.data);

export const getAllCompetencies = () =>
  api.get('/competencies').then((r) => r.data.data);

// Applications
export const applyToPosition = (data) =>
  api.post('/applications', data).then((r) => r.data.data);

export const getMyApplications = () =>
  api.get('/applications').then((r) => r.data.data);

export const cancelApplication = (id) =>
  api.patch(`/applications/${id}/cancel`).then((r) => r.data);

// Recommendations
export const getRecommendations = () =>
  api.get('/recommendations').then((r) => r.data.data);

export const refreshRecommendations = () =>
  api.post('/recommendations/refresh').then((r) => r.data.data);

// Notifications
export const getNotifications = () =>
  api.get('/notifications').then((r) => r.data.data);

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () =>
  api.patch('/notifications/read-all').then((r) => r.data);

// Chatbot
export const createChatSession = () =>
  api.post('/chat/sessions').then((r) => r.data.data);

export const getChatSession = (id) =>
  api.get(`/chat/sessions/${id}`).then((r) => r.data.data);

export const sendChatMessage = (sessionId, message) =>
  api.post(`/chat/sessions/${sessionId}/messages`, { message }).then((r) => r.data.data);

export const confirmChatSkills = (sessionId, items) =>
  api.post(`/chat/sessions/${sessionId}/confirm`, { items }).then((r) => r.data);

export const cancelChatSession = (sessionId) =>
  api.post(`/chat/sessions/${sessionId}/cancel`).then((r) => r.data);
