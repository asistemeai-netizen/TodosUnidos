import { db } from '@todosunidos/db';
import { desc } from 'drizzle-orm';

export default async function AiNewsFeed() {
  // Obtenemos el boletín más reciente generado por Gemini
  const latestNews = await db.query.newsSummaries.findFirst({
    orderBy: (news, { desc }) => [desc(news.createdAt)],
  });

  if (!latestNews) {
    return null; // Si no hay noticias, no renderizamos el componente
  }

  // Parsear la fecha para mostrar algo amigable
  const dateFormatted = new Intl.DateTimeFormat('es-VE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Caracas'
  }).format(latestNews.createdAt);

  return (
    <div className="w-full bg-slate-900 border-b-4 border-[#f1b218] overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          
          {/* AI Badge */}
          <div className="flex-shrink-0 flex items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Boletín Inteligente</p>
              <p className="text-white font-bold text-sm leading-none">Generado por IA</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
              {latestNews.title}
            </h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-2">
              {latestNews.content}
            </p>
            {latestNews.sourceName && (
              <span className="inline-block bg-white/10 text-slate-300 text-xs px-2 py-1 rounded border border-white/10">
                Fuente: {latestNews.sourceName}
              </span>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex-shrink-0 text-right">
            <p className="text-slate-400 text-xs font-medium">Última actualización</p>
            <p className="text-[#f1b218] text-sm font-bold">{dateFormatted}</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
