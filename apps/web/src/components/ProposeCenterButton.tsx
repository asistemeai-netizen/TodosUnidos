'use client';

import { useState } from 'react';
import { proposeCenterAction } from '../actions/proposeCenter';

export default function ProposeCenterButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await proposeCenterAction(formData);
    setIsSubmitting(false);
    
    if (result.success) {
      alert('¡Gracias! El Centro de Acopio fue propuesto con éxito y está pendiente de aprobación.');
      setIsOpen(false);
    } else {
      alert(result.error || 'Hubo un error');
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto bg-emerald-50 text-emerald-700 border-2 border-emerald-100 hover:border-emerald-500 hover:text-emerald-800 px-6 py-3 rounded-2xl font-bold shadow-sm transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Proponer Centro
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-black text-emerald-800">Proponer Acopio</h2>
                <p className="text-slate-500 text-sm">El centro será público tras ser aprobado.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
              
              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-700 text-sm">Nombre del Lugar / Organización *</label>
                <input required name="name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="Ej. Iglesia Don Bosco, Bomberos Chacao" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-700 text-sm">Dirección Exacta *</label>
                <input required name="address" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="Calle, Avenida, Punto de referencia" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-slate-700 text-sm">Estado *</label>
                  <input required name="state" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="Ej. Miranda" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-slate-700 text-sm">Ciudad *</label>
                  <input required name="city" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="Ej. Caracas" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-700 text-sm">¿Qué Insumos se necesitan más? *</label>
                <input required name="neededItems" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="Agua potable, cobijas, pañales, medicinas..." />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-700 text-sm">Teléfono de Contacto del Centro</label>
                <input name="contactPhone" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="Opcional" />
              </div>

              <div className="flex justify-end gap-4 pt-4 mt-2 border-t border-slate-100">
                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center disabled:opacity-50 text-lg">
                  {isSubmitting ? 'Enviando...' : 'Proponer Centro Oficial'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
