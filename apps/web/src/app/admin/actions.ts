'use server'

import { db, potentialDuplicates, platformReports, unifiedPersons } from '@todosunidos/db';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function resolveDuplicate(formData: FormData) {
  const duplicateId = formData.get('duplicateId') as string;
  const actionType = formData.get('actionType') as string; // 'merge' | 'reject'
  const reportId = formData.get('reportId') as string;
  
  if (!duplicateId || !actionType) return;

  if (actionType === 'merge') {
    const unifiedPersonId = formData.get('unifiedPersonId') as string;
    
    // 1. Amarramos el reporte a la ficha maestra oficial
    await db.update(platformReports)
      .set({ unifiedPersonId })
      .where(eq(platformReports.id, Number(reportId)));

    // 2. Marcamos el duplicado como resuelto (vinculado)
    await db.update(potentialDuplicates)
      .set({ status: 'resuelto' })
      .where(eq(potentialDuplicates.id, Number(duplicateId)));

  } else if (actionType === 'reject') {
    // 1. Marcamos el duplicado como rechazado
    await db.update(potentialDuplicates)
      .set({ status: 'rechazado' })
      .where(eq(potentialDuplicates.id, Number(duplicateId)));

    // 2. Como son personas distintas, le creamos su propia Ficha Maestra nueva
    // (Buscamos el reporte crudo para tener sus datos originales)
    const report = await db.query.platformReports.findFirst({
      where: eq(platformReports.id, Number(reportId))
    });

    if (report) {
      const [newUnified] = await db.insert(unifiedPersons).values({
        firstName: report.rawFirstName,
        lastName: report.rawLastName,
        documentId: report.rawDocumentId,
        status: report.rawStatus,
        photoUrl: report.rawPhotoUrl,
        // (Otros datos extraídos del JSON crudo si los tuviéramos)
      }).returning();

      // Amarramos el reporte a SU NUEVA ficha maestra
      await db.update(platformReports)
        .set({ unifiedPersonId: newUnified.id })
        .where(eq(platformReports.id, report.id));
    }
  }

  // Refrescamos la vista del dashboard para que el componente Server renderice la data nueva
  revalidatePath('/admin');
  // También refrescamos el home por si apareció una persona nueva
  revalidatePath('/');
}
