import React from 'react';
import Link from 'next/link';
import { getHospitalLists } from '@/services/theEmpireApi';

export const metadata = {
  title: 'Listas de Hospitales y Refugios - Todos Unidos',
  description: 'Explorador de listas de personas ingresadas en hospitales y centros de refugio.',
};

export default async function HospitalListsPage({ searchParams }: { searchParams: { cursor?: string } }) {
  const resolvedSearchParams = await searchParams;
  const cursor = resolvedSearchParams?.cursor;
  
  const response = await getHospitalLists(cursor, 50);

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-[#0f2861] font-bold hover:underline mb-4 inline-block">&larr; Volver al inicio</Link>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0f2861] mb-4">Listas de Hospitales y Refugios</h1>
          <p className="text-slate-600 max-w-3xl text-lg">
            Explora los registros de ingresos compartidos por hospitales, centros de acopio y refugios de la red aliada. Esta información es actualizada por los propios centros.
          </p>
        </div>

        {!response || !response.data || response.data.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <span className="text-4xl block mb-4">📋</span>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No se encontraron listas</h2>
            <p className="text-slate-500">Actualmente no hay listas de hospitales disponibles o los servidores están ocupados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {response.data.map((lista) => (
              <Link key={lista.id} href={`/listas-hospitales/${lista.id}`} className="group">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-[#f1b218] hover:shadow-md transition-all h-full flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-slate-100 group-hover:bg-[#f1b218] transition-colors"></div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Registro Médico / Refugio
                    </div>
                    <h3 className="text-xl font-bold text-[#0f2861] mb-2 group-hover:text-[#f1b218] transition-colors">
                      {lista.titulo}
                    </h3>
                    {lista.descripcion && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                        {lista.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">
                      {lista.fecha ? new Date(lista.fecha).toLocaleDateString('es-VE') : 'Fecha no especificada'}
                    </span>
                    <span className="text-[#0f2861] font-bold group-hover:underline">
                      Ver nombres &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {response?.pagination?.hasMore && response.pagination.nextCursor && (
          <div className="mt-12 text-center">
            <Link 
              href={`/listas-hospitales?cursor=${response.pagination.nextCursor}`}
              className="inline-block bg-white border border-[#0f2861] text-[#0f2861] px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              Cargar más listas
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
