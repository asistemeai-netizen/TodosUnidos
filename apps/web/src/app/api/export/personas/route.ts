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

    const headers = ['ID', 'Nombres', 'Apellidos', 'Cedula', 'Edad', 'Genero', 'Estatus', 'Ultima Ubicacion', 'Fecha Ultima Vez', 'Contacto Reportante', 'Fecha Registro'];
    
    const escapeCsv = (str: string | number | null | undefined | Date) => {
      if (str === null || str === undefined) return '""';
      if (str instanceof Date) {
        return `"${str.toISOString()}"`;
      }
      const stringified = String(str);
      return `"${stringified.replace(/"/g, '""')}"`;
    };

    // Crear un stream para no colapsar la memoria con 70,000 registros
    const stream = new ReadableStream({
      async start(controller) {
        const bom = '\uFEFF';
        controller.enqueue(bom + headers.join(',') + '\n');

        let offset = 0;
        const limit = 5000;
        let hasMore = true;

        try {
          while (hasMore) {
            // Usamos select normal (es más ligero en memoria que db.query)
            const chunk = await db.select({
              id: unifiedPersons.id,
              firstName: unifiedPersons.firstName,
              lastName: unifiedPersons.lastName,
              documentId: unifiedPersons.documentId,
              age: unifiedPersons.age,
              gender: unifiedPersons.gender,
              status: unifiedPersons.status,
              lastSeenLocation: unifiedPersons.lastSeenLocation,
              lastSeenDate: unifiedPersons.lastSeenDate,
              reporterContact: unifiedPersons.reporterContact,
              createdAt: unifiedPersons.createdAt,
            })
            .from(unifiedPersons)
            .where(whereCondition)
            .orderBy(desc(unifiedPersons.createdAt))
            .limit(limit)
            .offset(offset);

            if (chunk.length === 0) {
              hasMore = false;
              break;
            }

            const rows = chunk.map(p => [
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
            ].join(',')).join('\n') + '\n';

            controller.enqueue(rows);
            offset += limit;
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new NextResponse(stream, {
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
