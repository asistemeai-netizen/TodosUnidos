'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { submitPersonTipAction, getPersonTipsAction } from '../app/actions';

interface PersonCardProps {
  person: {
    id: string;
    firstName: string;
    lastName: string;
    age: number | null;
    status: string;
    lastSeenLocation: string | null;
    lastSeenDate: Date | null;
    photoUrl: string | null;
    documentId: string | null;
    gender: string | null;
    additionalDetails: string | null;
  }
}

export default function PersonCard({ person }: PersonCardProps) {
  // Iniciales si no hay foto
  const initials = `${person.firstName.charAt(0)}${person.lastName.charAt(0)}`.toUpperCase();
  
  // Color del status (Sin contacto = Rojo, Localizado = Verde)
  const isLocated = person.status.toLowerCase().includes('localizado');
  const statusColor = isLocated ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  const statusDot = isLocated ? 'bg-green-600' : 'bg-red-600';
  const statusLabel = isLocated ? 'Localizado' : 'Sin contacto';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportingInfo, setIsReportingInfo] = useState(false);
  const [infoText, setInfoText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; error?: string } | null>(null);

  const [showPastTips, setShowPastTips] = useState(false);
  const [pastTips, setPastTips] = useState<any[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmitTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoText.trim()) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    const formData = new FormData();
    formData.append('unifiedPersonId', person.id);
    formData.append('informationText', infoText);

    const result = await submitPersonTipAction(formData);
    setIsSubmitting(false);

    if (result.success) {
      setSubmitResult({ success: true });
      setInfoText('');
      setIsReportingInfo(false); // Close form on success
      
      // If past tips are currently visible, fetch them again to update the list
      if (showPastTips) {
        handleToggleTips(true);
      }
    } else {
      setSubmitResult({ success: false, error: result.error });
    }
  };

  const handleToggleTips = async (forceFetch = false) => {
    if (!showPastTips || forceFetch) {
      setIsLoadingTips(true);
      setShowPastTips(true);
      const result = await getPersonTipsAction(person.id);
      if (result.success && result.tips) {
        setPastTips(result.tips);
      }
      setIsLoadingTips(false);
    } else {
      setShowPastTips(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex items-center p-3 gap-4 group cursor-pointer hover:border-[#f1b218]/50"
      >
        {/* Área de la foto */}
        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100">
          {/* Status Dot Indicator */}
          <div 
            className={`absolute top-1.5 left-1.5 w-3 h-3 rounded-full ${statusDot} border-2 border-white z-10 shadow-sm`} 
            title={statusLabel}
          ></div>
          
          {person.photoUrl ? (
            <Image 
              src={person.photoUrl} 
              alt={`Foto de ${person.firstName}`} 
              fill 
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized={true}
            />
          ) : (
            <span className="text-2xl font-serif font-bold text-[#0f2861]/30 tracking-tighter">
              {initials}
            </span>
          )}
        </div>

        {/* Información compacta */}
        <div className="flex flex-col flex-1 min-w-0 py-1 justify-center">
          <h3 className="font-bold text-base text-slate-900 truncate w-full mb-0.5" title={`${person.firstName} ${person.lastName}`}>
            {person.firstName} {person.lastName}
          </h3>
          
          <p className="text-slate-500 text-xs truncate mb-2">
            {person.age ? `${person.age} años` : 'Edad no indicada'}
          </p>
          
          <div className="flex flex-col gap-1 text-slate-500 text-xs">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{person.lastSeenLocation || 'Ubicación no indicada'}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="truncate">
                {person.lastSeenDate 
                  ? person.lastSeenDate.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }) 
                  : 'Fecha no indicada'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div 
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera con Foto */}
            <div className="relative w-full h-64 bg-[#0f2861] shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {person.photoUrl ? (
                <Image 
                  src={person.photoUrl} 
                  alt={`Foto de ${person.firstName}`} 
                  fill 
                  className="object-cover"
                  unoptimized={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <svg className="w-20 h-20 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Contenido Desplazable */}
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-2xl font-black text-[#0f2861] leading-tight mb-1">
                    {person.firstName} {person.lastName}
                  </h3>
                  <p className="text-slate-500 font-medium">
                    {person.age ? `${person.age} años` : 'Edad no indicada'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${statusColor}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></div>
                  {statusLabel}
                </div>
              </div>

              <div className="space-y-4 mt-6">
                {(person.documentId || person.gender) && (
                  <div className="flex gap-3">
                    <div className="mt-1 bg-slate-100 p-2 rounded-lg text-slate-500 shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <div className="flex gap-6 w-full">
                      {person.documentId && (
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Cédula</p>
                          <p className="text-slate-700 font-medium">{person.documentId}</p>
                        </div>
                      )}
                      {person.gender && (
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Género</p>
                          <p className="text-slate-700 font-medium">{person.gender === 'M' ? 'Masculino' : person.gender === 'F' ? 'Femenino' : person.gender}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="mt-1 bg-slate-100 p-2 rounded-lg text-slate-500 shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Última ubicación conocida</p>
                    <p className="text-slate-700 font-medium">{person.lastSeenLocation || 'No indicada'}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 bg-slate-100 p-2 rounded-lg text-slate-500 shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fecha de último contacto</p>
                    <p className="text-slate-700 font-medium">
                      {person.lastSeenDate 
                        ? person.lastSeenDate.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) 
                        : 'No indicada'}
                    </p>
                  </div>
                </div>

                {person.additionalDetails && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                    <div className="mt-1 bg-amber-50 p-2 rounded-lg text-amber-600 shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Detalles Adicionales</p>
                      <p className="text-slate-700 font-medium whitespace-pre-wrap text-sm leading-relaxed">{person.additionalDetails}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
                {submitResult?.success && (
                  <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-sm font-medium mb-2">
                    ¡Gracias! Tu información ha sido registrada y anexada al expediente de la persona.
                  </div>
                )}
                {submitResult?.success === false && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-medium mb-2">
                    {submitResult.error || 'Ocurrió un error al enviar tu aporte.'}
                  </div>
                )}

                {!isReportingInfo ? (
                  <button 
                    onClick={() => setIsReportingInfo(true)}
                    className="w-full bg-[#f1b218] hover:bg-amber-500 text-[#0f2861] py-3 rounded-xl font-bold shadow-sm transition-colors flex justify-center items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Tengo información sobre esta persona
                  </button>
                ) : (
                  <form onSubmit={handleSubmitTip} className="flex flex-col gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
                    <div className="bg-amber-100 text-amber-800 p-3 rounded-xl text-xs font-medium border border-amber-200">
                      <strong>Nota de Seguridad:</strong> Lo que escribas en esta caja será visible para <strong>cualquier persona</strong> que abra el detalle de este desaparecido. Decide tú mismo si deseas incluir algún correo o teléfono de contacto en tu mensaje.
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold text-slate-700">Tu información o aporte</label>
                      <textarea 
                        required
                        disabled={isSubmitting}
                        value={infoText}
                        onChange={(e) => setInfoText(e.target.value)}
                        placeholder="Ej: Lo vi en el terminal de la ciudad el martes en la mañana... Mi nombre es Pedro (0414-XXXXXXX)"
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 h-28 resize-none focus:ring-2 focus:ring-[#0f2861] outline-none text-slate-700 text-sm"
                      />
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <button 
                        type="button" 
                        disabled={isSubmitting}
                        onClick={() => setIsReportingInfo(false)}
                        className="flex-1 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 py-3 rounded-xl font-bold transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-[#0f2861] hover:bg-blue-900 text-white py-3 rounded-xl font-bold transition-colors"
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar aporte'}
                      </button>
                    </div>
                  </form>
                )}
                
                {/* Visualizador de Aportes Previos */}
                <div className="mt-2">
                  <button 
                    onClick={() => handleToggleTips(false)}
                    className="w-full text-slate-500 hover:text-[#0f2861] text-sm font-semibold flex justify-center items-center gap-2 py-2 transition-colors"
                  >
                    {showPastTips ? 'Ocultar información de la comunidad' : 'Ver información aportada por la comunidad'}
                    <svg className={`w-4 h-4 transition-transform ${showPastTips ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showPastTips && (
                    <div className="mt-4 flex flex-col gap-3">
                      {isLoadingTips ? (
                        <div className="text-center py-4 text-slate-400 text-sm">Cargando aportes...</div>
                      ) : pastTips.length > 0 ? (
                        pastTips.map((tip) => (
                          <div key={tip.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                                Aporte Ciudadano
                              </span>
                              <span className="text-slate-400 text-xs">
                                {new Date(tip.createdAt).toLocaleDateString('es-VE')}
                              </span>
                            </div>
                            <p className="text-slate-700 text-sm whitespace-pre-wrap">{tip.informationText}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
                          Aún no hay aportes registrados para esta persona.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
