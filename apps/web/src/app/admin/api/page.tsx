import { checkAuth, generateApiKeyAction, toggleApiKeyStatusAction, deleteWebhookAction } from '@/actions/adminActions';
import { db, apiKeys, webhooks } from '@todosunidos/db';
import { desc } from 'drizzle-orm';
import React from 'react';

export default async function AdminApiPage() {
  await checkAuth();

  const keys = await db.query.apiKeys.findMany({
    orderBy: [desc(apiKeys.createdAt)],
    with: {
      webhooks: true
    }
  });

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0f2861] mb-2">API & Webhooks</h1>
          <p className="text-slate-500">Gestión de llaves de acceso para plataformas aliadas e integraciones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Generar Nueva Llave */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#0f2861] mb-4">Generar Nueva Llave</h2>
            <form action={async (formData) => {
              'use server';
              await generateApiKeyAction(formData.get('platformName') as string);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de Plataforma Aliada</label>
                <input 
                  type="text" 
                  name="platformName" 
                  required
                  placeholder="Ej. Venevisión, Vercel..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f1b218] focus:ring-1 focus:ring-[#f1b218]"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Generar API Key
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-4 text-center">
              La llave se creará y se mostrará en la tabla lateral para que la copies.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Listado de Llaves y Webhooks */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-[#0f2861]">Llaves Activas y Suscripciones</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Plataforma</th>
                    <th className="px-6 py-4">API Key</th>
                    <th className="px-6 py-4">Estatus</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {keys.map(keyData => (
                    <React.Fragment key={keyData.id}>
                      <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-[#0f2861]">
                          {keyData.platformName}
                          <div className="text-xs text-slate-400 font-normal mt-1">{new Date(keyData.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs select-all">
                            {keyData.key}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${keyData.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {keyData.isActive ? 'Activo' : 'Revocado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <form action={async () => {
                            'use server';
                            await toggleApiKeyStatusAction(keyData.id, !keyData.isActive);
                          }}>
                            <button type="submit" className={`px-3 py-1 rounded text-xs font-bold ${keyData.isActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
                              {keyData.isActive ? 'Revocar Acceso' : 'Reactivar'}
                            </button>
                          </form>
                        </td>
                      </tr>
                      
                      {/* Webhooks asociados a esta llave */}
                      {keyData.webhooks.length > 0 && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={4} className="px-6 pb-4 pt-2">
                            <div className="pl-4 border-l-2 border-blue-200">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Webhooks Registrados ({keyData.webhooks.length})</span>
                              <div className="space-y-2">
                                {keyData.webhooks.map(wh => (
                                  <div key={wh.id} className="flex justify-between items-center bg-white border border-slate-200 p-2 rounded-lg text-xs">
                                    <div className="truncate pr-4 flex-1">
                                      <span className="font-mono text-slate-800">{wh.url}</span>
                                      <span className="ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{wh.events}</span>
                                    </div>
                                    <form action={async () => {
                                      'use server';
                                      await deleteWebhookAction(wh.id);
                                    }}>
                                      <button type="submit" className="text-slate-400 hover:text-red-500 transition-colors">
                                        Eliminar
                                      </button>
                                    </form>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  
                  {keys.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No hay llaves de API generadas todavía.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
