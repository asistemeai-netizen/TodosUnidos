import React from 'react';
import Link from 'next/link';
import { getHospitalListDetail } from '@/services/theEmpireApi';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const data = await getHospitalListDetail(resolvedParams.id);
  
  if (!data) {
    return { title: 'Lista no encontrada - Todos Unidos' };
  }
  
  return {
    title: `${data.lista.titulo} - Todos Unidos`,
    description: data.lista.descripcion || `Lista de personas registradas en ${data.centro?.nombre || 'este centro'}.`,
  };
}

export default async function HospitalListDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const response = await getHospitalListDetail(resolvedParams.id);

  if (!response) {
    return (
      <main className="min-h-screen bg-slate-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/listas-hospitales" className="text-[#0f2861] font-bold hover:underline mb-8 inline-block">&larr; Volver al explorador</Link>
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-12 text-center">
            <span className="text-4xl block mb-4">⚠️</span>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Lista no encontrada</h2>
            <p className="text-slate-500">No pudimos encontrar esta lista o el servidor no responde.</p>
          </div>
        </div>
      </main>
    );
  }

  const { lista, centro, entradas } = response;

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/listas-hospitales" className="text-[#0f2861] font-bold hover:underline mb-6 inline-block">&larr; Volver a las listas</Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-[#0f2861] px-6 py-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
            
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="bg-blue-800 text-blue-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Registro Oficial
                </span>
                {lista.fecha && (
                  <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {new Date(lista.fecha).toLocaleDateString('es-VE')}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black mb-3">{lista.titulo}</h1>
              
              {lista.descripcion && (
                <p className="text-blue-100 text-lg max-w-3xl mb-6">
                  {lista.descripcion}
                </p>
              )}
              
              {centro && (
                <div className="flex items-center gap-2 bg-white/10 p-4 rounded-xl border border-white/20 inline-flex">
                  <span className="text-2xl">🏥</span>
                  <div>
                    <div className="text-xs text-blue-200 font-bold uppercase">Centro Reportante</div>
                    <div className="font-bold text-white text-lg">{centro.nombre}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-0 sm:p-6 overflow-x-auto">
            {entradas.length === 0 ? (
              <div className="text-center p-8 text-slate-500">
                Esta lista no tiene registros públicos asociados.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 rounded-tl-xl">Nombre Registrado</th>
                    <th className="px-6 py-4">Edad</th>
                    <th className="px-6 py-4">Estado de Salud</th>
                    <th className="px-6 py-4 rounded-tr-xl">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entradas.map((persona) => (
                    <tr key={persona.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 capitalize">
                        {persona.nombre}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {persona.edad ? `${persona.edad} años` : 'No especificada'}
                      </td>
                      <td className="px-6 py-4">
                        {persona.estado ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            persona.estado.toLowerCase().includes('estable') || persona.estado.toLowerCase().includes('alta') 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : persona.estado.toLowerCase().includes('critico') || persona.estado.toLowerCase().includes('grave')
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {persona.estado}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-sm">Sin clasificar</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm max-w-xs truncate" title={persona.detalles}>
                        {persona.detalles || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-sm text-blue-800 flex items-start gap-4">
          <span className="text-2xl">ℹ️</span>
          <div>
            <strong className="block mb-1">Sobre esta información</strong>
            Esta lista es importada en tiempo real desde nuestra red de centros aliados (`theempire.tech`). Si reconoces a tu familiar en esta lista, comunícate directamente con el centro reportante (<strong>{centro?.nombre}</strong>).
          </div>
        </div>
      </div>
    </main>
  );
}
