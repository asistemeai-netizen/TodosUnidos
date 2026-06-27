'use client';

import { useState } from 'react';
import { approveCenterAction, rejectCenterAction } from '@/actions/adminActions';

export default function CenterActionButtons({ centerId }: { centerId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    if (!confirm('¿Seguro que quieres aprobar este centro? Será público inmediatamente.')) return;
    setLoading(true);
    await approveCenterAction(centerId);
    setLoading(false);
  }

  async function handleReject() {
    if (!confirm('¿Seguro que quieres eliminar esta propuesta?')) return;
    setLoading(true);
    await rejectCenterAction(centerId);
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
      <button 
        onClick={handleApprove}
        disabled={loading}
        className="flex-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm"
      >
        Aprobar
      </button>
      <button 
        onClick={handleReject}
        disabled={loading}
        className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm"
      >
        Rechazar
      </button>
    </div>
  );
}
