import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0f2861] text-white flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 border-b border-blue-800">
          <h2 className="text-xl font-black text-white">Admin Panel</h2>
          <p className="text-blue-300 text-sm">Todos Unidos</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin" className="px-4 py-3 rounded-xl hover:bg-blue-800 transition-colors font-medium">
            Dashboard Principal
          </Link>
          <Link href="/admin/personas" className="px-4 py-3 rounded-xl hover:bg-blue-800 transition-colors font-medium">
            Directorio Personas
          </Link>
          <Link href="/admin/acopio" className="px-4 py-3 rounded-xl hover:bg-blue-800 transition-colors font-medium">
            Centros de Acopio
          </Link>
          <Link href="/admin/api" className="px-4 py-3 rounded-xl hover:bg-blue-800 transition-colors font-medium">
            API & Webhooks
          </Link>
          <Link href="/" className="px-4 py-3 rounded-xl hover:bg-blue-800 transition-colors font-medium mt-auto text-blue-300">
            ← Volver a Web Pública
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
