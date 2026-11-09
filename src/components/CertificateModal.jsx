import React from 'react';
import { useAcademy } from '../context/AcademyContext';
import { Award, Printer, X, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CertificateModal({ student, onClose }) {
  const { settings } = useAcademy();

  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const certificateId = `CTPL-${student.id}-${new Date().getFullYear()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-card rounded-2xl max-w-2xl w-full p-4 sm:p-6 border shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between no-print pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-bold text-slate-800">Certificate of Completion</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Sheet (Printable) */}
        <div className="p-6 sm:p-8 rounded-xl bg-white border-4 border-double border-cyan-800/40 text-slate-900 shadow-sm text-center relative overflow-hidden">
          
          {/* Subtle Background Seal */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <img src="/assets/convosis-logo.jpg" alt="Watermark" className="w-96 h-96 object-contain" />
          </div>

          {/* Top Brand Header */}
          <div className="flex flex-col items-center justify-center space-y-1 relative z-10">
            <img 
              src="/assets/convosis-logo-full.png" 
              alt="CONVOSIS" 
              className="h-10 w-auto object-contain mix-blend-multiply" 
            />

            <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-1">
              Convosis Technologies Private Limited
            </div>
            <div className="text-[9px] text-slate-400">
              Department of Technical Training & Professional Excellence
            </div>
          </div>

          {/* Certificate Title */}
          <div className="my-5 relative z-10">
            <div className="text-xs font-serif tracking-widest uppercase text-cyan-800 font-bold">
              Certificate of Academic & Project Completion
            </div>
            <div className="text-[11px] text-slate-500 mt-1 italic font-serif">
              This is to formally certify that
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight font-sans border-b-2 border-slate-200 pb-1 max-w-sm mx-auto">
              {student.name}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Candidate Registration ID: {student.id}
            </div>
          </div>

          {/* Body Prose */}
          <div className="max-w-md mx-auto text-xs text-slate-600 leading-relaxed relative z-10 space-y-1">
            <p>
              has successfully fulfilled all rigorous curriculum requirements, laboratory practicals, and capstone milestone deliverables in:
            </p>
            <div className="text-sm font-bold text-cyan-900 py-1">
              {student.programTitle}
            </div>
            <p className="text-[11px] text-slate-500">
              Achieved with an overall academic attendance standing of <span className="font-bold text-slate-800">{student.attendanceStats.percentage}%</span> and 100% financial clearance.
            </p>
          </div>

          {/* Signatures & Seal */}
          <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-3 gap-2 items-end text-center relative z-10 text-[10px]">
            <div>
              <div className="font-serif italic text-xs text-slate-800">Alistair Vance</div>
              <div className="h-0.5 w-24 bg-slate-400 mx-auto my-1" />
              <div className="font-semibold text-slate-600">Director of Academics</div>
            </div>

            {/* Official Center Verification Seal */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-700 flex items-center justify-center bg-cyan-50 text-cyan-800 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-cyan-700" />
              </div>
              <span className="text-[8px] font-mono uppercase text-slate-500 mt-1 tracking-wider">
                Credential: {certificateId}
              </span>
            </div>

            <div>
              <div className="font-serif italic text-xs text-slate-800">Executive Council</div>
              <div className="h-0.5 w-24 bg-slate-400 mx-auto my-1" />
              <div className="font-semibold text-slate-600">Convosis Technologies Pvt. Ltd.</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

