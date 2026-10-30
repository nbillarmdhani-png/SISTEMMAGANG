import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Token dikirim otomatis via HttpOnly Cookie, tidak perlu di-set manual
api.interceptors.request.use((config) => config);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      const isPublicPath = ['/login', '/register', '/forgot-password', '/reset-password'].some((p) =>
        window.location.pathname.startsWith(p)
      );
      const isAuthRequest = error.config?.url?.includes('/auth/me') || error.config?.url?.includes('/auth/login');
      if (!isPublicPath && !isAuthRequest) {
        window.location.href = '/login';
      }
    }

    if (status === 409) {
      // Tambahkan pesan default yang informatif jika belum ada
      error.response.data.message =
        message || 'Data tidak bisa diproses karena masih digunakan oleh data lain atau sudah duplikat.';
    }

    if (status === 500) {
      error.response.data.message = message || 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.';
    }

    return Promise.reject(error);
  }
);

export default api;
