const BASE_URL = 'https://desaparecidos-terremoto-api.theempire.tech/api/v1';

function getHeaders() {
  // Intentar leer la variable de entorno. Si el servidor de Next.js lleva días corriendo
  // y la variable se agregó recién, process.env no la tendrá. Usamos un fallback seguro.
  const apiKey = process.env.API_DESSAPARECIDOS || process.env.API_DESAPARECIDOS || "rec_live_h84lt2XNM03FhxVXa41nYt8bHcuJJwePdSnxMZLhkXc";
  
  console.log('--- DEBUG THEEMPIRE API ---');
  console.log('API Key en uso:', apiKey ? '***' + apiKey.slice(-5) : 'NINGUNA');
  
  if (!apiKey) {
    console.warn('Advertencia: No se encontró la variable de entorno API_DESSAPARECIDOS');
  }
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': apiKey,
  };
}

export interface EmpirePagination {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface EmpireList {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface EmpireListResponse {
  data: EmpireList[];
  pagination: EmpirePagination;
}

export interface EmpireListDetailEntry {
  id: string;
  nombre: string;
  edad?: number;
  estado?: string;
  detalles?: string;
}

export interface EmpireListDetailResponse {
  lista: EmpireList;
  centro?: {
    id: string;
    nombre: string;
    tipo: string;
  };
  entradas: EmpireListDetailEntry[];
}

export async function getHospitalLists(cursor?: string, limit: number = 100): Promise<EmpireListResponse | null> {
  try {
    const url = new URL(`${BASE_URL}/listas`);
    if (cursor) url.searchParams.append('cursor', cursor);
    if (limit) url.searchParams.append('limit', limit.toString());

    const res = await fetch(url.toString(), {
      headers: getHeaders(),
      next: { revalidate: 60 } // Cache por 60 segundos
    });

    if (!res.ok) {
      console.error(`Error fetching listas from TheEmpire: ${res.status} ${res.statusText}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Error de conexión con TheEmpire API:', error);
    return null;
  }
}

export async function getHospitalListDetail(id: string): Promise<EmpireListDetailResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}/listas/${id}`, {
      headers: getHeaders(),
      next: { revalidate: 60 } // Cache por 60 segundos
    });

    if (!res.ok) {
      console.error(`Error fetching lista ${id} from TheEmpire: ${res.status} ${res.statusText}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Error de conexión con TheEmpire API para lista detalle:', error);
    return null;
  }
}
