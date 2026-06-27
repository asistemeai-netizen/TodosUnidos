import { getRejectedTipsAction, approveTipAction } from "@/app/actions";
import { revalidatePath } from "next/cache";

export const revalidate = 0; // Para que el admin siempre sea dinámico

export default async function ModerationAdminPage() {
  const { tips } = await getRejectedTipsAction();

  async function handleApprove(formData: FormData) {
    "use server";
    const tipId = formData.get("tipId")?.toString();
    if (tipId) {
      await approveTipAction(tipId);
      revalidatePath("/admin/moderacion");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-black text-[#0f2861] mb-2">Panel de Moderación (Aportes Bloqueados)</h1>
        <p className="text-slate-500 mb-8">Aquí puedes revisar los comentarios que la IA bloqueó automáticamente y decidir si los apruebas manualmente.</p>

        <div className="flex flex-col gap-4">
          {!tips || tips.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
              No hay comentarios bloqueados actualmente. Todo limpio.
            </div>
          ) : (
            tips.map((tip) => (
              <div key={tip.id} className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">Bloqueado por IA</span>
                    <span className="text-slate-400 text-sm">{new Date(tip.createdAt).toLocaleString('es-VE')}</span>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                    <p className="text-slate-700 whitespace-pre-wrap">{tip.informationText}</p>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-2">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Razón de la IA:</p>
                    <p className="text-amber-700 text-sm">{tip.aiModerationReason || "No especificada"}</p>
                  </div>

                  {tip.person && (
                    <p className="text-sm text-slate-500">
                      <strong>Reporte original en persona:</strong> {tip.person.firstName} {tip.person.lastName}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                  <form action={handleApprove}>
                    <input type="hidden" name="tipId" value={tip.id} />
                    <button type="submit" className="w-full md:w-auto px-6 py-2 bg-[#0f2861] hover:bg-blue-900 text-white font-bold rounded-xl transition-colors">
                      Aprobar (Forzar)
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
