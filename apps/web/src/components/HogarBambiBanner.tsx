import Image from 'next/image';

export default function HogarBambiBanner() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <a 
        href="https://www.instagram.com/hogarbambi?igsh=YnptN3UyYWExMWJu" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group block relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-amber-50 opacity-50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/40 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-200/50 transition-colors"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 group-hover:bg-blue-200/50 transition-colors"></div>
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          
          {/* Logo container */}
          <div className="shrink-0 w-32 h-32 md:w-40 md:h-40 relative rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100 group-hover:scale-105 transition-transform duration-500">
            <Image 
              src="/hogarbambi.jpg" 
              alt="Hogar Bambi Venezuela" 
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] sm:text-xs uppercase tracking-wider mb-3 border border-amber-200">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              Aliado Especial
            </div>
            
            <h3 className="text-2xl md:text-3xl font-black text-[#0f2861] tracking-tight mb-2 group-hover:text-blue-700 transition-colors">
              Hogar Bambi Venezuela
            </h3>
            
            <p className="text-slate-600 font-medium text-sm md:text-base max-w-2xl leading-relaxed mb-4">
              Entidad privada y organización sin fines de lucro dedicada a brindar amor, cobijo y atención integral a bebés, niños y adolescentes en situación de riesgo.
            </p>

            <div className="inline-flex items-center gap-2 text-sm font-bold text-[#f1b218] group-hover:text-amber-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
              Visitar en Instagram <span aria-hidden="true" className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>
          
        </div>
      </a>
    </div>
  );
}
