import React from 'react';

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pt-24 relative">
      <div 
        className="fixed inset-0 z-0 opacity-10 bg-center bg-no-repeat bg-cover pointer-events-none"
        style={{ backgroundImage: "url('/vzla-bg.png')" }}
      ></div>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-[#0f2861] tracking-tight">Portal para Desarrolladores</h1>
          <p className="text-slate-500 mt-2 text-lg">Documentación técnica de la API Pública y Webhooks de TodosUnidos.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-[#0f2861] mb-4">Autenticación</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <h3 className="text-amber-800 font-bold mb-1">¿Cómo solicitar tu API Key?</h3>
            <p className="text-amber-700 text-sm">
              Para obtener credenciales de acceso para tu plataforma, escríbenos un mensaje directo a nuestra cuenta oficial de Instagram 
              <a href="https://www.instagram.com/ayudavenezuela.todosunidos/" target="_blank" rel="noopener noreferrer" className="font-bold underline ml-1 hover:text-amber-900">
                @ayudavenezuela.todosunidos
              </a>.
            </p>
          </div>
          <p className="text-slate-600 mb-4">
            Para proteger la integridad de los datos, el acceso a la API requiere de esta llave de acceso. 
            Debes incluirla en todas las peticiones a través del header:
          </p>
          <pre className="bg-slate-800 text-slate-300 p-4 rounded-xl mb-8 overflow-x-auto">
            <code>x-api-key: TU_LLAVE_AQUI</code>
          </pre>

          <h2 className="text-2xl font-bold text-[#0f2861] mb-4">Endpoints REST</h2>
          
          <div className="space-y-6 mb-8">
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-sm">GET</span>
                <code className="text-slate-800 font-bold">/api/v1/personas</code>
              </div>
              <p className="text-slate-600 text-sm">Retorna el directorio unificado de personas reportadas. Puedes usar el parámetro `?limit=50` (máx 100).</p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-sm">GET</span>
                <code className="text-slate-800 font-bold">/api/v1/personas/:id</code>
              </div>
              <p className="text-slate-600 text-sm">Retorna el expediente completo de una persona específica por su UUID.</p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-sm">POST</span>
                <code className="text-slate-800 font-bold">/api/v1/personas</code>
              </div>
              <p className="text-slate-600 text-sm mb-2">Ingesta un nuevo reporte hacia nuestra base centralizada. Campos requeridos:</p>
              <pre className="bg-slate-50 text-slate-600 p-3 rounded-lg text-xs overflow-x-auto border border-slate-100">
{`{
  "firstName": "Juan",
  "lastName": "Pérez",
  "status": "desaparecido",
  "documentId": "V-12345678",
  "lastSeenLocation": "Chacao"
}`}
              </pre>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#0f2861] mb-4">Suscripción a Webhooks</h2>
          <p className="text-slate-600 mb-4">
            Puedes registrar una URL en nuestro sistema para recibir alertas automáticas (POST) cuando ocurran eventos importantes (ej. nuevo reporte, persona localizada).
          </p>
          <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-sm">POST</span>
                <code className="text-slate-800 font-bold">/api/v1/webhooks</code>
              </div>
              <pre className="bg-slate-50 text-slate-600 p-3 rounded-lg text-xs overflow-x-auto border border-slate-100 mb-2">
{`{
  "url": "https://tu-plataforma.com/api/webhook/receiver",
  "events": "person.created" 
}`}
              </pre>
              <p className="text-slate-600 text-sm">El payload que enviaremos contendrá un campo `event` y el objeto `data` con la información del reporte.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
