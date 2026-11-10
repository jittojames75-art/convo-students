import React, { useState, useEffect } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { CreditCard, DollarSign, CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function PaymentModal() {
  const { 
    isPaymentModalOpen, 
    setIsPaymentModalOpen, 
    selectedStudentForPayment, 
    selectedInstallmentIndex,
    settings, 
    recordPayment 
  } = useAcademy();

  const [paymentMethod, setPaymentMethod] = useState('UPI / QR');
  const [transactionRef, setTransactionRef] = useState(() => `TXN-${Math.floor(10000 + Math.random() * 90000)}`);
  const [note, setNote] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

  const currentInstallment = selectedStudentForPayment?.installments[selectedInstallmentIndex] || selectedStudentForPayment?.installments[0];

  useEffect(() => {
    if (currentInstallment) {
      setSettleAmount(currentInstallment.amount.toString());
      setTransactionRef(`TXN-${Math.floor(10000 + Math.random() * 90000)}`);
      setNote('');
    }
  }, [currentInstallment, selectedStudentForPayment]);

  if (!isPaymentModalOpen || !selectedStudentForPayment) return null;

  const currentDue = selectedStudentForPayment.remainingBalance;
  const numSettleAmount = Number(settleAmount) || 0;
  const resultingDue = Math.max(0, currentDue - numSettleAmount);

  const handleSubmit = (e) => {
    e.preventDefault();
    recordPayment(selectedStudentForPayment.id, selectedInstallmentIndex, {
      paymentMethod,
      transactionRef,
      note,
      customAmount: numSettleAmount
    });
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card rounded-3xl max-w-md w-full p-6 sm:p-7 border shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/25">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Record Tuition Settlement</h2>
              <p className="text-xs opacity-70">Payment reconciliation & official receipt</p>
            </div>
          </div>

          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Details */}
        <div className="p-3.5 rounded-2xl glass-card border bg-black/5 dark:bg-white/5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="opacity-70">Candidate:</span>
            <span className="font-bold">{selectedStudentForPayment.name} ({selectedStudentForPayment.id})</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Program:</span>
            <span className="font-medium">{selectedStudentForPayment.programTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Target Milestone:</span>
            <span className="font-bold text-cyan-700 dark:text-cyan-400">{currentInstallment?.title}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/10">
            <span className="opacity-70 font-semibold">Total Outstanding Due:</span>
            <span className="text-sm font-extrabold text-amber-600">
              {settings.currency}{currentDue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Editable Settlement Amount & Quick Options */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-800 dark:text-slate-200">Amount to Settle (₹)</label>
              <div className="flex items-center gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSettleAmount(currentInstallment?.amount.toString() || '0')}
                  className="text-cyan-600 hover:underline font-bold"
                >
                  Milestone (₹{currentInstallment?.amount})
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setSettleAmount(currentDue.toString())}
                  className="text-emerald-600 hover:underline font-bold"
                >
                  Full Due (₹{currentDue.toLocaleString()})
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                {settings.currency}
              </span>
              <input
                type="number"
                required
                min="1"
                max={currentDue || 1000000}
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl glass-input outline-hidden font-extrabold text-base text-emerald-600"
              />
            </div>

            {/* Live Due Amount Calculation */}
            <div className="flex items-center justify-between text-[11px] mt-1.5 px-1 font-semibold text-slate-500">
              <span>Remaining Due after payment:</span>
              <span className={resultingDue > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                {settings.currency}{resultingDue.toLocaleString()} {resultingDue === 0 && '(Fully Settled)'}
              </span>
            </div>
          </div>

          <div>
            <label className="font-bold opacity-75 block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input outline-hidden cursor-pointer"
            >
              <option value="UPI / QR">Instant UPI / QR Code (UPI(ID:628943139310))</option>
              <option value="Bank Transfer">Direct Bank Wire / NEFT / IMPS</option>
              <option value="Stripe Card">Credit / Debit Card (Stripe / Visa)</option>
              <option value="PayPal">PayPal Business</option>
              <option value="Cash Counter">Cash at Reception</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold opacity-75">Transaction Reference #</label>
              <button
                type="button"
                onClick={() => setTransactionRef(`TXN-${Math.floor(10000 + Math.random() * 90000)}`)}
                className="text-[10px] text-blue-500 font-semibold hover:underline"
              >
                Regenerate
              </button>
            </div>
            <input
              type="text"
              required
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="font-bold opacity-75 block mb-1">Internal Note / Comments (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Cleared via UPI transaction ID"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl glass-card border hover:bg-black/5 cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Generate Receipt</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

