import { checkAuth } from '@/actions/adminActions';
import { db, collectionCenters } from '@todosunidos/db';
import { eq } from 'drizzle-orm';
import CenterActionButtons from '@/components/CenterActionButtons';

export default async function AdminAcopioPage() {
  await checkAuth();

  const pendingCenters = await db.query.collectionCenters.findMany({
    where: eq(collectionCenters.status, 'pendiente'),
    orderBy: (center, { desc }) => [desc(center.createdAt)],
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-[#0f2861] mb-2">Moderar Centros de Acopio</h1>
      <p className="text-slate-500 mb-8">Revisa y aprueba los lugares sugeridos por la comunidad.</p>

      {pendingCenters.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Todo al día</h3>
          <p className="text-slate-500">No hay sugerencias de centros pendientes de revisión.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingCenters.map((center) => (
            <div key={center.id} className="bg-white rounded-2xl p-6 shadow-sm border border-amber-200 relative">
              <div className="absolute top-0 right-0 w-2 h-full bg-amber-400 rounded-r-2xl"></div>
              
              <div className="flex justify-between items-start mb-4">
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Pendiente
                </span>
                <span className="text-slate-400 text-xs font-medium">
                  {new Date(center.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-1">{center.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{center.address} • {center.city}, {center.state}</p>
              
              <div className="bg-slate-50 p-3 rounded-lg text-sm mb-4">
                <span className="block font-bold text-slate-700 mb-1">Insumos solicitados:</span>
                <p className="text-slate-600">{center.neededItems}</p>
              </div>

              {center.contactPhone && (
                <p className="text-sm text-slate-600 mb-4 font-medium">📞 {center.contactPhone}</p>
              )}

              <CenterActionButtons centerId={center.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
