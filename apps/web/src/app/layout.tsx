import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todos Unidos - Hub Central",
  description: "Buscador y unificador centralizado de personas desaparecidas en Venezuela",
};

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Toaster } from 'sonner';

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="bg-[#FAFAFA] text-slate-900 antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
