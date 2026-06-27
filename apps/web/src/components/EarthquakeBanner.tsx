import React from 'react';

// Bounding box aproximado para Venezuela
const VZLA_MIN_LAT = 0.6;
const VZLA_MAX_LAT = 12.2;
const VZLA_MIN_LNG = -73.4;
const VZLA_MAX_LNG = -59.8;

interface USGSFeature {
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
  };
}

export default async function EarthquakeBanner() {
  // Calculamos la fecha de hace 48 horas
  const date = new Date();
  date.setDate(date.getDate() - 2);
  const startTime = date.toISOString();

  // URL del API de USGS
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=${VZLA_MIN_LAT}&maxlatitude=${VZLA_MAX_LAT}&minlongitude=${VZLA_MIN_LNG}&maxlongitude=${VZLA_MAX_LNG}&starttime=${startTime}&minmagnitude=3.0&orderby=time`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } }); // Caché de 60 segundos
    if (!res.ok) return null;
    
    const data = await res.json();
    const features: USGSFeature[] = data.features;

    if (!features || features.length === 0) {
      return null; // No hay sismos recientes
    }

    // Tomamos el sismo más reciente
    const latest = features[0];
    const { mag, place, time, url: eventUrl } = latest.properties;
    
    const dateObj = new Date(time);
    const timeStr = dateObj.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
    const dateStr = dateObj.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' });

    // Determinar severidad
    const isHigh = mag >= 5.0;
    const bannerColor = isHigh ? 'bg-red-600' : 'bg-orange-500';

    return (
      <div className={`${bannerColor} text-white px-4 py-3 w-full shadow-md z-50 flex justify-center`}>
        <div className="max-w-7xl w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <span className="font-bold">Monitoreo Sísmico:</span> Sismo magnitud <span className="font-black bg-white/20 px-1 rounded">{mag.toFixed(1)}</span> registrado en {place}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span>{dateStr} - {timeStr}</span>
            <a 
              href={eventUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
            >
              Ver reporte USGS
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching earthquake data", error);
    return null; // Si falla la API, simplemente no mostramos el banner
  }
}
