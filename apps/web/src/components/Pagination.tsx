'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  // Helper to build URL keeping current search params
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-12 mb-8">
      {currentPage > 1 ? (
        <Link 
          href={createPageURL(currentPage - 1)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#0f2861] transition-colors shadow-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 font-medium cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </div>
      )}

      <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden hidden sm:flex">
        {/* Simple pagination: show first, current-1, current, current+1, last */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
          .map((page, index, array) => {
            // Add ellipsis if there's a gap
            const showEllipsis = index > 0 && page - array[index - 1] > 1;
            
            return (
              <div key={`page-wrapper-${page}`} className="flex items-center">
                {showEllipsis && (
                  <span className="px-3 py-2 text-slate-400 border-l border-slate-200 bg-slate-50">...</span>
                )}
                <Link
                  href={createPageURL(page)}
                  className={`px-4 py-2 font-medium border-l border-slate-200 first:border-l-0 transition-colors ${
                    currentPage === page 
                      ? 'bg-[#0f2861] text-white' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#0f2861]'
                  }`}
                >
                  {page}
                </Link>
              </div>
            );
          })}
      </div>

      {/* Mobile Current Page Indicator */}
      <div className="sm:hidden px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm font-medium text-slate-600">
        Pág {currentPage} de {totalPages}
      </div>

      {currentPage < totalPages ? (
        <Link 
          href={createPageURL(currentPage + 1)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#0f2861] transition-colors shadow-sm font-medium"
        >
          Siguiente
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 font-medium cursor-not-allowed">
          Siguiente
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
