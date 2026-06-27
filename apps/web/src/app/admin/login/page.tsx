'use client';

import { useState } from 'react';
import { loginAdminAction } from '@/actions/adminActions';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const res = await loginAdminAction(formData);
    
    if (res.success) {
      router.push('/admin');
    } else {
      setError(res.error || 'Error de inicio de sesión');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0f2861] text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800">Acceso Restringido</h1>
          <p className="text-slate-500">Panel de Control de Todos Unidos</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Clave Maestra</label>
            <input 
              type="password" 
              name="password"
              required 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f1b218] focus:ring-2 focus:ring-[#f1b218]/20 outline-none transition-all"
              placeholder="Ingresa la contraseña"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0f2861] hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Verificando...' : 'Entrar al Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
