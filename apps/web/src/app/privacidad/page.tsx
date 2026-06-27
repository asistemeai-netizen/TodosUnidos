import React from 'react';
import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen flex flex-col pt-24 relative">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 relative z-10">
        <div className="mb-8">
          <Link href="/" className="text-[#0f2861] hover:underline font-semibold flex items-center gap-2 mb-6 w-fit">
            &larr; Volver al inicio
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-[#0f2861] tracking-tight">Política de Privacidad y Tratamiento de Datos</h1>
          <p className="text-slate-500 mt-4 text-lg">Última actualización: 27 de junio de 2026</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 prose prose-slate max-w-none prose-headings:text-[#0f2861] prose-a:text-blue-600 hover:prose-a:text-blue-800">
          <p className="lead text-xl text-slate-700">
            Todos Unidos es una plataforma de respuesta humanitaria de emergencia. Nuestra misión es consolidar y facilitar la búsqueda de personas desaparecidas durante la contingencia. El manejo ético y seguro de la información es nuestro pilar fundamental.
          </p>

          <hr className="my-8 border-slate-100" />

          <h2>1. Datos Recopilados</h2>
          <p>
            Al utilizar nuestra plataforma o a través de nuestros aliados, recopilamos Información de Identificación Personal (PII) estrictamente necesaria para la localización de personas, la cual incluye pero no se limita a:
          </p>
          <ul>
            <li>Nombres y apellidos completos.</li>
            <li>Número de documento de identidad (Cédula).</li>
            <li>Fotografías para identificación visual.</li>
            <li>Última ubicación conocida, descripciones físicas y estado actual (desaparecido, localizado, etc.).</li>
          </ul>

          <h2>2. Finalidad del Tratamiento</h2>
          <p>
            Los datos recopilados tienen un fin <strong>único y exclusivo: la ayuda humanitaria y el rescate</strong>. 
            La información será utilizada para:
          </p>
          <ul>
            <li>Permitir que familiares y entes de rescate ubiquen a personas desaparecidas.</li>
            <li>Deduplicar reportes entre múltiples organizaciones civiles y ONGs.</li>
            <li>Generar cruces de información que faciliten la localización.</li>
          </ul>

          <h2>3. Uso de Inteligencia Artificial</h2>
          <p>
            Todos Unidos emplea sistemas avanzados de Inteligencia Artificial (Google Gemini) para la revisión de noticias, deduplicación de registros y análisis de contingencia. 
            <strong>Ningún dato personal ingresado a la plataforma es utilizado para entrenar los modelos base de estas inteligencias artificiales.</strong> Las interacciones se realizan mediante APIs seguras de nivel empresarial que garantizan la no retención de datos para entrenamiento.
          </p>

          <h2>4. Intercambio de Información y Aliados</h2>
          <p>
            Nuestra base de datos es compartida a través de nuestra API pública (vía Webhooks y Server-Sent Events / MCP) de forma exclusiva con organizaciones aliadas, desarrolladores cívicos e iniciativas de ayuda humanitaria previamente validadas. 
            <strong>En ningún caso, bajo ninguna circunstancia, vendemos, alquilamos ni comercializamos datos personales.</strong>
          </p>

          <h2>5. Retención y Eliminación de Datos</h2>
          <p>
            Reconocemos el derecho al olvido y la privacidad a largo plazo. Una vez confirmada la localización y finalizado el estado de emergencia, o bajo petición expresa de la persona reportada (o sus familiares directos), la información personal, incluyendo fotografías y expedientes, será eliminada permanentemente de nuestros servidores (MinIO/PostgreSQL).
          </p>

          <h2>6. Derechos de los Usuarios</h2>
          <p>
            Si tú o tu familiar aparece en esta plataforma y deseas actualizar el estado a "Localizado", rectificar información errónea o solicitar la eliminación total del reporte, puedes contactarnos de manera inmediata:
          </p>
          <ul>
            <li><strong>Correo de Respuesta Rápida:</strong> <a href="mailto:ayudavenezuela@todosunidos.com">ayudavenezuela@todosunidos.com</a></li>
            <li><strong>Instagram Oficial:</strong> <a href="https://www.instagram.com/ayudavenezuela.todosunidos/" target="_blank" rel="noopener noreferrer">@ayudavenezuela.todosunidos</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
