import { db, collectionCenters } from '@todosunidos/db';
import { eq } from 'drizzle-orm';
import ProposeCenterButton from './ProposeCenterButton';
import CollectionCentersClient from './CollectionCentersClient';

export default async function CollectionCentersList() {
  const rawCenters = await db.query.collectionCenters.findMany({
    where: eq(collectionCenters.status, 'aprobado'),
    orderBy: (center, { desc }) => [desc(center.createdAt)],
  });

  // Identificamos las ciudades/estados de Venezuela que inyectamos
  const venezuelanCities = ['Caracas', 'Aragua', 'Carabobo', 'Miranda'];
  
  const centers = rawCenters.sort((a, b) => {
    const aIsVzla = venezuelanCities.includes(a.city);
    const bIsVzla = venezuelanCities.includes(b.city);
    
    if (aIsVzla && !bIsVzla) return -1;
    if (!aIsVzla && bIsVzla) return 1;
    
    // Si ambas están en Vzla, o ambas están fuera, ordenamos alfabéticamente por ciudad
    return a.city.localeCompare(b.city);
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-slate-50 border-t border-slate-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 border border-blue-200 text-[#00247D] text-xs font-bold uppercase tracking-widest mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Solidaridad Nacional
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0f2861] via-[#00247D] to-blue-500 mb-4 tracking-tighter drop-shadow-sm">
            Centros de Acopio
          </h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Lugares oficiales y verificados donde puedes llevar tus donaciones. Encuentra el centro más cercano y apoya a quienes más lo necesitan.
          </p>
        </div>
        <ProposeCenterButton />
      </div>

      <CollectionCentersClient centers={centers} />
    </div>
  );
}
