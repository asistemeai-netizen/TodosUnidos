import { getAllYoutubeVideosAction } from "../actions";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from "next/link";

export const revalidate = 60;

export default async function VideosPage() {
  const youtubeVideos = await getAllYoutubeVideosAction();

  return (
    <main className="flex flex-col min-h-screen relative pb-20">

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex flex-col gap-2 mb-8">
          <Link href="/" className="text-slate-500 font-bold hover:text-[#0f2861] transition-colors flex items-center gap-2 mb-4 w-fit">
            <span aria-hidden="true">&larr;</span> Volver al Inicio
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-[#0f2861] tracking-tight">
            Archivo de <span className="text-red-600">Reportes en Video</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-3xl">
            Cobertura continua de noticias y reportes audiovisuales provenientes de fuentes oficiales y verificadas.
          </p>
        </div>

        {youtubeVideos.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
            Aún no hay videos registrados en el sistema.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {youtubeVideos.map(video => (
              <a key={video.id} href={video.url} target="_blank" rel="noopener noreferrer" className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group block flex flex-col h-full">
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden shrink-0">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">Sin miniatura</div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                  <div className="absolute bottom-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                    ▶ Ver video
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-3 shrink-0">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider line-clamp-1">{video.channelName}</span>
                    <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true, locale: es })}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 leading-snug line-clamp-3 group-hover:text-red-600 transition-colors">{video.title}</h3>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
