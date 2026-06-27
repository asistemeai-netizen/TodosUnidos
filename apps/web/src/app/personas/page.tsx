import { db } from "@todosunidos/db";
import PersonCard from "@/components/PersonCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const revalidate = 60; // Regenerar cada minuto

export default async function PersonasPage() {
  const persons = await db.query.unifiedPersons.findMany({
    orderBy: (persons, { desc }) => [desc(persons.createdAt)],
    limit: 100 // Por ahora mostramos los últimos 100 en la vista de lista completa
  });

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

        {/* Buscador Simple (Placeholder visual por ahora) */}
        <div className="mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center">
           <svg className="w-6 h-6 text-slate-400 ml-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
           </svg>
           <input type="text" placeholder="Buscar por nombre, apellido o ubicación..." className="w-full bg-transparent border-none outline-none text-slate-700 py-3 px-2 placeholder-slate-400" />
           <button className="bg-[#0f2861] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors ml-2">Buscar</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full pb-12">
          {persons.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
          {persons.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-xl font-semibold text-slate-700">El directorio está vacío</p>
              <p className="text-slate-500 mt-1">No se encontraron reportes en la base de datos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
