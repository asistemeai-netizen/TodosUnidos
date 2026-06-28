'use client';

import { useState } from 'react';

type Center = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  neededItems: string | null;
  contactPhone: string | null;
  status: string;
  createdAt: Date | string;
};

export default function CollectionCentersClient({ centers }: { centers: Center[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);

  const filteredCenters = centers.filter(center => {
    const term = searchTerm.toLowerCase();
    return center.name.toLowerCase().includes(term) || 
           center.city.toLowerCase().includes(term) || 
           center.address.toLowerCase().includes(term);
  });

  const visibleCenters = filteredCenters.slice(0, visibleCount);

  const downloadCSV = () => {
    const headers = ['Nombre', 'Direccion', 'Ciudad', 'Estado', 'Items Necesitados', 'Telefono'];
    const rows = centers.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${(c.state || '').replace(/"/g, '""')}"`,
      `"${(c.neededItems || '').replace(/"/g, '""')}"`,
      `"${(c.contactPhone || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for UTF-8
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'centros_de_acopio.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Premium Control Panel */}
      <div className="bg-[#0f2861] rounded-[2.5rem] p-8 md:p-10 mb-12 shadow-[0_20px_50px_rgba(15,40,97,0.2)] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-blue-500 opacity-20 blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500 opacity-20 blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <svg className="h-7 w-7 text-slate-400 group-focus-within:text-[#0f2861] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-16 pr-6 py-5 md:py-6 border-0 rounded-2xl bg-white shadow-inner text-lg md:text-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-400/50 transition-all font-medium"
              placeholder="Encuentra tu centro por ciudad, zona o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* Quick clean button */}
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 hover:text-slate-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold tracking-widest text-sm uppercase shrink-0">
                <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Urgencia Nacional:
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <span className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 cursor-default">
                  💧 Agua Potable
                </span>
                <span className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 cursor-default">
                  🥫 Alimentos (no perecederos)
                </span>
                <span className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 cursor-default">
                  💊 Medicinas e Higiene
                </span>
              </div>
            </div>
            <button
              onClick={downloadCSV}
              className="bg-white text-[#0f2861] px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-slate-100 transition-colors flex items-center gap-2 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {filteredCenters.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-blue-100 text-[#0f2861] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No se encontraron centros</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Intenta buscar con otros términos.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCenters.map((center) => (
              <div key={center.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 relative overflow-hidden group hover:-translate-y-1">
                {/* Banda de color Azul Venezuela */}
                <div className="absolute top-0 right-0 w-2 h-full bg-[#00247D] opacity-90"></div>
                
                <div className="flex items-center gap-2 mb-4">
                  {/* Etiqueta color Azul Venezuela */}
                  <span className="bg-[#00247D]/10 text-[#00247D] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Verificado
                  </span>
                  <span className="text-slate-400 text-sm font-medium">
                    {center.city}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-[#00247D] transition-colors">{center.name}</h3>
                
                <div className="flex items-start gap-2 text-slate-600 text-sm mb-4">
                  <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{center.address}</span>
                </div>

                {center.contactPhone && (
                  <div className="flex items-center gap-2 text-slate-600 text-sm mt-4 pt-4 border-t border-slate-100">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${center.contactPhone}`} className="hover:text-[#00247D] font-medium">{center.contactPhone}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Botón Cargar Más */}
          {visibleCount < filteredCenters.length && (
            <div className="mt-12 text-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 9)}
                className="bg-white border-2 border-slate-200 text-slate-600 hover:text-[#0f2861] hover:border-[#0f2861] font-bold py-3 px-8 rounded-full transition-colors shadow-sm"
              >
                Cargar más centros ({filteredCenters.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
