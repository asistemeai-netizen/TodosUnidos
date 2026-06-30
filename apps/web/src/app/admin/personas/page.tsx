import { checkAuth, changePersonStatusAction, deletePersonAction, deleteTipAction } from '@/actions/adminActions';
import { db, unifiedPersons } from '@todosunidos/db';
import { desc, sql, or, ilike, and, eq } from 'drizzle-orm';
import React from 'react';
import Link from 'next/link';

export default async function AdminPersonasPage({ searchParams }: { searchParams: { page?: string, q?: string, status?: string } }) {
  await checkAuth();

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams?.page || '1');
  const q = resolvedSearchParams?.q || '';
  const statusFilter = resolvedSearchParams?.status || '';
  const pageSize = 50;

  const conditions = [];
  if (q) {
    conditions.push(or(
      ilike(unifiedPersons.firstName, `%${q}%`),
      ilike(unifiedPersons.lastName, `%${q}%`),
      ilike(unifiedPersons.documentId, `%${q}%`),
      ilike(sql`concat(${unifiedPersons.firstName}, ' ', ${unifiedPersons.lastName})`, `%${q}%`)
    ));
  }
  if (statusFilter) {
    conditions.push(eq(unifiedPersons.status, statusFilter));
  }
  
  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  const persons = await db.query.unifiedPersons.findMany({
    where: whereCondition,
    orderBy: [desc(unifiedPersons.createdAt)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    with: {
      tips: true
    }
  });

  const totalQuery = await db.select({ count: sql<number>`count(*)` }).from(unifiedPersons).where(whereCondition);
  const total = Number(totalQuery[0].count);
  const totalPages = Math.ceil(total / pageSize) || 1;

  // Preservar query params para la paginación
  const currentParams = new URLSearchParams();
  if (q) currentParams.set('q', q);
  if (statusFilter) currentParams.set('status', statusFilter);
  const baseQueryStr = currentParams.toString() ? `&${currentParams.toString()}` : '';

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0f2861] mb-2">Directorio de Personas</h1>
          <p className="text-slate-500">Gestión de desaparecidos, cambios de estatus y revisión de aportes.</p>
        </div>
        
        <div className="w-full lg:w-auto">
          <form method="GET" action="/admin/personas" className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              name="q" 
              placeholder="Buscar por nombre o cédula..." 
              defaultValue={q}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-[#0f2861] outline-none min-w-[200px]"
            />
            <select name="status" defaultValue={statusFilter} className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-[#0f2861] outline-none bg-white">
              <option value="">Todos los estatus</option>
              <option value="desaparecido">Desaparecidos</option>
              <option value="verificando">Verificando</option>
              <option value="localizado_sano">Localizados</option>
              <option value="fallecido">Fallecidos</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="bg-[#0f2861] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors whitespace-nowrap">
                Filtrar
              </button>
              {(q || statusFilter) && (
                <Link href="/admin/personas" className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center whitespace-nowrap">
                  Limpiar
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Persona</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Estatus</th>
                <th className="px-6 py-4">Aportes (Tips)</th>
                <th className="px-6 py-4 text-right">Acciones Peligrosas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {persons.map((person) => (
                <React.Fragment key={person.id}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0f2861]">{person.firstName} {person.lastName}</div>
                      <div className="text-xs text-slate-400">ID: {person.id.split('-')[0]}...</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {person.documentId || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <form action={async (formData) => {
                        'use server';
                        await changePersonStatusAction(person.id, formData.get('status') as string);
                      }} className="flex items-center gap-2">
                        <select 
                          name="status"
                          defaultValue={person.status}
                          className="bg-slate-100 border-none text-slate-700 text-xs font-bold rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#f1b218]"
                        >
                          <option value="desaparecido">Desaparecido</option>
                          <option value="verificando">Verificando</option>
                          <option value="localizado_sano">Localizado (Sano)</option>
                          <option value="fallecido">Fallecido</option>
                        </select>
                        <button type="submit" className="bg-[#0f2861] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-800 transition-colors">
                          Guardar
                        </button>
                      </form>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold ${person.tips.length > 0 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                        {person.tips.length} aportes
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        'use server';
                        await deletePersonAction(person.id);
                      }}>
                        <button type="submit" className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-xs font-bold transition-colors">
                          Eliminar Registro
                        </button>
                      </form>
                    </td>
                  </tr>
                  
                  {/* Fila expandida si hay aportes */}
                  {person.tips.length > 0 && (
                    <tr className="bg-slate-50 border-t-0">
                      <td colSpan={5} className="px-6 py-4">
                        <details className="group bg-white rounded-xl border border-purple-100">
                          <summary className="list-none cursor-pointer flex justify-between items-center p-4 outline-none focus:ring-2 focus:ring-purple-200 rounded-xl">
                            <h4 className="text-purple-800 font-bold text-xs uppercase tracking-wider">Pistas Ciudadanas ({person.tips.length})</h4>
                            <span className="text-purple-500 font-bold text-xs group-open:hidden flex items-center gap-1">Ver detalles <span className="text-[10px]">▼</span></span>
                            <span className="text-purple-500 font-bold text-xs hidden group-open:flex items-center gap-1">Ocultar <span className="text-[10px]">▲</span></span>
                          </summary>
                          
                          <div className="p-4 pt-0 space-y-3 border-t border-purple-50 mt-2">
                            {person.tips.map(tip => (
                              <div key={tip.id} className="flex justify-between items-start gap-4 p-3 bg-purple-50 rounded-lg">
                                <div>
                                  <div className="text-sm font-medium text-slate-800">
                                    "{tip.informationText}"
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    Por: {tip.contactName || 'Anónimo'} {tip.contactPhone ? `(${tip.contactPhone})` : ''} - {new Date(tip.createdAt).toLocaleString('es-VE')}
                                  </div>
                                </div>
                                <form action={async () => {
                                  'use server';
                                  await deleteTipAction(tip.id);
                                }}>
                                  <button type="submit" className="text-red-400 hover:text-red-600 bg-white px-2 py-1 rounded border border-red-100 text-xs font-bold transition-colors">
                                    Borrar
                                  </button>
                                </form>
                              </div>
                            ))}
                          </div>
                        </details>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {persons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No hay personas registradas en el directorio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Mostrando página <span className="font-bold text-slate-800">{page}</span> de <span className="font-bold text-slate-800">{totalPages}</span> (Total: {total})
            </div>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link 
                  href={`/admin/personas?page=${page - 1}${baseQueryStr}`}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Anterior
                </Link>
              ) : (
                <button disabled className="bg-slate-100 border border-slate-200 text-slate-400 px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed">
                  Anterior
                </button>
              )}
              
              {page < totalPages ? (
                <Link 
                  href={`/admin/personas?page=${page + 1}${baseQueryStr}`}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Siguiente
                </Link>
              ) : (
                <button disabled className="bg-slate-100 border border-slate-200 text-slate-400 px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed">
                  Siguiente
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
