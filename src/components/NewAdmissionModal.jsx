import React, { useState, useEffect } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { UserPlus, BookOpen, Briefcase, CreditCard, X, Percent, CheckCircle2, FileText } from 'lucide-react';

export default function NewAdmissionModal() {
  const { 
    isAdmissionModalOpen, 
    setIsAdmissionModalOpen, 
    courses, 
    internships, 
    dualPrograms,
    settings, 
    addStudent,
    openInvoice
  } = useAcademy();

  const allPrograms = [...courses, ...internships, ...(dualPrograms || [])];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: 'Vilayil Veedu, Ellukala , Puthuppally P.O, Kottayam',
    programId: allPrograms[0]?.id || '',
    paymentMode: 'installment', // 'full' or 'installment'
    initialPaymentMade: false,
    paymentMethod: 'UPI / QR Instant Pay'
  });

  const [feeDiscount, setFeeDiscount] = useState('');
  const [discountReason, setDiscountReason] = useState('Merit Scholarship');

  // Reset form with clean state every time modal opens
  useEffect(() => {
    if (isAdmissionModalOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: 'Vilayil Veedu, Ellukala , Puthuppally P.O, Kottayam',
        programId: allPrograms[0]?.id || '',
        paymentMode: 'installment',
        initialPaymentMade: false,
        paymentMethod: 'UPI / QR Instant Pay'
      });
      setFeeDiscount('');
      setDiscountReason('Merit Scholarship');
    }
  }, [isAdmissionModalOpen, allPrograms.length]);

  if (!isAdmissionModalOpen) return null;

  // Empty state guard
  if (allPrograms.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
        <div className="glass-card rounded-2xl max-w-md w-full p-6 border shadow-2xl bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Programs Available</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All sample courses and internships have been cleared (clean zero data). Please create a course or internship first from the <strong>Curriculum & Programs</strong> tab or <strong>Admin Panel</strong> before admitting candidates.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setIsAdmissionModalOpen(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer"
            >
              Understand & Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Selected program details
  const selectedProgram = allPrograms.find((p) => p.id === formData.programId) || allPrograms[0];
  const isCourse = selectedProgram.type === 'course';

  const baseFee = selectedProgram.baseFee || selectedProgram.feeStructure?.baseFee || 15000;
  const gstPercent = selectedProgram.gstPercent || selectedProgram.feeStructure?.gstPercent || 18;
  const gstAmount = selectedProgram.gstAmount || Math.round(baseFee * (gstPercent / 100));
  const fullAmount = selectedProgram.fullAmount || selectedProgram.feeStructure?.fullAmount || (baseFee + gstAmount); // 17,700
  const months = selectedProgram.installmentMonths || selectedProgram.feeStructure?.installmentMonths || 3;

  // Fee Adjustment / Concession Calculation
  const numDiscount = Math.min(fullAmount, Math.max(0, Number(feeDiscount) || 0));
  const finalTotalFee = fullAmount - numDiscount;
  const finalBaseFee = Math.round(finalTotalFee / 1.18);
  const finalGstAmount = finalTotalFee - finalBaseFee;
  const finalMonthlyAmt = Math.round(finalTotalFee / months);

  const installmentsSchedule = Array.from({ length: months }, (_, i) => {
    const isLast = i === months - 1;
    const allocated = isLast ? (finalTotalFee - (finalMonthlyAmt * (months - 1))) : finalMonthlyAmt;
    return {
      month: i + 1,
      title: `Month ${i + 1} Installment (Base ₹${Math.round(finalBaseFee / months).toLocaleString()} + ${gstPercent}% GST)`,
      amount: allocated
    };
  });

  const handleSubmit = async (e, openInvoiceAfter = false) => {
    if (e && e.preventDefault) e.preventDefault();

    let installments = [];
    let paidAmount = 0;
    const today = new Date().toISOString().split('T')[0];

    // Compute installment milestone dates
    const d2 = new Date();
    d2.setDate(d2.getDate() + 30);
    const dateM2 = d2.toISOString().split('T')[0];

    const d3 = new Date();
    d3.setDate(d3.getDate() + 60);
    const dateM3 = d3.toISOString().split('T')[0];

    if (formData.paymentMode === 'full') {
      paidAmount = finalTotalFee;
      installments = [
        {
          id: `inst-${Date.now()}-1`,
          month: 1,
          title: `Full Tuition (Base ₹${finalBaseFee.toLocaleString()} + 18% GST)`,
          amount: finalTotalFee,
          dueDate: today,
          status: 'paid',
          paidDate: today,
          transactionRef: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          method: formData.paymentMethod
        }
      ];
    } else {
      const m1Amt = installmentsSchedule[0]?.amount || finalMonthlyAmt;
      const m2Amt = installmentsSchedule[1]?.amount || finalMonthlyAmt;
      const m3Amt = installmentsSchedule[2]?.amount || finalMonthlyAmt;

      if (formData.initialPaymentMade) {
        paidAmount = m1Amt;
      }

      installments = [
        {
          id: `inst-${Date.now()}-1`,
          month: 1,
          title: `Month 1 Installment (Base ₹${Math.round(finalBaseFee / months).toLocaleString()} + ${gstPercent}% GST)`,
          amount: m1Amt,
          dueDate: today,
          status: formData.initialPaymentMade ? 'paid' : 'pending',
          paidDate: formData.initialPaymentMade ? today : null,
          transactionRef: formData.initialPaymentMade ? `TXN-${Math.floor(10000 + Math.random() * 90000)}` : null,
          method: formData.initialPaymentMade ? formData.paymentMethod : null
        },
        {
          id: `inst-${Date.now()}-2`,
          month: 2,
          title: `Month 2 Installment (Base ₹${Math.round(finalBaseFee / months).toLocaleString()} + ${gstPercent}% GST)`,
          amount: m2Amt,
          dueDate: dateM2,
          status: 'pending',
          paidDate: null,
          transactionRef: null,
          method: null
        },
        {
          id: `inst-${Date.now()}-3`,
          month: 3,
          title: `Month 3 Installment (Base ₹${Math.round(finalBaseFee / months).toLocaleString()} + ${gstPercent}% GST)`,
          amount: m3Amt,
          dueDate: dateM3,
          status: 'pending',
          paidDate: null,
          transactionRef: null,
          method: null
        }
      ];
    }

    const remainingDue = Math.max(0, finalTotalFee - paidAmount);

    const adjustmentRecord = numDiscount > 0 ? {
      id: `adj-adm-${Date.now()}`,
      date: today,
      type: 'discount',
      amount: numDiscount,
      reason: discountReason || 'Admission Fee Concession',
      previousTotal: fullAmount,
      newTotal: finalTotalFee,
      previousDue: fullAmount,
      newDue: remainingDue,
      adjustedBy: 'Admin'
    } : null;

    const admittedStudent = await addStudent({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address || 'Vilayil Veedu, Ellukala , Puthuppally P.O, Kottayam',
      programId: selectedProgram.id,
      programTitle: selectedProgram.title,
      programType: selectedProgram.type,
      paymentMode: formData.paymentMode,
      baseFee: finalBaseFee,
      gstPercent,
      gstAmount: finalGstAmount,
      totalFee: finalTotalFee,
      paidAmount,
      remainingBalance: remainingDue,
      feeAdjustment: adjustmentRecord,
      adjustmentHistory: adjustmentRecord ? [adjustmentRecord] : [],
      installments
    });

    setIsAdmissionModalOpen(false);

    if (openInvoiceAfter && admittedStudent) {
      setTimeout(() => {
        openInvoice(admittedStudent, admittedStudent.programType === 'internship' ? 'retainer' : 'tax');
      }, 150);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="glass-card rounded-2xl max-w-xl w-full p-6 sm:p-7 border shadow-2xl bg-white space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-600 text-white shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">New Candidate Admission</h2>
              <p className="text-xs text-slate-500">Convosis Technologies Private Limited • Official Enrollment</p>
            </div>
          </div>

          <button
            onClick={() => setIsAdmissionModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Full Candidate Name *</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Chandra"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg glass-input font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                placeholder="ramesh@convosis.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg glass-input font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Phone *</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg glass-input font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Residential Address (for Retainer Invoice)</label>
              <input
                type="text"
                placeholder="e.g. Vilayil Veedu, Ellukala, Puthuppally P.O, Kottayam"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg glass-input font-medium"
              />
            </div>
          </div>

          {/* Program Select */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Enrolled Program (Course, Internship, or Dual Track)</label>
            <select
              value={formData.programId || selectedProgram.id}
              onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg glass-input font-bold cursor-pointer"
            >
              {courses.length > 0 && (
                <optgroup label="Academic Courses (₹15,000 + 18% GST)">
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      Course: {c.title} (₹{(c.baseFee || 15000).toLocaleString()} + {c.gstPercent || 18}% GST = ₹{(c.fullAmount || 17700).toLocaleString()})
                    </option>
                  ))}
                </optgroup>
              )}
              {internships.length > 0 && (
                <optgroup label="Live Industry Internships (₹15,000 + 18% GST)">
                  {internships.map((i) => (
                    <option key={i.id} value={i.id}>
                      Internship: {i.title} (₹{(i.baseFee || 15000).toLocaleString()} + {i.gstPercent || 18}% GST = ₹{(i.fullAmount || 17700).toLocaleString()})
                    </option>
                  ))}
                </optgroup>
              )}
              {dualPrograms && dualPrograms.length > 0 && (
                <optgroup label="Course + Internship (Dual Track - ₹30,000 + 18% GST)">
                  {dualPrograms.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dual Track: {d.title} (₹{(d.baseFee || 30000).toLocaleString()} + {d.gstPercent || 18}% GST = ₹{(d.fullAmount || 35400).toLocaleString()})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Fee & GST Breakdown Preview Card with Optional Fee Adjustment */}
          <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span>Standard Package Fee (Base + 18% GST):</span>
              <span className="font-bold text-slate-800">₹{fullAmount.toLocaleString()}</span>
            </div>

            {/* Optional Fee Adjustment / Scholarship Input */}
            <div className="pt-2 border-t border-cyan-200/80">
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <span>Fee Adjustment / Scholarship Concession (Optional)</span>
                </label>
                {numDiscount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    -₹{numDiscount.toLocaleString()} Concession
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    max={fullAmount}
                    step="500"
                    placeholder="Concession amount (e.g. 5400)"
                    value={feeDiscount}
                    onChange={(e) => setFeeDiscount(e.target.value)}
                    className="w-full pl-6 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-xs outline-hidden"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Reason (e.g. Merit Scholarship)"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-cyan-200 font-extrabold text-cyan-900 text-sm">
              <span>Adjusted Net Total Fee:</span>
              <span className="text-base text-cyan-900">₹{finalTotalFee.toLocaleString()}</span>
            </div>
            {numDiscount > 0 && (
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Base: ₹{finalBaseFee.toLocaleString()} + 18% GST: ₹{finalGstAmount.toLocaleString()}</span>
                <span className="font-semibold text-emerald-700">Initial Due Amount: ₹{finalTotalFee.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Payment Plan Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Tuition Payment Structure</label>
            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => setFormData({ ...formData, paymentMode: 'full' })}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  formData.paymentMode === 'full'
                    ? 'border-cyan-600 bg-cyan-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs text-slate-800">Full Payment</div>
                <div className="text-[10px] text-slate-500 mt-0.5">100% upfront settlement</div>
                <div className="text-sm font-extrabold text-cyan-800 mt-1.5">
                  ₹{finalTotalFee.toLocaleString()}
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, paymentMode: 'installment' })}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  formData.paymentMode === 'installment'
                    ? 'border-cyan-600 bg-cyan-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs text-slate-800">3-Month Installment</div>
                <div className="text-[10px] text-slate-500 mt-0.5">3 monthly milestone payments</div>
                <div className="text-sm font-extrabold text-emerald-700 mt-1.5">
                  3x ₹{finalMonthlyAmt.toLocaleString()} / mo
                </div>
              </div>
            </div>
          </div>

          {/* Installment breakdown preview */}
          {formData.paymentMode === 'installment' && (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="font-bold text-[10px] text-slate-600 uppercase tracking-wider">
                Automated 3-Month Milestone Breakdown (Base + 18% GST)
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-lg border border-slate-200 bg-white">
                  <div className="text-slate-400">Month 1 (Today)</div>
                  <div className="font-bold text-slate-800 text-xs">₹{(installmentsSchedule[0]?.amount || finalMonthlyAmt).toLocaleString()}</div>
                </div>
                <div className="p-2 rounded-lg border border-slate-200 bg-white">
                  <div className="text-slate-400">Month 2 (+30d)</div>
                  <div className="font-bold text-slate-800 text-xs">₹{(installmentsSchedule[1]?.amount || finalMonthlyAmt).toLocaleString()}</div>
                </div>
                <div className="p-2 rounded-lg border border-slate-200 bg-white">
                  <div className="text-slate-400">Month 3 (+60d)</div>
                  <div className="font-bold text-slate-800 text-xs">₹{(installmentsSchedule[2]?.amount || finalMonthlyAmt).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="checkbox"
                  id="m1Paid"
                  checked={formData.initialPaymentMade}
                  onChange={(e) => setFormData({ ...formData, initialPaymentMade: e.target.checked })}
                  className="rounded cursor-pointer text-cyan-600"
                />
                <label htmlFor="m1Paid" className="cursor-pointer font-semibold text-slate-700">
                  Collect Month 1 Installment (₹{(installmentsSchedule[0]?.amount || finalMonthlyAmt).toLocaleString()}) immediately upon admission
                </label>
              </div>
            </div>
          )}

          {/* Payment Method selector */}
          {(formData.paymentMode === 'full' || formData.initialPaymentMade) && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg glass-input cursor-pointer"
              >
                <option value="UPI / QR Instant Pay">UPI / QR Instant Pay (UPI(ID:628943139310))</option>
                <option value="Direct Bank Transfer (NEFT/RTGS)">Direct Bank Transfer (NEFT/RTGS)</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Cash Counter">Cash Counter</option>
              </select>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdmissionModalOpen(false)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer text-xs"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-[#0a2f5c] hover:bg-[#072447] text-white font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 text-xs"
                title="Admit candidate and immediately view official Convosis Retainer Invoice"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Admit & Open Retainer</span>
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Admission</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
