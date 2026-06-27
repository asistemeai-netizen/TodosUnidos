'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { reportPersonAction } from '../actions/reportPerson';

export default function ReportPersonButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPhotoPreview(null);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });
        
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          formData.append('photoUrl', url);
        } else {
          console.error('Failed to upload image');
        }
      }

      const result = await reportPersonAction(formData);
      setIsSubmitting(false);
    
      if (result.success) {
        toast.success('Reporte enviado con éxito. La persona aparecerá en el tablero pronto.');
        setIsOpen(false);
        setPhotoPreview(null);
        setSelectedFile(null);
      } else {
        toast.error(result?.error || 'Hubo un error');
      }
    } catch (err) {
      console.error(err);
      toast.error('Ocurrió un error inesperado al enviar el reporte.');
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="group bg-white border-2 border-slate-200 text-slate-700 hover:border-[#f1b218] hover:text-[#f1b218] px-8 py-4 rounded-2xl font-bold shadow-sm transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
      >
        <svg className="w-6 h-6 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Reportar a alguien
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-black text-[#0f2861]">Reportar Persona</h2>
                <p className="text-slate-500 text-sm">Toda la información ayuda a los equipos de rescate.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-slate-700 text-sm">Nombres *</label>
                  <input required name="firstName" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f1b218] focus:ring-2 focus:ring-[#f1b218]/20 outline-none transition-all" placeholder="Ej. Juan Carlos" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-slate-700 text-sm">Apellidos *</label>
                  <input required name="lastName" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f1b218] focus:ring-2 focus:ring-[#f1b218]/20 outline-none transition-all" placeholder="Ej. Pérez" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-slate-700 text-sm">Cédula</label>
                  <input name="documentId" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f1b218] focus:ring-2 focus:ring-[#f1b218]/20 outline-none transition-all" placeholder="V-12345678" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-slate-700 text-sm">Edad</label>
                  <input type="number" name="age" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f1b218] focus:ring-2 focus:ring-[#f1b218]/20 outline-none transition-all" placeholder="Ej. 34" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-slate-700 text-sm">Género</label>
                  <select name="gender" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f1b218] focus:ring-2 focus:ring-[#f1b218]/20 outline-none transition-all bg-white">
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-700 text-sm">Última Ubicación Conocida *</label>
                <input required name="lastSeenLocation" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f1b218] focus:ring-2 focus:ring-[#f1b218]/20 outline-none transition-all" placeholder="Ej. Edificio Los Andes, Chacao" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-700 text-sm">Tu número de contacto *</label>
                <input required name="reporterContact" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f1b218] focus:ring-2 focus:ring-[#f1b218]/20 outline-none transition-all" placeholder="Para contactarte si hay información" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-700 text-sm">Fotografía (Opcional pero muy recomendada)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-[#0f2861] transition-colors relative overflow-hidden group">
                  {photoPreview ? (
                    <div className="relative w-full h-48">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoPreview} alt="Vista previa" className="w-full h-full object-contain" />
                      <button 
                        type="button" 
                        onClick={() => { setSelectedFile(null); setPhotoPreview(null); }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-400 group-hover:text-[#0f2861] transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-[#0f2861] hover:text-blue-800 focus-within:outline-none">
                          <span>Subir un archivo</span>
                          <input id="file-upload" name="photo" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">PNG, JPG, GIF hasta 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-700 text-sm">Detalles adicionales</label>
                <textarea name="additionalDetails" rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#f1b218] focus:ring-2 focus:ring-[#f1b218]/20 outline-none transition-all resize-none" placeholder="Ropa que vestía, señas particulares, condiciones médicas..."></textarea>
              </div>

              <div className="flex justify-end gap-4 pt-4 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-[#0f2861] hover:bg-blue-900 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? 'Enviando...' : 'Enviar Reporte Oficial'}
                </button>
              </div>
            </form>

          </div>
        </div>
      , document.body)}
    </>
  );
}
