import { NextResponse } from 'next/server';
import { db, unifiedPersons } from '@todosunidos/db';
import { ilike, or, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max duration for Vercel just in case

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    let whereCondition = undefined;
    if (query) {
      whereCondition = or(
        ilike(unifiedPersons.firstName, `%${query}%`),
        ilike(unifiedPersons.lastName, `%${query}%`),
        ilike(sql`concat(${unifiedPersons.firstName}, ' ', ${unifiedPersons.lastName})`, `%${query}%`),
        ilike(unifiedPersons.lastSeenLocation, `%${query}%`),
        ilike(unifiedPersons.documentId, `%${query}%`)
      );
    }

    // Obtenemos todos los registros (sin límite, pero solo los campos que importan para exportar)
    const persons = await db.query.unifiedPersons.findMany({
      where: whereCondition,
      orderBy: [desc(unifiedPersons.createdAt)],
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        documentId: true,
        age: true,
        gender: true,
        status: true,
        lastSeenLocation: true,
        lastSeenDate: true,
        reporterContact: true,
        createdAt: true,
      }
    });

    const headers = ['ID', 'Nombres', 'Apellidos', 'Cedula', 'Edad', 'Genero', 'Estatus', 'Ultima Ubicacion', 'Fecha Ultima Vez', 'Contacto Reportante', 'Fecha Registro'];
    
    // Función auxiliar para escapar comillas y comas en CSV
    const escapeCsv = (str: string | number | null | undefined | Date) => {
      if (str === null || str === undefined) return '""';
      if (str instanceof Date) {
        return `"${str.toISOString()}"`;
      }
      const stringified = String(str);
      return `"${stringified.replace(/"/g, '""')}"`;
    };

    const rows = persons.map(p => [
      escapeCsv(p.id),
      escapeCsv(p.firstName),
      escapeCsv(p.lastName),
      escapeCsv(p.documentId),
      escapeCsv(p.age),
      escapeCsv(p.gender),
      escapeCsv(p.status),
      escapeCsv(p.lastSeenLocation),
      escapeCsv(p.lastSeenDate),
      escapeCsv(p.reporterContact),
      escapeCsv(p.createdAt),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Añadir BOM (Byte Order Mark) para que Excel lo lea bien con UTF-8
    const bom = '\uFEFF';
    
    return new NextResponse(bom + csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="directorio_personas.csv"',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generando CSV:', error);
    return new NextResponse('Error interno del servidor generando el CSV', { status: 500 });
  }
}
