import EmergencyDirectory from "@/components/EmergencyDirectory";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emergencias - Todos Unidos",
  description: "Directorio de números de emergencia y cuerpos de rescate en Venezuela.",
};

export default function EmergenciasPage() {
  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#0f2861] tracking-tight mb-4">
            Directorio de Emergencias
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Números de contacto directos con cuerpos de bomberos, protección civil y hospitales a nivel nacional.
          </p>
        </div>
        <EmergencyDirectory />
      </div>
    </div>
  );
}
