import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public pages
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';

// Student pages
import Dashboard from '../pages/student/Dashboard';
import Profile from '../pages/student/Profile';
import PositionList from '../pages/student/PositionList';
import PositionDetail from '../pages/student/PositionDetail';
import Chatbot from '../pages/student/Chatbot';
import Recommendations from '../pages/student/Recommendations';
import Applications from '../pages/student/Applications';
import Notifications from '../pages/student/Notifications';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminMitra from '../pages/admin/AdminMitra';
import AdminPosisi from '../pages/admin/AdminPosisi';
import AdminKompetensi from '../pages/admin/AdminKompetensi';
import AdminPengguna from '../pages/admin/AdminPengguna';
import AdminLamaran from '../pages/admin/AdminLamaran';

import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Student routes */}
      <Route element={<ProtectedRoute role="mahasiswa" />}>
        <Route element={<StudentLayout />}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/profil" element={<Profile />} />
          <Route path="/app/magang" element={<PositionList />} />
          <Route path="/app/magang/:id" element={<PositionDetail />} />
          <Route path="/app/chatbot" element={<Chatbot />} />
          <Route path="/app/rekomendasi" element={<Recommendations />} />
          <Route path="/app/lamaran" element={<Applications />} />
          <Route path="/app/notifikasi" element={<Notifications />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/mitra" element={<AdminMitra />} />
          <Route path="/admin/posisi" element={<AdminPosisi />} />
          <Route path="/admin/kompetensi" element={<AdminKompetensi />} />
          <Route path="/admin/pengguna" element={<AdminPengguna />} />
          <Route path="/admin/lamaran" element={<AdminLamaran />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
