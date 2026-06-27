import React from 'react';

const LINKS = [
  {
    title: 'Sismo 911',
    description: 'Sistema de emergencias, reportes y alertas sismológicas en tiempo real.',
    url: 'https://sismo911.com',
    icon: (
      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  {
    title: 'Ayuda Venezuela Venevisión',
    description: 'Iniciativa oficial de la cadena Venevisión para la recolección de fondos y acopio.',
    url: 'https://ayudavenezuela.venevision.com/',
    icon: (
      <svg className="w-5 h-5 text-[#0f2861]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: 'Desaparecidos Terremoto Venezuela',
    description: 'Base de datos alternativa para búsqueda y reporte de personas extraviadas.',
    url: 'https://desaparecidosterremotovenezuela.com/',
    icon: (
      <svg className="w-5 h-5 text-[#f1b218]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11a3 3 0 100-6 3 3 0 000 6zM4 18a6 6 0 0112 0" />
      </svg>
    )
  },
  {
    title: 'Red Ayuda Venezuela',
    description: 'Red comunitaria de voluntarios y rescatistas coordinando esfuerzos en terreno.',
    url: 'https://redayudavenezuela.com/desaparecidos',
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    title: 'Venezuela Ayuda (Vercel)',
    description: 'Plataforma comunitaria de emergencia creada por desarrolladores independientes.',
    url: 'https://venezuela-ayuda.vercel.app/',
    icon: (
      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    title: 'U.S. Department of State',
    description: 'Información y respuesta oficial del gobierno de los Estados Unidos ante la emergencia.',
    url: 'https://www.state.gov/responding-to-venezuela-earthquakes',
    icon: (
      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    )
  },
  {
    title: 'Centros de Acopio Vzla',
    description: 'Directorio nacional independiente de centros de acopio y lugares de donación.',
    url: 'https://www.centrosdeacopiovzla.com/',
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    title: 'Venezuela Te Busca',
    description: 'Iniciativa civil enfocada en la búsqueda activa y reunificación familiar.',
    url: 'https://venezuelatebusca.com/',
    icon: (
      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    title: 'Venezuela Reporta',
    description: 'Red ciudadana para el reporte, monitoreo y verificación de emergencias.',
    url: 'https://venezuelareporta.org/',
    icon: (
      <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    )
  }
];

export default function LinksCarousel() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      <div className="flex justify-between items-end mb-6 px-2">
        <div>
          <h2 className="text-3xl font-black text-[#0f2861] tracking-tight">Otras Redes de Ayuda</h2>
          <p className="text-slate-500 font-medium mt-1">
            Plataformas e iniciativas aliadas sumando esfuerzos en esta contingencia.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {LINKS.map((link, idx) => (
            <a 
              key={idx} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:border-[#f1b218] transition-all hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform group-hover:bg-amber-50 group-hover:border-amber-100">
                    {link.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#0f2861] transition-colors line-clamp-2">
                    {link.title}
                  </h3>
                </div>
                <p className="text-slate-500 text-xs line-clamp-2 mb-2">
                  {link.description}
                </p>
              </div>
              <div className="mt-2 flex items-center text-[#f1b218] font-bold text-xs uppercase tracking-wider group-hover:text-amber-500 transition-colors">
                Visitar sitio 
                <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
