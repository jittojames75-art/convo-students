import React, { useState, useEffect } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { 
  SlidersHorizontal, 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  RefreshCw,
  FileText,
  Sparkles,
  HelpCircle,
  Tag
} from 'lucide-react';

export default function FeeAdjustmentModal() {
  const {
    isFeeAdjustmentModalOpen,
    closeFeeAdjustment,
    selectedStudentForAdjustment,
    adjustStudentFee,
    openInvoice,
    settings,
    addToast
  } = useAcademy();

  const student = selectedStudentForAdjustment;

  // Adjustment mode: 'discount' | 'target_due' | 'target_total' | 'surcharge'
  const [adjustmentMode, setAdjustmentMode] = useState('discount');
  const [inputValue, setInputValue] = useState('');
  const [reasonCategory, setReasonCategory] = useState('Merit Scholarship');
  const [customReason, setCustomReason] = useState('');
  const [distributionMode, setDistributionMode] = useState('even'); // 'even' | 'manual'
  const [manualInstallmentAmounts, setManualInstallmentAmounts] = useState([]);

  // Reset state when student changes
  useEffect(() => {
    if (student) {
      setAdjustmentMode('discount');
      setInputValue('');
      setReasonCategory('Merit Scholarship');
      setCustomReason('');
      setDistributionMode('even');
      setManualInstallmentAmounts(
        student.installments ? student.installments.map(i => i.amount) : []
      );
    }
  }, [student]);

  if (!isFeeAdjustmentModalOpen || !student) return null;

  const currentTotal = Number(student.totalFee) || 0;
  const currentPaid = Number(student.paidAmount) || 0;
  const currentDue = Number(student.remainingBalance) ?? Math.max(0, currentTotal - currentPaid);

  const numInput = Number(inputValue) || 0;

  // Compute newTotal and newDue based on mode
  let newTotal = currentTotal;
  let newDue = currentDue;
  let effectiveDiscount = 0;

  if (adjustmentMode === 'discount') {
    effectiveDiscount = Math.min(currentDue, Math.max(0, numInput));
    newTotal = Math.max(currentPaid, currentTotal - effectiveDiscount);
    newDue = Math.max(0, newTotal - currentPaid);
  } else if (adjustmentMode === 'surcharge') {
    const surcharge = Math.max(0, numInput);
    newTotal = currentTotal + surcharge;
    newDue = currentDue + surcharge;
    effectiveDiscount = -surcharge;
  } else if (adjustmentMode === 'target_due') {
    newDue = Math.max(0, numInput);
    newTotal = currentPaid + newDue;
    effectiveDiscount = currentTotal - newTotal;
  } else if (adjustmentMode === 'target_total') {
    newTotal = Math.max(currentPaid, numInput);
    newDue = Math.max(0, newTotal - currentPaid);
    effectiveDiscount = currentTotal - newTotal;
  }

  // Calculate unpaid installments re-balancing
  const unpaidInstallments = (student.installments || []).filter(i => i.status !== 'paid');
  const unpaidCount = unpaidInstallments.length || 1;
  const perInstallmentShare = Math.round(newDue / unpaidCount);

  // Quick preset handlers
  const handlePresetDiscount = (amt) => {
    setAdjustmentMode('discount');
    setInputValue(amt.toString());
  };

  const handlePresetPercentage = (pct) => {
    setAdjustmentMode('discount');
    const amt = Math.round(currentTotal * (pct / 100));
    setInputValue(amt.toString());
  };

  const handlePresetDue = (targetDueAmt) => {
    setAdjustmentMode('target_due');
    setInputValue(targetDueAmt.toString());
  };

  const handleSave = (openInvoiceAfter = false) => {
    const finalReason = customReason.trim() ? `${reasonCategory}: ${customReason.trim()}` : reasonCategory;

    // Build finalized installments
    let finalInstallments = [];
    if (distributionMode === 'manual' && manualInstallmentAmounts.length === student.installments.length) {
      finalInstallments = student.installments.map((inst, idx) => ({
        ...inst,
        amount: inst.status === 'paid' ? inst.amount : Number(manualInstallmentAmounts[idx]) || 0
      }));
    } else {
      let runningDue = newDue;
      const totalUnpaid = unpaidInstallments.length;
      let unpaidSeen = 0;

      finalInstallments = student.installments.map((inst) => {
        if (inst.status === 'paid') return inst;
        unpaidSeen += 1;
        const isLastUnpaid = unpaidSeen === totalUnpaid;
        const allocated = isLastUnpaid ? runningDue : perInstallmentShare;
        runningDue = Math.max(0, runningDue - allocated);

        return {
          ...inst,
          amount: newDue === 0 ? 0 : allocated,
          status: newDue === 0 ? 'paid' : 'pending'
        };
      });
    }

    const updated = adjustStudentFee(student.id, {
      newTotalFee: newTotal,
      newRemainingBalance: newDue,
      discountAmount: effectiveDiscount,
      adjustmentReason: finalReason,
      adjustmentType: adjustmentMode,
      installments: finalInstallments
    });

    closeFeeAdjustment();

    if (openInvoiceAfter && updated) {
      setTimeout(() => {
        openInvoice(updated, student.programType === 'internship' ? 'retainer' : 'tax');
      }, 150);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="glass-card rounded-2xl max-w-2xl w-full p-4 sm:p-6 border shadow-2xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 max-h-[94vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Adjust Tuition Fee & Due Amount
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200">
                  Ledger Modification
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Convosis Financial Management • Adjust concessions, waivers, surcharges, and remaining due.
              </p>
            </div>
          </div>

          <button
            onClick={closeFeeAdjustment}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Identifier Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
            />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">{student.name}</span>
              <span className="text-[10px] font-mono text-slate-400 ml-1.5">({student.id})</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-600">
              {student.programTitle}
            </span>
            <span className="text-slate-400">Enrolled: {student.enrollmentDate}</span>
          </div>
        </div>

        {/* Current Financial Status Cards */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Current Total Fee</span>
            <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
              {settings.currency}{currentTotal.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider">Paid to Date</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
              {settings.currency}{currentPaid.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block tracking-wider">Current Due Amount</span>
            <span className="text-base sm:text-lg font-extrabold text-amber-700 dark:text-amber-300">
              {settings.currency}{currentDue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Adjustment Mode Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Select Adjustment Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => { setAdjustmentMode('discount'); setInputValue(''); }}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                adjustmentMode === 'discount'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs font-bold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-400'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Concession / Discount</span>
                <span>(-)</span>
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">Scholarship or waiver</div>
            </button>

            <button
              type="button"
              onClick={() => { setAdjustmentMode('target_due'); setInputValue(currentDue.toString()); }}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                adjustmentMode === 'target_due'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs font-bold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-400'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Set Due Amount</span>
                <span>(=)</span>
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">Directly set target due</div>
            </button>

            <button
              type="button"
              onClick={() => { setAdjustmentMode('target_total'); setInputValue(currentTotal.toString()); }}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                adjustmentMode === 'target_total'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs font-bold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-400'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Set Total Fee</span>
                <span>(₹)</span>
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">Directly set package fee</div>
            </button>

            <button
              type="button"
              onClick={() => { setAdjustmentMode('surcharge'); setInputValue(''); }}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                adjustmentMode === 'surcharge'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs font-bold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-400'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Extra / Surcharge</span>
                <span>(+)</span>
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">Exam, cert, or late fee</div>
            </button>
          </div>
        </div>

        {/* Input Field & Quick Presets */}
        <div className="p-3.5 rounded-xl border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/30 dark:bg-cyan-950/15 space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
              {adjustmentMode === 'discount' && 'Discount / Concession Amount (₹)'}
              {adjustmentMode === 'target_due' && 'Target Remaining Due Amount (₹)'}
              {adjustmentMode === 'target_total' && 'Revised Total Package Fee (₹)'}
              {adjustmentMode === 'surcharge' && 'Additional Surcharge Amount (₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                {settings.currency}
              </span>
              <input
                type="number"
                min="0"
                step="100"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden"
              />
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 font-semibold flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-cyan-600" /> Presets:
            </span>
            {adjustmentMode === 'discount' && (
              <>
                <button
                  type="button"
                  onClick={() => handlePresetDiscount(2500)}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  ₹2,500 Off
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDiscount(5000)}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  ₹5,000 Off
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDiscount(10000)}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  ₹10,000 Off
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetPercentage(10)}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  10% Off
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetPercentage(20)}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  20% Off
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDiscount(currentDue)}
                  className="px-2 py-0.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 hover:border-emerald-500 cursor-pointer font-bold"
                >
                  Full Due Waiver (₹0 Due)
                </button>
              </>
            )}

            {adjustmentMode === 'target_due' && (
              <>
                <button
                  type="button"
                  onClick={() => handlePresetDue(0)}
                  className="px-2 py-0.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 hover:border-emerald-500 cursor-pointer font-bold"
                >
                  ₹0 Due (Fully Settled)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDue(10000)}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  ₹10,000 Due
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDue(15000)}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  ₹15,000 Due
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDue(20000)}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  ₹20,000 Due
                </button>
              </>
            )}

            {adjustmentMode === 'target_total' && (
              <>
                <button
                  type="button"
                  onClick={() => { setInputValue('15000'); }}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  ₹15,000 Flat
                </button>
                <button
                  type="button"
                  onClick={() => { setInputValue('20000'); }}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  ₹20,000 Flat
                </button>
                <button
                  type="button"
                  onClick={() => { setInputValue('25000'); }}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  ₹25,000 Flat
                </button>
                <button
                  type="button"
                  onClick={() => { setInputValue('30000'); }}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  ₹30,000 Flat
                </button>
              </>
            )}

            {adjustmentMode === 'surcharge' && (
              <>
                <button
                  type="button"
                  onClick={() => { setInputValue('1000'); }}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  +₹1,000 Exam Fee
                </button>
                <button
                  type="button"
                  onClick={() => { setInputValue('2500'); }}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  +₹2,500 Lab / Cert
                </button>
                <button
                  type="button"
                  onClick={() => { setInputValue('5000'); }}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 cursor-pointer font-medium"
                >
                  +₹5,000 Course Module
                </button>
              </>
            )}
          </div>
        </div>

        {/* Reason / Administrative Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Adjustment Reason Category
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium outline-hidden"
            >
              <option value="Merit Scholarship">Merit Scholarship</option>
              <option value="Convosis Early Bird Concession">Convosis Early Bird Concession</option>
              <option value="Institutional / College Partnership">Institutional / College Partnership</option>
              <option value="Sibling / Referral Concession">Sibling / Referral Concession</option>
              <option value="Management Discretion Waiver">Management Discretion Waiver</option>
              <option value="Financial Hardship Aid">Financial Hardship Aid</option>
              <option value="Examination / Certification Add-on">Examination / Certification Add-on</option>
              <option value="Late Registration Fee">Late Registration Fee</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Specific Remarks / Approval Ref (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Approved by Director, Ref #ADM-402"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-hidden"
            />
          </div>
        </div>

        {/* Real-Time Impact Comparison Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span>Ledger Adjustment Impact Preview</span>
            <span className="text-[10px] text-slate-400 font-normal">Auto-reconciles base fee & GST</span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase text-slate-400 font-bold bg-slate-50/40">
                <th className="py-2 px-3">Metric</th>
                <th className="py-2 px-3">Before Adjustment</th>
                <th className="py-2 px-3">After Adjustment</th>
                <th className="py-2 px-3 text-right">Net Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">Total Program Fee</td>
                <td className="py-2 px-3 font-semibold text-slate-500">{settings.currency}{currentTotal.toLocaleString()}</td>
                <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">{settings.currency}{newTotal.toLocaleString()}</td>
                <td className={`py-2 px-3 text-right font-bold ${newTotal < currentTotal ? 'text-emerald-600' : newTotal > currentTotal ? 'text-rose-600' : 'text-slate-400'}`}>
                  {newTotal < currentTotal && `-₹${(currentTotal - newTotal).toLocaleString()}`}
                  {newTotal > currentTotal && `+₹${(newTotal - currentTotal).toLocaleString()}`}
                  {newTotal === currentTotal && '₹0'}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">Paid to Date</td>
                <td className="py-2 px-3 font-semibold text-emerald-600">{settings.currency}{currentPaid.toLocaleString()}</td>
                <td className="py-2 px-3 font-semibold text-emerald-600">{settings.currency}{currentPaid.toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-slate-400">Locked (Paid)</td>
              </tr>
              <tr className="bg-amber-50/40 dark:bg-amber-950/20 font-bold">
                <td className="py-2.5 px-3 text-amber-900 dark:text-amber-200">Remaining Due Amount</td>
                <td className="py-2.5 px-3 text-amber-700 dark:text-amber-400">{settings.currency}{currentDue.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-lg text-amber-700 dark:text-amber-300">
                  {settings.currency}{newDue.toLocaleString()}
                </td>
                <td className={`py-2.5 px-3 text-right font-extrabold ${newDue < currentDue ? 'text-emerald-600' : newDue > currentDue ? 'text-rose-600' : 'text-slate-400'}`}>
                  {newDue < currentDue && `-₹${(currentDue - newDue).toLocaleString()} Due`}
                  {newDue > currentDue && `+₹${(newDue - currentDue).toLocaleString()} Due`}
                  {newDue === currentDue && 'Unchanged'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Installment Milestone Redistribution Preview */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <span>Installment Re-balancing ({student.installments?.length || 0} Milestones)</span>
            </span>
            <span className="text-[10px] text-slate-500">
              {newDue === 0 ? 'All milestones will be marked Settled' : `Even distribution of ₹${newDue.toLocaleString()} across remaining ${unpaidCount} unpaid milestone(s)`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {student.installments?.map((inst, idx) => {
              const isPaid = inst.status === 'paid';
              const targetAmt = isPaid ? inst.amount : (newDue === 0 ? 0 : perInstallmentShare);

              return (
                <div
                  key={inst.id || idx}
                  className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                    isPaid
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                      {inst.title || `Month ${inst.month}`}
                    </span>
                    {isPaid ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        Paid
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-[10px] text-slate-400">Amount:</span>
                    <span className={`font-bold ${isPaid ? 'text-emerald-700' : 'text-slate-900 dark:text-slate-100'}`}>
                      {settings.currency}{targetAmt.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={closeFeeAdjustment}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0a2f5c] hover:bg-[#072447] text-white shadow-xs cursor-pointer transition-all"
              title="Apply adjustment and open official Retainer Invoice preview"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Apply & Open Retainer</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-500/25 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Update Due (₹{newDue.toLocaleString()})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

