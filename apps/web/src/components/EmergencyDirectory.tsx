import React from 'react';

const emergencyData = [
  {
    category: "Líneas de Emergencia Directas",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    items: [
      { name: "Movistar", numbers: ["911"] },
      { name: "Cantv (desde fijo)", numbers: ["171"] },
      { name: "Digitel", numbers: ["112"] },
      { name: "Movilnet", numbers: ["*1"] },
    ]
  },
  {
    category: "Ambulancias y Paramédicos",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    items: [
      { name: "Servicio de Ambulancia Metropolitano", numbers: ["(0212) 545.45.45", "(0212) 545.46.55", "(0212) 577.92.09"] },
      { name: "Aeroambulancias", numbers: ["(0212) 993.25.41", "(0212) 992.89.80", "(0212) 992.89.90", "(0212) 991.79.40"] },
      { name: "Rescarven", numbers: ["(0212) 993.69.11", "(0212) 993.69.91", "(0212) 993.13.10", "(0212) 993.33.67"] },
    ]
  },
  {
    category: "Hospitales y Clínicas (Caracas)",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    items: [
      { name: "Hospital José Gregorio Hernández (Los Magallanes)", numbers: ["(0212) 870.78.97"] },
      { name: "Hospital Miguel Pérez Carreño (Bella Vista)", numbers: ["(0212) 472.84.72"] },
      { name: "Hospital Militar (San Martín)", numbers: ["(0212) 406.12.41"] },
      { name: "Hospital Periférico de Catia (Catia)", numbers: ["(0212) 870.27.71"] },
      { name: "Hospital Periférico de Coche (Coche)", numbers: ["(0212) 681.11.33"] },
      { name: "Policlínica David Lobo (Santa Rosalía)", numbers: ["(0212) 541.54.65"] },
      { name: "Policlínica La Arboleda (San Bernardino)", numbers: ["(0212) 550.18.11"] },
      { name: "Policlínica Las Mercedes (Las Mercedes)", numbers: ["(0212) 993.23.23"] },
      { name: "Policlínica Santiago de León (Sabana Grande)", numbers: ["(0212) 762.90.25"] },
    ]
  },
  {
    category: "Hospitales y Clínicas (Carabobo)",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    items: [
      { name: "Ciudad Hospitalaria Dr. Enrique Tejera (CHET)", numbers: ["(0241) 853-3385", "(0241) 861-0089", "(0241) 861-0172"] },
      { name: "Cruz Roja Venezolana (Filial Valencia)", numbers: ["(0241) 825-6436", "(0241) 821-4841"] },
      { name: "Hospital Metropolitano del Norte", numbers: ["(0241) 700-7000", "(0241) 782-7295"] },
      { name: "Centro Policlínico Valencia (La Viña)", numbers: ["(0241) 820-2611", "(0241) 820-2600"] },
      { name: "Centro Médico Dr. Rafael Guerra Méndez", numbers: ["(0241) 856-0899", "(0241) 857-1741"] },
      { name: "Clínica Venezuela", numbers: ["(0241) 850-0301", "(0241) 850-0311"] },
      { name: "Centro Clínico Flor Amarillo", numbers: ["(0241) 878-2931"] },
      { name: "Instituto Clínico San Blas", numbers: ["(0241) 859-0945", "(0241) 859-0001"] },
      { name: "Maternidad del Este", numbers: ["(0241) 859-1055", "(0241) 859-3543"] },
      { name: "Centro Médico Los Guayos", numbers: ["(0241) 833-1553"] },
      { name: "Centro Médico Valle de San Diego", numbers: ["(0241) 300-0300"] },
    ]
  },
  {
    category: "Bomberos y Protección Civil",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
    items: [
      { name: "Antímano", numbers: ["(0212) 472.20.54"] },
      { name: "Catia la Mar", numbers: ["(0212) 351.99.66"] },
      { name: "Chacao", numbers: ["(0212) 265.32.61"] },
      { name: "del Este (Cafetal)", numbers: ["(0212) 987.43.34", "(0212) 985.50.60"] },
      { name: "El Cafetal", numbers: ["(0212) 985.36.40", "(0212) 985.29.77"] },
      { name: "El Paraíso", numbers: ["(0212) 481.09.61"] },
      { name: "El Valle", numbers: ["(0212) 672.01.75", "(0212) 672.06.36"] },
      { name: "La Guaira", numbers: ["(0212) 332.76.20", "(0212) 331.04.45"] },
      { name: "La Trinidad", numbers: ["(0212) 943.43.61"] },
      { name: "La Urbina", numbers: ["(0212) 241.66.41"] },
      { name: "Metropolitanos", numbers: ["(0212) 545.45.45"] },
      { name: "Miranda", numbers: ["(0212) 235.69.67"] },
      { name: "Plaza Venezuela", numbers: ["(0212) 793.00.39", "(0212) 793.64.57"] },
      { name: "Protección Civil Carabobo", numbers: ["(0241) 859-2171"] },
      { name: "Puerto Cabello", numbers: ["(0242) 362-2461"] },
      { name: "San Bernardino", numbers: ["(0212) 577.92.09"] },
      { name: "Sucre", numbers: ["(0212) 985.36.40"] },
      { name: "Valencia", numbers: ["(0241) 838-7372"] },
    ]
  }
];

export default function EmergencyDirectory() {
  return (
    <section className="w-full max-w-7xl mx-auto mt-16 mb-24 px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Directorio de Emergencias</h2>
        <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-lg">Contactos oficiales y líneas de asistencia inmediata en caso de emergencia médica o de rescate.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {emergencyData.map((category, index) => (
          <div key={index} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="bg-red-50 text-vzla-red p-3 rounded-2xl">
                {category.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{category.category}</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {category.items.map((item, itemIdx) => (
                <div key={itemIdx} className="bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-2xl">
                  <h4 className="font-semibold text-slate-700 mb-2 leading-tight">{item.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.numbers.map((num, numIdx) => (
                      <a 
                        key={numIdx}
                        href={`tel:${num.replace(/[^0-9+]/g, '')}`} 
                        className="inline-flex items-center text-sm font-bold text-vzla-blue bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-full hover:border-vzla-blue hover:text-vzla-blue transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 mr-1.5 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {num}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <p className="text-amber-800 font-medium flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Ante una emergencia médica o de rescate severa, intenta siempre comunicarte primero con los organismos oficiales (911 / 171).
        </p>
      </div>
    </section>
  );
}
