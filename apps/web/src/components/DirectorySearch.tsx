'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function DirectorySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state with the current URL query parameter if it exists
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const initialRender = useRef(true);

  useEffect(() => {
    // Skip the first render to avoid clearing existing queries immediately
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      const currentQ = searchParams.get('q') || '';
      const currentPage = searchParams.get('page') || '1';
      
      // Only push if the search query actually changed to avoid infinite loop
      if (query !== currentQ || (query !== currentQ && currentPage !== '1')) {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
          params.set('q', query);
        } else {
          params.delete('q');
        }
        
        // When searching, reset to page 1
        params.set('page', '1');
        
        router.push(`?${params.toString()}`, { scroll: false });
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]); // Removed searchParams and router from dependencies to prevent loop

  return (
    <div className="mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center focus-within:border-[#0f2861] focus-within:ring-2 focus-within:ring-[#0f2861]/20 transition-all">
      <svg className="w-6 h-6 text-slate-400 ml-4 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre, apellido o ubicación..." 
        className="w-full bg-transparent border-none outline-none text-slate-700 py-3 px-2 placeholder-slate-400"
      />
      {query && (
        <button 
          onClick={() => setQuery('')}
          className="mr-2 text-slate-400 hover:text-slate-600 transition-colors"
          title="Limpiar búsqueda"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
