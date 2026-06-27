'use server';

import { db } from "@todosunidos/db";
import { personTips } from "@todosunidos/db/src/schema";
import { desc, eq } from "drizzle-orm";

export async function submitPersonTipAction(formData: FormData) {
  try {
    const unifiedPersonId = formData.get("unifiedPersonId")?.toString();
    const informationText = formData.get("informationText")?.toString();

    if (!unifiedPersonId || !informationText) {
      return { success: false, error: "Faltan datos obligatorios" };
    }

    await db.insert(personTips).values({
      unifiedPersonId,
      informationText,
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting tip:", error);
    return { success: false, error: "Ocurrió un error al guardar la información" };
  }
}

export async function getPersonTipsAction(unifiedPersonId: string) {
  try {
    const tips = await db.query.personTips.findMany({
      where: eq(personTips.unifiedPersonId, unifiedPersonId),
      orderBy: [desc(personTips.createdAt)],
    });
    return { success: true, tips };
  } catch (error) {
    console.error("Error fetching tips:", error);
    return { success: false, error: "No se pudieron cargar los aportes" };
  }
}
