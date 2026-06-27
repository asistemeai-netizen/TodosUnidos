'use server'

import { db, collectionCenters } from '@todosunidos/db';
import { revalidatePath } from 'next/cache';

export async function proposeCenterAction(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const state = formData.get('state') as string;
    const city = formData.get('city') as string;
    const neededItems = formData.get('neededItems') as string;
    const contactPhone = formData.get('contactPhone') as string;

    await db.insert(collectionCenters).values({
      name,
      address,
      state,
      city,
      neededItems,
      contactPhone,
      status: 'pendiente', // Siempre pendiente hasta que el admin apruebe
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in proposeCenterAction:', error);
    return { success: false, error: 'Ocurrió un error proponiendo el centro de acopio.' };
  }
}
