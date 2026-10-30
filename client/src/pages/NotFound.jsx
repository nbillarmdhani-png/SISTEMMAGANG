import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Button } from '../components/ui/Button';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const { user } = useAuth();

  const homePath = user?.role === 'admin' ? '/admin' : user ? '/app' : '/login';
  const homeLabel = user?.role === 'admin' ? 'Dashboard Admin' : user ? 'Dashboard Mahasiswa' : 'Halaman Masuk';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 space-y-6">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-bold tracking-widest text-blue-600 uppercase">Error 404</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Halaman Tidak Ditemukan</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Halaman atau tautan yang Anda tuju tidak tersedia atau telah dipindahkan.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()} className="flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          <Link to={homePath}>
            <Button className="w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Ke {homeLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
