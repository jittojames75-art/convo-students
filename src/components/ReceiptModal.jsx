import React from 'react';
import { useAcademy } from '../context/AcademyContext';
import { Printer, Download, CheckCircle2, X, ShieldCheck } from 'lucide-react';

export default function ReceiptModal() {
  const { isReceiptModalOpen, setIsReceiptModalOpen, activeReceiptData, settings } = useAcademy();

  if (!isReceiptModalOpen || !activeReceiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  const amountPaid = Number(activeReceiptData.amountPaid) || 0;
  // Prorated 18% GST reverse calculation
  const baseAmount = Math.round(amountPaid / 1.18);
  const totalGst = amountPaid - baseAmount;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="glass-card rounded-2xl max-w-xl w-full p-5 sm:p-7 border shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto bg-white">
        
        {/* Top Actions: Print & Close */}
        <div className="flex items-center justify-between no-print pb-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Verified Tax Invoice & Receipt
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Invoice Container */}
        <div id="printable-receipt" className="p-6 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-5">
          
          {/* Header of Receipt */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex flex-col">
                <img 
                  src="/assets/convosis-logo-full.png" 
                  alt="CONVOSIS" 
                  className="h-8 w-auto object-contain mix-blend-multiply" 
                />
                <span className="text-[11px] font-bold text-slate-800 leading-tight mt-0.5">
                  Convosis Technologies Private Limited
                </span>
              </div>
              <div className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                {settings.address || 'Innovation Hub, Cyber City, Bangalore, Karnataka - 560100'}
              </div>
              <div className="text-[10px] font-mono text-cyan-800 font-semibold space-x-2">
                <span>GSTIN: {settings.taxId || 'GSTIN29AAACC1234D1Z5'}</span>
                <span>•</span>
                <span>CIN: {settings.cinNumber || 'U72900KA2026PTC184920'}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase block">
                Official GST Tax Receipt
              </span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                #{activeReceiptData.receiptNumber}
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                Date: {activeReceiptData.paymentDate}
              </div>
            </div>
          </div>

          {/* Student Billing Target */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Billed To Candidate</span>
              <div className="font-bold text-slate-900">{activeReceiptData.studentName}</div>
              <div className="text-slate-500 font-mono text-[10px]">{activeReceiptData.studentId}</div>
              <div className="text-slate-500 text-[11px] truncate">{activeReceiptData.studentEmail}</div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Registered Program</span>
              <div className="font-bold text-cyan-800">{activeReceiptData.programTitle}</div>
              <div className="text-slate-500 text-[11px] mt-1">
                Settlement: <span className="font-semibold text-slate-700">{activeReceiptData.paymentMethod || 'Online Transfer'}</span>
              </div>
            </div>
          </div>

          {/* Itemized Table with GST 18% Breakdown */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Item / Service Description</th>
                  <th className="py-2.5 px-3 text-center">Tax Rate</th>
                  <th className="py-2.5 px-3 text-right">Taxable Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                <tr>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{activeReceiptData.installmentTitle || 'Tuition Milestone Fee'}</div>
                    <div className="text-[10px] text-slate-500">SAC: 999293 (Commercial Training & Education)</div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                    18% GST
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                    ₹{baseAmount.toLocaleString()}
                  </td>
                </tr>

                {/* GST Split */}
                <tr className="bg-slate-50/50 text-[11px] text-slate-600">
                  <td className="py-1.5 px-3 pl-6">
                    • Central GST (CGST 9%)
                  </td>
                  <td className="py-1.5 px-3 text-center font-mono">9%</td>
                  <td className="py-1.5 px-3 text-right font-mono">₹{cgst.toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-50/50 text-[11px] text-slate-600">
                  <td className="py-1.5 px-3 pl-6">
                    • State GST (SGST 9%)
                  </td>
                  <td className="py-1.5 px-3 text-center font-mono">9%</td>
                  <td className="py-1.5 px-3 text-right font-mono">₹{sgst.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Balance */}
          <div className="flex items-end justify-between pt-2">
            {/* Digital Stamp */}
            <div className="flex items-center gap-2 p-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px]">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold uppercase tracking-wider">Authorized Digital Receipt</div>
                <div className="text-emerald-700/80">Convosis Technologies Private Limited</div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs text-slate-600">
                Total Settled: <span className="text-base font-extrabold text-emerald-600 ml-1">₹{amountPaid.toLocaleString()}</span>
              </div>
              <div className="text-xs text-slate-500">
                Remaining Balance: <span className="font-bold text-slate-800 ml-1">₹{Number(activeReceiptData.remainingBalance || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-[9px] text-slate-400 text-center border-t border-slate-100 pt-3">
            This is an electronically generated GST tax receipt and requires no physical seal. Official receipt of Convosis Technologies Private Limited.
          </div>

        </div>

      </div>
    </div>
  );
}
