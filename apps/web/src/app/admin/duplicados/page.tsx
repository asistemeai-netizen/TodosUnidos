import { checkAuth, resolveDuplicateAction, rejectDuplicateAction } from '@/actions/adminActions';
import { db, potentialDuplicates, unifiedPersons } from '@todosunidos/db';
import { desc, eq, or } from 'drizzle-orm';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default async function AdminDuplicadosPage() {
  await checkAuth();

  // Buscar todos los duplicados pendientes con sus personas asociadas
  const duplicates = await db.query.potentialDuplicates.findMany({
    where: eq(potentialDuplicates.status, 'pendiente'),
    orderBy: [desc(potentialDuplicates.createdAt)],
    with: {
      unifiedPerson: {
        with: { tips: true }
      },
      duplicatePerson: {
        with: { tips: true }
      }
    }
  });

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0f2861] mb-2">Resolución de Duplicados</h1>
          <p className="text-slate-500">Compara los perfiles lado a lado y decide si son la misma persona.</p>
        </div>
        <Link href="/admin" className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
          Volver al Panel
        </Link>
      </div>

      {duplicates.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
          <h2 className="text-xl font-bold text-emerald-800 mb-2">¡Todo limpio!</h2>
          <p className="text-emerald-600">No hay posibles duplicados pendientes por revisar en el sistema.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {duplicates.map((dup) => {
            const p1 = dup.unifiedPerson;
            const p2 = dup.duplicatePerson;

            // Si alguno de los perfiles fue borrado previamente y quedó huérfano, no lo mostramos bien
            if (!p1 || !p2) return null;

            return (
              <div key={dup.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Similitud: {dup.confidenceScore}%
                    </span>
                    <span className="text-sm font-bold text-slate-600">Detectado: {new Date(dup.createdAt).toLocaleDateString('es-VE')}</span>
                  </div>
                  <form action={async () => {
                    'use server';
                    await rejectDuplicateAction(dup.id);
                  }}>
                    <button type="submit" className="text-slate-500 hover:text-red-600 text-sm font-bold transition-colors">
                      Falso Positivo (No son la misma persona)
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* Persona A (Izquierda) */}
                  <div className="p-6 bg-slate-50 hover:bg-blue-50/30 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perfil A (Original)</span>
                      <form action={async () => {
                        'use server';
                        // Keep P1, Discard P2
                        await resolveDuplicateAction(dup.id, p1.id, p2.id);
                      }}>
                        <button type="submit" className="bg-[#0f2861] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm">
                          Mantener este perfil
                        </button>
                      </form>
                    </div>

                    <div className="flex gap-4">
                      {p1.photoUrl ? (
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative">
                          <Image src={p1.photoUrl} alt="Foto" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-2xl shrink-0">
                          {p1.firstName.charAt(0)}{p1.lastName.charAt(0)}
                        </div>
                      )}
                      
                      <div className="space-y-2 flex-1">
                        <div>
                          <h3 className="font-black text-xl text-slate-900 leading-tight">{p1.firstName} {p1.lastName}</h3>
                          <span className="text-xs text-slate-400">ID: {p1.id.split('-')[0]}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-400 text-xs block">Documento</span>
                            <span className="font-medium text-slate-700">{p1.documentId || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs block">Edad</span>
                            <span className="font-medium text-slate-700">{p1.age || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs block">Género</span>
                            <span className="font-medium text-slate-700">{p1.gender || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs block">Estatus</span>
                            <span className="font-medium text-slate-700 capitalize">{p1.status.replace('_', ' ')}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <span className="text-slate-400 text-xs block mb-1">Pistas Ciudadanas</span>
                          <span className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs">{p1.tips.length} aportes</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Persona B (Derecha) */}
                  <div className="p-6 bg-slate-50 hover:bg-blue-50/30 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perfil B (Duplicado)</span>
                      <form action={async () => {
                        'use server';
                        // Keep P2, Discard P1
                        await resolveDuplicateAction(dup.id, p2.id, p1.id);
                      }}>
                        <button type="submit" className="bg-[#0f2861] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm">
                          Mantener este perfil
                        </button>
                      </form>
                    </div>

                    <div className="flex gap-4">
                      {p2.photoUrl ? (
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative">
                          <Image src={p2.photoUrl} alt="Foto" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-2xl shrink-0">
                          {p2.firstName.charAt(0)}{p2.lastName.charAt(0)}
                        </div>
                      )}
                      
                      <div className="space-y-2 flex-1">
                        <div>
                          <h3 className="font-black text-xl text-slate-900 leading-tight">{p2.firstName} {p2.lastName}</h3>
                          <span className="text-xs text-slate-400">ID: {p2.id.split('-')[0]}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-400 text-xs block">Documento</span>
                            <span className="font-medium text-slate-700">{p2.documentId || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs block">Edad</span>
                            <span className="font-medium text-slate-700">{p2.age || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs block">Género</span>
                            <span className="font-medium text-slate-700">{p2.gender || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs block">Estatus</span>
                            <span className="font-medium text-slate-700 capitalize">{p2.status.replace('_', ' ')}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <span className="text-slate-400 text-xs block mb-1">Pistas Ciudadanas</span>
                          <span className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs">{p2.tips.length} aportes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 px-6 py-3 text-xs text-yellow-800 border-t border-yellow-100 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>Al hacer clic en "Mantener este perfil", el otro perfil será <strong>borrado de la base de datos</strong>, pero sus pistas y reportes se transferirán automáticamente al perfil que conservaste.</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
