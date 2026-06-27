import CollectionCentersList from "@/components/CollectionCentersList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Centros de Acopio - Todos Unidos",
  description: "Directorio de centros de acopio autorizados para enviar donativos en Venezuela.",
};

export default function AcopioPage() {
  return (
    <main className="flex-1 min-h-screen">
      <CollectionCentersList />
    </main>
  );
}
