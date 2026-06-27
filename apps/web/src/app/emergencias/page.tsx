import EmergencyDirectory from "@/components/EmergencyDirectory";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emergencias - Todos Unidos",
  description: "Directorio de números de emergencia y cuerpos de rescate en Venezuela.",
};

export default function EmergenciasPage() {
  return (
    <main className="flex-1 min-h-screen pt-4">
      <EmergencyDirectory />
    </main>
  );
}
