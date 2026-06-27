'use server'

import { db, unifiedPersons } from '@todosunidos/db';
import { revalidatePath } from 'next/cache';

export async function reportPersonAction(formData: FormData) {
  try {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const documentId = formData.get('documentId') as string;
    const ageRaw = formData.get('age') as string;
    const age = ageRaw ? Number(ageRaw) : null;
    const gender = formData.get('gender') as string;
    const status = formData.get('status') as string;
    const lastSeenLocation = formData.get('lastSeenLocation') as string;
    const additionalDetails = formData.get('additionalDetails') as string;
    const reporterContact = formData.get('reporterContact') as string;
    const photoUrl = formData.get('photoUrl') as string | null;

    await db.insert(unifiedPersons).values({
      firstName,
      lastName,
      documentId: documentId || null,
      age,
      gender: gender || null,
      status: status || 'desaparecido',
      lastSeenLocation,
      additionalDetails: additionalDetails || null,
      reporterContact: reporterContact || null,
      photoUrl: photoUrl || null,
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in reportPersonAction:', error);
    return { success: false, error: 'Ocurrió un error guardando el reporte.' };
  }
}
