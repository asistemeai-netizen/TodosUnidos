import { db, unifiedPersons } from "@todosunidos/db";
import { ilike, or, desc, sql } from "drizzle-orm";
import PersonCard from "@/components/PersonCard";
import DirectorySearch from "@/components/DirectorySearch";
import Pagination from "@/components/Pagination";

export const revalidate = 60; // Regenerar cada minuto

// Definir interfaz de las props (Next.js 15+ espera que searchParams sea Promise)
interface PersonasPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function PersonasPage({ searchParams }: PersonasPageProps) {
  const resolvedParams = await searchParams;
  
  // Configuración de Paginación
  const limit = 24;
  const rawPage = resolvedParams?.page ? parseInt(resolvedParams.page, 10) : 1;
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const offset = (currentPage - 1) * limit;

  // Filtro de Búsqueda
  const query = resolvedParams?.q?.trim() || "";
  
  let whereCondition = undefined;
  if (query) {
    whereCondition = or(
      ilike(unifiedPersons.firstName, `%${query}%`),
      ilike(unifiedPersons.lastName, `%${query}%`),
      ilike(unifiedPersons.lastSeenLocation, `%${query}%`),
      ilike(unifiedPersons.documentId, `%${query}%`)
    );
  }

  // 1. Obtener los registros paginados y filtrados
  const persons = await db.query.unifiedPersons.findMany({
    where: whereCondition,
    orderBy: [desc(unifiedPersons.createdAt)],
    limit,
    offset,
  });

  // 2. Contar el total de registros para calcular totalPages
  // Usamos un count manual para optimizar
  const [{ count }] = await db.select({
    count: sql<number>`count(*)::int`
  })
  .from(unifiedPersons)
  .where(whereCondition);

  const totalPages = Math.ceil(count / limit);

  return (
    <div className="min-h-screen flex flex-col pt-24 relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 relative z-10">
        <div className="mb-8">
          <a href="/" className="text-slate-500 hover:text-[#0f2861] text-sm font-semibold mb-4 inline-flex items-center gap-1 transition-colors">
            <span aria-hidden="true">&larr;</span> Volver al inicio
          </a>
          <h1 className="text-4xl md:text-5xl font-black text-[#0f2861] tracking-tight">Directorio Nacional</h1>
          <p className="text-slate-500 mt-2 text-lg">Base de datos centralizada de personas reportadas.</p>
        </div>

        {/* Buscador Interactivo Real */}
        <DirectorySearch />

        {/* Resultados e Info de Paginación */}
        {query && (
          <div className="mb-4 text-sm font-medium text-slate-500">
            Se encontraron <span className="font-bold text-slate-800">{count}</span> resultados para "{query}"
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {persons.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
          
          {persons.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm relative">
                <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                {/* Decorative dots to make it look like a search scan */}
                <div className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                <div className="absolute bottom-6 left-4 w-2 h-2 rounded-full bg-amber-300"></div>
              </div>
              <p className="text-xl font-bold text-slate-800">No se encontraron resultados</p>
              <p className="text-slate-500 mt-1">
                {query ? 'Prueba buscando con otro nombre o término.' : 'El directorio está vacío en este momento.'}
              </p>
            </div>
          )}
        </div>

        {/* Controles de Paginación */}
        {totalPages > 1 && (
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        )}
      </div>
    </div>
  );
}
