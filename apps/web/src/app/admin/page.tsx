import { checkAuth } from '@/actions/adminActions';
import { db, unifiedPersons, collectionCenters, potentialDuplicates, apiKeys, personTips } from '@todosunidos/db';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

export default async function AdminDashboard() {
  await checkAuth();

  // Obtener métricas
  const persons = await db.query.unifiedPersons.findMany();
  const pendingCenters = await db.query.collectionCenters.findMany({
    where: eq(collectionCenters.status, 'pendiente')
  });
  const pendingDuplicates = await db.query.potentialDuplicates.findMany({
    where: eq(potentialDuplicates.status, 'pendiente')
  });
  const activeKeys = await db.query.apiKeys.findMany({
    where: eq(apiKeys.isActive, true)
  });
  const totalTips = await db.query.personTips.findMany();

  return (
    <div>
      <h1 className="text-3xl font-black text-[#0f2861] mb-2">Panel de Control</h1>
      <p className="text-slate-500 mb-8">Resumen operativo de Todos Unidos</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Personas Buscadas</span>
          <span className="text-3xl font-black text-[#0f2861]">{persons.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-400"></div>
          <span className="text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">Acopios Pendientes</span>
          <span className="text-3xl font-black text-amber-600 mb-2">{pendingCenters.length}</span>
          {pendingCenters.length > 0 && (
            <Link href="/admin/acopio" className="text-sm font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1">
              Revisar ahora <span>→</span>
            </Link>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-red-400"></div>
          <span className="text-red-800 text-xs font-bold uppercase tracking-wider mb-2">Posibles Duplicados</span>
          <span className="text-3xl font-black text-red-600 mb-2">{pendingDuplicates.length}</span>
          {pendingDuplicates.length > 0 && (
            <Link href="/admin/duplicados" className="text-sm font-bold text-red-700 hover:text-red-900 flex items-center gap-1">
              Resolver ahora <span>→</span>
            </Link>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-400"></div>
          <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">Llaves API Activas</span>
          <span className="text-3xl font-black text-emerald-600 mb-2">{activeKeys.length}</span>
          <Link href="/admin/api" className="text-sm font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1">
            Gestionar API <span>→</span>
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-400"></div>
          <span className="text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">Aportes (Tips)</span>
          <span className="text-3xl font-black text-purple-600 mb-2">{totalTips.length}</span>
          <Link href="/admin/personas" className="text-sm font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1">
            Revisar en Directorio <span>→</span>
          </Link>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
        <h3 className="text-lg font-bold text-[#0f2861] mb-2">Bienvenido al Centro de Mando</h3>
        <p className="text-slate-600">
          Usa el menú lateral para navegar entre las diferentes secciones. Recuerda que cualquier acción de aprobación o rechazo que tomes aquí se reflejará inmediatamente en la web pública para todos los ciudadanos.
        </p>
      </div>
    </div>
  );
}
