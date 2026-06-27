import { db } from "@todosunidos/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Noticias e Inteligencia - Todos Unidos",
  description: "Historial de boletines inteligentes generados para monitorear la situación.",
};

export const revalidate = 60;

export default async function NoticiasPage() {
  const allNews = await db.query.newsSummaries.findMany({
    orderBy: (news, { desc }) => [desc(news.createdAt)],
  });

  return (
    <div className="flex-1 min-h-screen pt-12 pb-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 border-b-2 border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 font-bold text-xs uppercase tracking-wider mb-6 border border-purple-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Motor IA Gemini
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0f2861] tracking-tight mb-4">
            Boletines de Noticias
          </h1>
          <p className="text-lg text-slate-600">
            Resúmenes automatizados de la situación actual, filtrando el ruido para mantenerte informado con lo más importante. Actualizados automáticamente.
          </p>
        </div>

        <div className="space-y-8 relative">
          {/* Vertical line connecting the timeline */}
          <div className="absolute left-4 md:left-8 top-4 bottom-0 w-0.5 bg-slate-200 -z-10"></div>
          
          {allNews.map((news) => {
            const dateFormatted = new Intl.DateTimeFormat('es-VE', {
              dateStyle: 'full',
              timeStyle: 'short',
              timeZone: 'America/Caracas'
            }).format(news.createdAt);
            
            return (
              <div key={news.id} className="relative pl-12 md:pl-20">
                {/* Timeline dot */}
                <div className="absolute left-2.5 md:left-6.5 top-6 w-3.5 h-3.5 rounded-full bg-[#f1b218] ring-4 ring-white shadow-sm -translate-x-1/2"></div>
                
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                      {news.title}
                    </h2>
                    <div className="shrink-0 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {dateFormatted}
                    </div>
                  </div>
                  
                  <div className="prose prose-slate max-w-none mb-6">
                    <p className="text-slate-700 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                      {news.content}
                    </p>
                  </div>
                  
                  {news.sourceName && (
                    <div className="flex items-center gap-2 border-t border-slate-100 pt-4 mt-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fuente consolidada:</span>
                      <span className="text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        {news.sourceName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {allNews.length === 0 && (
            <div className="pl-12 md:pl-20 py-12">
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Aún no hay boletines</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  El motor de inteligencia artificial está analizando las fuentes. El primer boletín aparecerá pronto.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
