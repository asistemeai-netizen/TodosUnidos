import Image from "next/image";
import { db } from "@todosunidos/db";
import PersonCard from "../components/PersonCard";
import EarthquakeBanner from "../components/EarthquakeBanner";
import AiNewsFeed from "../components/AiNewsFeed";
import ReportPersonButton from "../components/ReportPersonButton";
import LinksCarousel from "../components/LinksCarousel";

// Opcional: Revalidación ISR para regenerar la página cada 60 segundos
export const revalidate = 60;

export default async function Home() {
  // Traemos a las personas unificadas ordenadas de más recientes a antiguas
  const persons = await db.query.unifiedPersons.findMany({
    orderBy: (persons, { desc }) => [desc(persons.createdAt)],
    limit: 15
  });

  return (
    <main className="flex flex-col min-h-screen bg-[#FAFAFA] relative">
      <div 
        className="fixed inset-0 z-0 opacity-10 bg-center bg-no-repeat bg-cover pointer-events-none"
        style={{ backgroundImage: "url('/vzla-bg.png')" }}
      ></div>
      {/* Banner Sismologico en tiempo real */}
      <EarthquakeBanner />
      
      {/* Premium Hero Section */}
      <div className="w-full bg-white relative overflow-hidden border-b border-slate-200">
        
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#f1b218] opacity-20 blur-[100px]"></div>
          <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-[#0f2861] opacity-10 blur-[120px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Content */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 font-bold text-sm mb-6 border border-red-100 shadow-sm animate-pulse">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Emergencia Nacional Activa
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-[#0f2861] tracking-tighter mb-2 leading-none drop-shadow-sm">
                TODOS<br className="hidden lg:block" /> UNIDOS<span className="text-[#f1b218] tracking-normal font-bold">.com</span>
              </h1>
              <h2 className="text-2xl md:text-4xl text-slate-700 font-bold mb-6 tracking-tight">
                Solidaridad para <span className="text-[#0f2861]">Venezuela</span>
              </h2>
              
              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl mb-10 leading-relaxed">
                Plataforma centralizada e inteligente para la unificación, reporte y búsqueda de personas extraviadas tras la contingencia sismológica.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <a href="/personas" className="group relative bg-[#0f2861] hover:bg-blue-900 text-white px-8 py-4 rounded-2xl font-bold shadow-[0_8px_30px_rgb(15,40,97,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_40px_rgb(15,40,97,0.4)] overflow-hidden inline-flex items-center justify-center">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="relative flex items-center gap-2 text-lg">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar Persona
                  </span>
                </a>
                <ReportPersonButton />
              </div>
            </div>

            {/* Right Logo Showcase */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
              {/* Glow behind logo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-[3rem] transform rotate-3 scale-105 -z-10 shadow-inner"></div>
              
              <div className="bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full z-0 transition-transform group-hover:scale-110"></div>
                <div className="w-full relative z-10 transition-transform duration-500 group-hover:scale-105">
                  <Image 
                    src="/corazonv3.png" 
                    alt="Logo Todos Unidos - Escudo" 
                    width={600} 
                    height={600} 
                    className="object-contain w-full h-auto drop-shadow-sm"
                    priority
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div id="busqueda" className="z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">

        <div className="flex justify-between items-end mb-2 px-2">
          <h2 className="text-3xl font-black text-[#0f2861] tracking-tight">Reportes Recientes</h2>
          <a href="/personas" className="text-[#f1b218] font-bold hover:text-amber-500 transition-colors flex items-center gap-1 text-sm md:text-base">
            Ver directorio completo <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
        
        {/* Grid de Personas Compacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {persons.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
          {persons.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              No hay reportes recientes registrados.
            </div>
          )}
        </div>
        
        <div className="flex justify-center mt-4">
          <a href="/personas" className="bg-white border-2 border-[#0f2861] text-[#0f2861] hover:bg-[#0f2861] hover:text-white px-8 py-3 rounded-xl font-bold shadow-sm transition-all text-sm uppercase tracking-wide">
            Explorar Base de Datos Completa
          </a>
        </div>
      </div>

      {/* Otras Plataformas de Ayuda */}
      <LinksCarousel />

      {/* AI News Feed - Gemini Integration (Ahora debajo de reportes recientes) */}
      <div id="noticias">
        <AiNewsFeed />
      </div>
    </main>
  );
}
