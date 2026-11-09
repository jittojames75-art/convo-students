import React from 'react';
import { useAcademy } from '../context/AcademyContext';

export default function AcademyLogo({ size = 'default', showTagline = true, className = '' }) {
  const { settings, organization } = useAcademy();

  const logoHeight = size === 'large' 
    ? 'h-9 sm:h-10' 
    : size === 'small' 
      ? 'h-6 sm:h-7' 
      : 'h-7 sm:h-8';

  return (
    <div className={`flex items-center gap-2 select-none shrink-0 ${className}`}>
      {/* Official Convosis Logo Image lockup */}
      <div className="flex flex-col">
        <img 
          src="/assets/convosis-logo-full.png" 
          alt="CONVOSIS" 
          className={`${logoHeight} w-auto object-contain mix-blend-multiply`}
          loading="eager"
        />

        {showTagline && (
          <span className="text-[9.5px] font-semibold text-slate-500 tracking-tight leading-none mt-0.5 pl-0.5">
            {organization?.name || settings?.name || 'Convosis Technologies Private Limited'}
          </span>
        )}
      </div>
    </div>
  );
}
