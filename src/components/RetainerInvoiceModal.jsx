import React, { useState, useEffect, useRef } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { 
  Printer, 
  X, 
  FileText, 
  Edit3, 
  Check, 
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  SlidersHorizontal,
  Upload,
  Trash2,
  Stamp
} from 'lucide-react';
import { numberToIndianWords } from '../utils/numberToWords';
import { processSignatureFile } from '../utils/signatureLoader';

export default function RetainerInvoiceModal() {
  const { 
    isInvoiceModalOpen, 
    setIsInvoiceModalOpen, 
    activeInvoiceData, 
    organization,
    settings,
    companySignature,
    updateCompanySignature,
    removeCompanySignature,
    openFeeAdjustment,
    addToast
  } = useAcademy();

  const fileInputRef = useRef(null);
  const [isProcessingSig, setIsProcessingSig] = useState(false);
  const [signatoryRole, setSignatoryRole] = useState('Authorised Signatory');
  const [useBlankSignature, setUseBlankSignature] = useState(false);

  const [docType, setDocType] = useState('retainer'); // 'retainer' or 'tax'
  const [templateMode, setTemplateMode] = useState('filled'); // 'filled' or 'blank'
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields state matching Convosis official format
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: 'CONV/26-27/003',
    invoiceDate: '02 November 2026',
    internName: 'Adithya Krishna PK',
    address: 'Vilayil Veedu, Ellukala , Puthuppally P.O, Kottayam',
    phone: '+91 9383445417',
    email: '',
    programTitle: 'Ethical hacking and Cybersecurity',
    description: 'Internship Programme / Retainer Fee',
    baseFee: 30000,
    gstPercent: 18,
    gstAmount: 5400,
    totalInvoiceValue: 35400,
    amountReceived: 5000,
    balanceDue: 30400,
    paymentMethod: 'UPI(ID:628943139310)',
    upiId: '628943139310',
    signDate: '02/11/2026',
    paymentTerms: 'The outstanding balance is payable as per the agreed internship programme terms. Please include the invoice number and intern name in the payment reference.'
  });

  // Sync incoming context data when opened
  useEffect(() => {
    if (activeInvoiceData) {
      const isRetainer = activeInvoiceData.invoiceType === 'retainer' || activeInvoiceData.programType === 'internship';
      setDocType(activeInvoiceData.invoiceType || (isRetainer ? 'retainer' : 'tax'));

      const totalVal = Number(activeInvoiceData.totalFee) || 35400;
      const base = Number(activeInvoiceData.baseFee) || Math.round(totalVal / 1.18);
      const gst = Number(activeInvoiceData.gstAmount) || (totalVal - base);
      const received = Number(activeInvoiceData.paidAmount) || 0;
      const balance = Number(activeInvoiceData.balanceDue) ?? Math.max(0, totalVal - received);

      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      const signFormatted = today.toLocaleDateString('en-GB');

      setInvoiceForm({
        invoiceNumber: activeInvoiceData.invoiceNumber || 'CONV/26-27/003',
        invoiceDate: activeInvoiceData.date || formattedDate,
        internName: activeInvoiceData.studentName || 'Adithya Krishna PK',
        address: activeInvoiceData.address || 'Vilayil Veedu, Ellukala , Puthuppally P.O, Kottayam',
        phone: activeInvoiceData.phone || '+91 9383445417',
        email: activeInvoiceData.email || '',
        programTitle: activeInvoiceData.programTitle || 'Ethical hacking and Cybersecurity',
        description: activeInvoiceData.description || (isRetainer ? 'Internship Programme / Retainer Fee' : 'Course Tuition / Retainer Fee'),
        baseFee: base,
        gstPercent: activeInvoiceData.gstPercent || 18,
        gstAmount: gst,
        totalInvoiceValue: totalVal,
        amountReceived: received,
        balanceDue: balance,
        paymentMethod: activeInvoiceData.paymentMethod || 'UPI(ID:628943139310)',
        upiId: activeInvoiceData.upiId || '628943139310',
        signDate: activeInvoiceData.rawDate || signFormatted,
        paymentTerms: isRetainer 
          ? 'The outstanding balance is payable as per the agreed internship programme terms. Please include the invoice number and intern name in the payment reference.'
          : 'The outstanding balance is payable as per the agreed academic programme terms. Please include the invoice number and candidate name in the payment reference.'
      });
    }
  }, [activeInvoiceData]);

  if (!isInvoiceModalOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Recalculate amounts dynamically when baseFee or amountReceived is edited
  const handleBaseFeeChange = (val) => {
    const b = Number(val) || 0;
    const g = Math.round(b * (invoiceForm.gstPercent / 100));
    const total = b + g;
    const rec = Number(invoiceForm.amountReceived) || 0;
    const bal = Math.max(0, total - rec);
    setInvoiceForm(prev => ({
      ...prev,
      baseFee: b,
      gstAmount: g,
      totalInvoiceValue: total,
      balanceDue: bal
    }));
  };

  const handleAmountReceivedChange = (val) => {
    const rec = Number(val) || 0;
    const bal = Math.max(0, invoiceForm.totalInvoiceValue - rec);
    setInvoiceForm(prev => ({
      ...prev,
      amountReceived: rec,
      balanceDue: bal
    }));
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingSig(true);
      const dataUrl = await processSignatureFile(file);
      updateCompanySignature(dataUrl);
      setUseBlankSignature(false);
      addToast(`Company authorised signature uploaded and applied to invoices!`, 'success');
    } catch (err) {
      addToast(`Error processing signature file: ${err.message}`, 'error');
    } finally {
      setIsProcessingSig(false);
      if (e.target) e.target.value = '';
    }
  };

  const isBlank = templateMode === 'blank';

  const docTitle = docType === 'retainer' ? 'RETAINER INVOICE' : 'TAX INVOICE';
  const docNumberLabel = docType === 'retainer' ? 'Retainer Invoice No.' : 'Tax Invoice No.';
  const pageFooterLabel = docType === 'retainer' ? 'Retainer Invoice' : 'Tax Invoice';
  const roleLabel = docType === 'retainer' ? 'Internship Role / Programme' : 'Academic Course / Programme';
  const nameLabel = docType === 'retainer' ? 'Intern Name' : 'Candidate Name';
  const feeLabel = docType === 'retainer' ? 'Internship Programme / Retainer Fee' : 'Course Tuition / Training Fee';

  const amountInWords = numberToIndianWords(invoiceForm.balanceDue || invoiceForm.totalInvoiceValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="glass-card rounded-2xl max-w-4xl w-full p-4 sm:p-6 border shadow-2xl space-y-4 max-h-[96vh] overflow-y-auto bg-slate-100/95 text-slate-900">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between gap-3 no-print pb-3 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0a2540] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#14539a]" />
              <span>Official Convosis Invoice</span>
            </span>

            {/* Document Type Switcher: Retainer vs Tax Invoice */}
            <div className="flex items-center p-0.5 bg-slate-200/90 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDocType('retainer')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  docType === 'retainer' 
                    ? 'bg-[#14539a] text-white shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Retainer Invoice
              </button>
              <button
                type="button"
                onClick={() => setDocType('tax')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  docType === 'tax' 
                    ? 'bg-[#14539a] text-white shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tax Invoice
              </button>
            </div>

            {/* Template Mode: Filled vs Blank Template */}
            <div className="flex items-center p-0.5 bg-slate-200/90 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTemplateMode('filled')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  templateMode === 'filled' 
                    ? 'bg-white text-slate-900 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Filled Receipt
              </button>
              <button
                type="button"
                onClick={() => setTemplateMode('blank')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  templateMode === 'blank' 
                    ? 'bg-white text-slate-900 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View clean blank printable template format with fill-in lines"
              >
                Blank Form Template
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Hidden file input for company signature PDF or Image */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleSignatureUpload}
              accept=".pdf,image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
              className="hidden"
            />

            {!isBlank && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingSig}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-xs cursor-pointer transition-all"
                title="Upload company authorised signature from PDF or Image"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-600" />
                <span>{isProcessingSig ? 'Reading PDF...' : companySignature ? 'Change Signature' : 'Upload Signature PDF'}</span>
              </button>
            )}

            {!isBlank && activeInvoiceData?.studentObj && (
              <button
                type="button"
                onClick={() => {
                  const stu = activeInvoiceData.studentObj;
                  setIsInvoiceModalOpen(false);
                  openFeeAdjustment(stu);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer transition-all"
                title="Adjust tuition fee, apply concession, or set target due amount"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Adjust Fee / Due</span>
              </button>
            )}

            {!isBlank && (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isEditing 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Edit invoice fields inline before printing"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Done Editing' : 'Edit Inline'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#14539a] hover:bg-[#0f4077] text-white shadow-xs cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (Pixel-perfect match to provided PDF receipts) */}
        <div 
          id="printable-retainer-invoice" 
          className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 max-w-[800px] mx-auto space-y-6 print:m-0 print:p-6 print:shadow-none print:border-none print:w-full print:max-w-none"
          style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
        >
          
          {/* Header: Logo, Company Info & Invoice Header */}
          <div className="flex items-start justify-between gap-6 pb-1">
            
            {/* Left: Official Convosis Logo & Company Credentials */}
            <div className="space-y-1 max-w-sm">
              <div className="flex items-center gap-2">
                <img 
                  src="/assets/convosis-logo-full.png" 
                  alt="CONVOSIS" 
                  className="h-10 w-auto object-contain mix-blend-multiply"
                />
              </div>

              <div className="pt-2 text-xs leading-tight">
                <h2 className="font-extrabold text-[12px] tracking-tight text-slate-900 uppercase">
                  CONVOSIS TECHNOLOGIES PRIVATE LIMITED
                </h2>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  Technolodge Phase II, Anugraha Medical Complex Building,<br />
                  Union Club Road, Kottayam, Kerala – 686003
                </p>
                <p className="text-[11px] font-bold text-slate-800 mt-1">
                  GSTIN: <span className="font-mono font-normal">32AANCC9298C1ZE</span>
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Email: info@convosis.com | Phone: +91 8943440266
                </p>
              </div>
            </div>

            {/* Right: Retainer / Tax Invoice Title, Number & Date */}
            <div className="text-right space-y-1 shrink-0">
              <h1 className="text-xl sm:text-2xl font-black text-[#14539a] tracking-tight">
                {docTitle}
              </h1>

              <div className="pt-2 text-xs text-slate-800 space-y-1">
                <div>
                  <span className="font-medium text-slate-800">{docNumberLabel}: </span>
                  {isBlank ? (
                    <span className="inline-block border-b border-slate-700 w-36 text-center font-mono">&nbsp;</span>
                  ) : isEditing ? (
                    <input 
                      type="text" 
                      value={invoiceForm.invoiceNumber}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                      className="px-1 py-0.5 border border-cyan-400 rounded text-xs font-mono"
                    />
                  ) : (
                    <span className="font-semibold text-slate-900">{invoiceForm.invoiceNumber}</span>
                  )}
                </div>

                <div>
                  <span className="font-medium text-slate-800">Invoice Date: </span>
                  {isBlank ? (
                    <span className="inline-block border-b border-slate-700 w-36 text-center font-mono">&nbsp;</span>
                  ) : isEditing ? (
                    <input 
                      type="text" 
                      value={invoiceForm.invoiceDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                      className="px-1 py-0.5 border border-cyan-400 rounded text-xs"
                    />
                  ) : (
                    <span className="text-slate-800">{invoiceForm.invoiceDate}</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* BILL TO Card with Alternating Soft-Blue Bands (as seen in PDF) */}
          <div className="pt-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              BILL TO
            </h3>
            
            <div className="border border-slate-200/90 rounded-lg overflow-hidden text-xs">
              
              {/* Row 1: Intern Name (Soft blue background) */}
              <div className="p-2.5 bg-[#edf4fb] flex items-center justify-between">
                <span className="font-bold text-slate-900 w-48 shrink-0">{nameLabel}:</span>
                <span className="flex-1 font-semibold text-slate-900">
                  {isBlank ? (
                    <span className="inline-block border-b border-slate-400 w-full">&nbsp;</span>
                  ) : isEditing ? (
                    <input 
                      type="text" 
                      value={invoiceForm.internName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, internName: e.target.value })}
                      className="w-full px-1.5 py-0.5 border border-cyan-400 rounded bg-white font-bold"
                    />
                  ) : (
                    invoiceForm.internName
                  )}
                </span>
              </div>

              {/* Row 2: Address (White background) */}
              <div className="p-2.5 bg-white flex items-center justify-between">
                <span className="font-bold text-slate-900 w-48 shrink-0">Address:</span>
                <span className="flex-1 text-slate-800">
                  {isBlank ? (
                    <span className="inline-block border-b border-slate-400 w-full">&nbsp;</span>
                  ) : isEditing ? (
                    <textarea 
                      rows={1}
                      value={invoiceForm.address}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, address: e.target.value })}
                      className="w-full px-1.5 py-0.5 border border-cyan-400 rounded bg-white text-xs"
                    />
                  ) : (
                    invoiceForm.address
                  )}
                </span>
              </div>

              {/* Row 3: Phone / Email (Soft blue background) */}
              <div className="p-2.5 bg-[#edf4fb] flex items-center justify-between">
                <span className="font-bold text-slate-900 w-48 shrink-0">Phone / Email:</span>
                <span className="flex-1 text-slate-800">
                  {isBlank ? (
                    <span className="inline-block border-b border-slate-400 w-full">&nbsp;</span>
                  ) : isEditing ? (
                    <input 
                      type="text" 
                      value={invoiceForm.phone}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, phone: e.target.value })}
                      className="w-full px-1.5 py-0.5 border border-cyan-400 rounded bg-white text-xs"
                    />
                  ) : (
                    invoiceForm.phone + (invoiceForm.email ? ` | ${invoiceForm.email}` : '')
                  )}
                </span>
              </div>

              {/* Row 4: Role / Programme (White background) */}
              <div className="p-2.5 bg-white flex items-center justify-between">
                <span className="font-bold text-slate-900 w-48 shrink-0">{roleLabel}:</span>
                <span className="flex-1 font-semibold text-slate-900">
                  {isBlank ? (
                    <span className="inline-block border-b border-slate-400 w-full">&nbsp;</span>
                  ) : isEditing ? (
                    <input 
                      type="text" 
                      value={invoiceForm.programTitle}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, programTitle: e.target.value })}
                      className="w-full px-1.5 py-0.5 border border-cyan-400 rounded bg-white text-xs font-bold"
                    />
                  ) : (
                    invoiceForm.programTitle
                  )}
                </span>
              </div>

            </div>
          </div>

          {/* INVOICE DETAILS Table: Dark Navy Header (#0a2540) */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              INVOICE DETAILS
            </h3>

            <div className="border border-slate-300 rounded-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#0a2540] text-white">
                    <th className="py-2.5 px-3 text-left font-bold text-xs">Description</th>
                    <th className="py-2.5 px-3 text-right font-bold text-xs w-52">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  
                  {/* Row 1: Programme / Retainer Fee (Light blue background #eef4fa) */}
                  <tr className="bg-[#eef4fa]">
                    <td className="py-2.5 px-3 text-slate-900 font-medium">
                      {isBlank ? (
                        <span>{feeLabel}</span>
                      ) : isEditing ? (
                        <input 
                          type="text"
                          value={invoiceForm.description}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                          className="w-full px-1.5 py-0.5 border border-cyan-400 rounded text-xs"
                        />
                      ) : (
                        invoiceForm.description
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900 font-mono">
                      {isBlank ? (
                        <span className="inline-block border-b border-slate-400 w-32">&nbsp;</span>
                      ) : isEditing ? (
                        <input 
                          type="number"
                          value={invoiceForm.baseFee}
                          onChange={(e) => handleBaseFeeChange(e.target.value)}
                          className="w-28 px-1 py-0.5 border border-cyan-400 rounded text-right text-xs"
                        />
                      ) : (
                        <>
                          <span className="inline-block w-2.5 h-2.5 bg-slate-900 mr-2 align-middle" />
                          {invoiceForm.baseFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Row 2: GST Rate (White background) */}
                  <tr className="bg-white">
                    <td className="py-2.5 px-3 text-slate-900">
                      {isBlank ? `GST @ ____ %` : `GST @ ${invoiceForm.gstPercent}%`}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900 font-mono">
                      {isBlank ? (
                        <span className="inline-block border-b border-slate-400 w-32">&nbsp;</span>
                      ) : (
                        <>
                          <span className="inline-block w-2.5 h-2.5 bg-slate-900 mr-2 align-middle" />
                          {invoiceForm.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Row 3: Total Invoice Value (Slightly darker soft blue #e0ecf8) */}
                  <tr className="bg-[#e0ecf8] font-bold">
                    <td className="py-2.5 px-3 text-slate-900">
                      Total Invoice Value
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                      {isBlank ? (
                        <span className="inline-block border-b border-slate-400 w-32">&nbsp;</span>
                      ) : (
                        <>
                          <span className="inline-block w-2.5 h-2.5 bg-slate-900 mr-2 align-middle" />
                          {invoiceForm.totalInvoiceValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PAYMENT RECONCILIATION Table: Royal Blue Header (#1d63b8) */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              PAYMENT RECONCILIATION
            </h3>

            <div className="border border-slate-300 rounded-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#1d63b8] text-white">
                    <th className="py-2.5 px-3 text-left font-bold text-xs">Particulars</th>
                    <th className="py-2.5 px-3 text-right font-bold text-xs w-52">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  
                  {/* Row 1: Total Invoice Value */}
                  <tr>
                    <td className="py-2.5 px-3 text-slate-900">
                      Total Invoice Value
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900 font-mono">
                      {isBlank ? (
                        <span className="inline-block border-b border-slate-400 w-32">&nbsp;</span>
                      ) : (
                        <>
                          <span className="inline-block w-2.5 h-2.5 bg-slate-900 mr-2 align-middle" />
                          {invoiceForm.totalInvoiceValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Row 2: Amount Received to Date */}
                  <tr>
                    <td className="py-2.5 px-3 text-slate-900">
                      Amount Received to Date
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900 font-mono">
                      {isBlank ? (
                        <span className="inline-block border-b border-slate-400 w-32">&nbsp;</span>
                      ) : isEditing ? (
                        <input 
                          type="number"
                          value={invoiceForm.amountReceived}
                          onChange={(e) => handleAmountReceivedChange(e.target.value)}
                          className="w-28 px-1 py-0.5 border border-cyan-400 rounded text-right text-xs"
                        />
                      ) : (
                        <>
                          <span className="inline-block w-2.5 h-2.5 bg-slate-900 mr-2 align-middle" />
                          {`${invoiceForm.amountReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })} /-`}
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Row 3: Balance Amount Due */}
                  <tr className="font-bold">
                    <td className="py-2.5 px-3 text-slate-900">
                      Balance Amount Due
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                      {isBlank ? (
                        <span className="inline-block border-b border-slate-400 w-32">&nbsp;</span>
                      ) : (
                        <>
                          <span className="inline-block w-2.5 h-2.5 bg-slate-900 mr-2 align-middle" />
                          {`${invoiceForm.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-`}
                        </>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes, Terms & Words */}
          <div className="space-y-2 text-[11px] leading-relaxed text-slate-800 pt-1">
            <p className="flex items-baseline gap-1">
              <span className="font-bold text-slate-900 shrink-0">Amount in words:</span>{' '}
              {isBlank ? (
                <span className="inline-block border-b border-slate-400 flex-1">&nbsp;</span>
              ) : (
                <span className="font-semibold text-slate-900">{amountInWords}</span>
              )}
            </p>

            <p className="flex items-baseline gap-1">
              <span className="font-bold text-slate-900 shrink-0">Payment Terms:</span>{' '}
              {isBlank ? (
                <span className="inline-block border-b border-slate-400 flex-1">&nbsp;</span>
              ) : (
                <span>{invoiceForm.paymentTerms}</span>
              )}
            </p>

            <p className="flex items-baseline gap-1">
              <span className="font-bold text-slate-900 shrink-0">Payment Method / Reference:</span>{' '}
              {isBlank ? (
                <span className="inline-block border-b border-slate-400 w-52">&nbsp;</span>
              ) : isEditing ? (
                <input 
                  type="text" 
                  value={invoiceForm.paymentMethod}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value })}
                  className="px-1.5 py-0.5 border border-cyan-400 rounded text-xs font-mono"
                />
              ) : (
                <span className="font-semibold text-slate-900">{invoiceForm.paymentMethod}</span>
              )}
            </p>

            {!isBlank && (
              <p className="text-[10px] text-slate-500 leading-normal pt-1">
                <span className="font-bold text-slate-600">Note:</span> This invoice records the total fee and provides fields to reconcile part-payment and the outstanding balance. Update the amount received and balance before issuing. Use the appropriate GST tax invoice format according to the company's GST invoicing requirements.
              </p>
            )}
          </div>

          {/* Authorized Signatory Section */}
          <div className="pt-6 flex items-end justify-between">
            <div className="space-y-1">
              {/* Authentic Handwritten Signature: Custom Uploaded PDF/Image or Default Convosis Signature */}
              {!isBlank && !useBlankSignature ? (
                companySignature ? (
                  <div className="h-16 w-52 flex items-center relative group">
                    <img 
                      src={companySignature} 
                      alt="Company Authorised Signature" 
                      className="max-h-16 max-w-[200px] w-auto object-contain select-none"
                    />
                    {isEditing && (
                      <div className="absolute -top-2 -right-4 hidden group-hover:flex items-center gap-1 bg-white p-1 rounded-md border border-slate-300 shadow-xs">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1 text-cyan-600 hover:bg-cyan-50 rounded"
                          title="Upload new signature PDF/image"
                        >
                          <Upload className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={removeCompanySignature}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          title="Reset to default Convosis handwritten signature"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-14 w-44 flex items-center relative group">
                    <svg viewBox="0 0 160 50" className="w-40 h-13 text-slate-900">
                      <path 
                        d="M 8 36 Q 24 10 34 27 T 48 29 Q 62 4 68 31 T 88 27 Q 102 14 122 34 Q 138 29 152 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                      <path 
                        d="M 18 21 Q 48 14 82 21 T 136 17" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                      />
                    </svg>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -top-1 -right-2 hidden group-hover:flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-300 text-[10px] text-cyan-700 font-semibold shadow-xs"
                      >
                        <Upload className="w-2.5 h-2.5" />
                        <span>Upload PDF</span>
                      </button>
                    )}
                  </div>
                )
              ) : (
                <div className="h-14 w-44 border-b border-dashed border-slate-400 mb-1" />
              )}

              <div className="text-xs font-bold text-slate-900 uppercase">
                For CONVOSIS TECHNOLOGIES PRIVATE LIMITED
              </div>
              <div className="text-[11px] text-slate-600">
                {isEditing ? (
                  <input
                    type="text"
                    value={signatoryRole}
                    onChange={(e) => setSignatoryRole(e.target.value)}
                    className="px-1 py-0.5 border border-cyan-400 rounded text-[11px]"
                  />
                ) : (
                  signatoryRole
                )}
              </div>
            </div>

            <div className="text-right text-xs font-medium text-slate-700">
              <span className="font-bold text-slate-900">Date: </span>
              {isBlank ? (
                <span className="inline-block border-b border-slate-700 w-32 font-mono">&nbsp;</span>
              ) : isEditing ? (
                <input 
                  type="text" 
                  value={invoiceForm.signDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, signDate: e.target.value })}
                  className="w-24 px-1 py-0.5 border border-cyan-400 rounded text-xs text-right"
                />
              ) : (
                invoiceForm.signDate
              )}
            </div>
          </div>

          {/* Document Footer Bar */}
          <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>CONVOSIS TECHNOLOGIES PRIVATE LIMITED</span>
            <span>{pageFooterLabel} | Page 1</span>
          </div>

        </div>

      </div>
    </div>
  );
}
