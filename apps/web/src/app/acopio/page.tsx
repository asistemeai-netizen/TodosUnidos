import CollectionCentersList from "@/components/CollectionCentersList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Centros de Acopio - Todos Unidos",
  description: "Directorio de centros de acopio autorizados para enviar donativos en Venezuela.",
};

export default function AcopioPage() {
  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#0f2861] tracking-tight mb-4">
            Centros de Acopio
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Directorio de lugares autorizados recibiendo donativos para los afectados. Antes de dirigirte a uno, te recomendamos verificar sus necesidades actuales.
          </p>
        </div>
        <CollectionCentersList />
      </div>
    </div>
  );
}
