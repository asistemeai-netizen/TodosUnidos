import { checkAuth, addYoutubeChannelAction, toggleYoutubeChannelAction, deleteYoutubeChannelAction } from '@/actions/adminActions';
import { db, youtubeChannels } from '@todosunidos/db';
import React from 'react';

export default async function AdminYoutubePage() {
  await checkAuth();

  const channels = await db.query.youtubeChannels.findMany();

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-red-600 mb-2 flex items-center gap-2">▶ Fuentes de YouTube</h1>
          <p className="text-slate-500">Agrega IDs de canales (UC...) para extraer sus videos automáticamente. Solo se mostrará el último video extraído de cada canal en la página principal.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <h3 className="text-lg font-bold text-[#0f2861] mb-4">Añadir Nuevo Canal</h3>
        <form action={async (formData) => {
          'use server';
          await addYoutubeChannelAction(formData);
        }} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            name="name" 
            placeholder="Nombre del Canal (Ej. VTV)" 
            required 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-200"
          />
          <input 
            type="text" 
            name="channelId" 
            placeholder="ID del Canal (UC...)" 
            required 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-200"
          />
          <input 
            type="text" 
            name="keywords" 
            placeholder="Palabras clave (opcional)" 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-200"
          />
          <button type="submit" className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200">
            Agregar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Canal</th>
              <th className="px-6 py-4">ID (UC...)</th>
              <th className="px-6 py-4">Filtro / Palabras Clave</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {channels.map((channel) => (
              <tr key={channel.id} className={`transition-colors ${!channel.isActive ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'}`}>
                <td className="px-6 py-4 font-bold text-[#0f2861]">
                  {channel.name}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                  {channel.channelId}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {channel.keywords || <span className="text-slate-400 italic">Todos los videos</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${channel.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {channel.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <form action={async () => {
                    'use server';
                    await toggleYoutubeChannelAction(channel.id, channel.isActive);
                  }}>
                    <button type="submit" className="text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-2 rounded-lg text-xs font-bold transition-colors">
                      {channel.isActive ? 'Pausar' : 'Activar'}
                    </button>
                  </form>
                  <form action={async () => {
                    'use server';
                    await deleteYoutubeChannelAction(channel.id);
                  }}>
                    <button type="submit" className="text-red-500 hover:text-red-700 bg-red-50 px-3 py-2 rounded-lg text-xs font-bold transition-colors">
                      Eliminar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            
            {channels.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No has agregado canales de YouTube para monitorear.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
