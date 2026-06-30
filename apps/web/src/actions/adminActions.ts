'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, collectionCenters, unifiedPersons, personTips, apiKeys, webhooks, youtubeChannels, youtubeVideos, potentialDuplicates, eq } from '@todosunidos/db';
import { revalidatePath } from 'next/cache';

// 1. Manejo de Sesión (Login muy básico para emergencias)
export async function loginAdminAction(formData: FormData) {
  const password = formData.get('password') as string;
  const adminPass = process.env.ADMIN_PASSWORD || 'vzlalibre2026';

  if (password === adminPass) {
    const cookieStore = await cookies();
    cookieStore.set('admin_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
    });
    return { success: true };
  }
  
  return { success: false, error: 'Contraseña incorrecta' };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/admin/login');
}

export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  if (!token || token.value !== 'authenticated') {
    redirect('/admin/login');
  }
}

// 2. Moderación de Centros de Acopio
export async function approveCenterAction(id: string) {
  await checkAuth();
  
  await db.update(collectionCenters)
    .set({ status: 'aprobado' })
    .where(eq(collectionCenters.id, id));
    
  revalidatePath('/');
  revalidatePath('/admin/acopio');
}

export async function rejectCenterAction(id: string) {
  await checkAuth();
  
  await db.delete(collectionCenters)
    .where(eq(collectionCenters.id, id));
    
  revalidatePath('/');
  revalidatePath('/admin/acopio');
}

// 3. Moderación del Directorio de Personas
export async function changePersonStatusAction(id: string, newStatus: string) {
  await checkAuth();
  
  await db.update(unifiedPersons)
    .set({ status: newStatus })
    .where(eq(unifiedPersons.id, id));
    
  revalidatePath('/personas');
  revalidatePath('/admin/personas');
}

export async function deletePersonAction(id: string) {
  await checkAuth();
  
  // Primero eliminamos los aportes relacionados para evitar error de llave foránea
  await db.delete(personTips).where(eq(personTips.unifiedPersonId, id));
  
  // Luego eliminamos a la persona
  await db.delete(unifiedPersons).where(eq(unifiedPersons.id, id));
    
  revalidatePath('/personas');
  revalidatePath('/admin/personas');
}

// 4. Moderación de Aportes Ciudadanos
export async function deleteTipAction(id: string) {
  await checkAuth();
  
  await db.delete(personTips).where(eq(personTips.id, id));
    
  revalidatePath('/admin/personas');
}

// 5. Gestión de API y Alianzas
export async function generateApiKeyAction(platformName: string) {
  await checkAuth();
  
  const crypto = require('crypto');
  const key = 'tu_' + crypto.randomBytes(24).toString('hex');
  
  await db.insert(apiKeys).values({
    key,
    platformName
  });
  
  revalidatePath('/admin/api');
  return key; // Devolvemos la llave para mostrarla una sola vez
}

export async function toggleApiKeyStatusAction(id: string, isActive: boolean) {
  await checkAuth();
  
  await db.update(apiKeys)
    .set({ isActive })
    .where(eq(apiKeys.id, id));
    
  revalidatePath('/admin/api');
}

export async function deleteWebhookAction(id: string) {
  await checkAuth();
  
  await db.delete(webhooks).where(eq(webhooks.id, id));
    
  revalidatePath('/admin/api');
}

// ==========================================
// CANALES DE YOUTUBE (ADMIN)
// ==========================================

export async function addYoutubeChannelAction(formData: FormData) {
  await checkAuth();
  const name = formData.get('name') as string;
  const channelId = formData.get('channelId') as string;
  const keywords = formData.get('keywords') as string;

  if (!name || !channelId) return;

  await db.insert(youtubeChannels).values({
    name,
    channelId,
    keywords: keywords || null,
  });

  revalidatePath('/admin/youtube');
}

export async function toggleYoutubeChannelAction(id: string, currentStatus: boolean) {
  await checkAuth();
  await db.update(youtubeChannels).set({ isActive: !currentStatus }).where(eq(youtubeChannels.id, id));
  revalidatePath('/admin/youtube');
}

export async function deleteYoutubeChannelAction(id: string) {
  await checkAuth();
  
  // Borrar los videos asociados primero
  await db.delete(youtubeVideos).where(eq(youtubeVideos.channelId, id));
  // Luego borrar el canal
  await db.delete(youtubeChannels).where(eq(youtubeChannels.id, id));
  
  revalidatePath('/admin/youtube');
}

// ==========================================
// RESOLUCION DE DUPLICADOS (ADMIN)
// ==========================================

export async function resolveDuplicateAction(duplicateId: string, keepPersonId: string, discardPersonId: string) {
  await checkAuth();

  // 1. Mover todos los tips (aportes) del discard al keep
  await db.update(personTips)
    .set({ unifiedPersonId: keepPersonId })
    .where(eq(personTips.unifiedPersonId, discardPersonId));

  // 2. Marcar este duplicado como resuelto (o eliminarlo)
  await db.update(potentialDuplicates)
    .set({ status: 'aprobado' })
    .where(eq(potentialDuplicates.id, duplicateId));

  // 3. Eliminar cualquier otro potentialDuplicate que referencie al discard (para no dejar huérfanos)
  // Nota: Drizzle no soporta OR directamente en el delete de forma simple sin importar `or`, pero
  // podemos hacer dos deletes.
  await db.delete(potentialDuplicates)
    .where(eq(potentialDuplicates.unifiedPersonId, discardPersonId));
  await db.delete(potentialDuplicates)
    .where(eq(potentialDuplicates.duplicatePersonId, discardPersonId));

  // 4. Borrar a la persona descartada de unifiedPersons
  await db.delete(unifiedPersons)
    .where(eq(unifiedPersons.id, discardPersonId));

  revalidatePath('/admin/duplicados');
  revalidatePath('/admin/personas');
}

export async function rejectDuplicateAction(duplicateId: string) {
  await checkAuth();

  await db.update(potentialDuplicates)
    .set({ status: 'rechazado' })
    .where(eq(potentialDuplicates.id, duplicateId));

  revalidatePath('/admin/duplicados');
}
