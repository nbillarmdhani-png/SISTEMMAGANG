import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  
  return <Outlet />;
}
