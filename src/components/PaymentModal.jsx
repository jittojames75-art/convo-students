import React, { useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { CreditCard, DollarSign, CheckCircle2, X } from 'lucide-react';

export default function PaymentModal() {
  const { 
    isPaymentModalOpen, 
    setIsPaymentModalOpen, 
    selectedStudentForPayment, 
    selectedInstallmentIndex,
    settings, 
    recordPayment 
  } = useAcademy();

  const [paymentMethod, setPaymentMethod] = useState('Stripe Card');
  const [transactionRef, setTransactionRef] = useState(() => `TXN-${Math.floor(10000 + Math.random() * 90000)}`);
  const [note, setNote] = useState('');

  if (!isPaymentModalOpen || !selectedStudentForPayment) return null;

  const currentInstallment = selectedStudentForPayment.installments[selectedInstallmentIndex] || selectedStudentForPayment.installments[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    recordPayment(selectedStudentForPayment.id, selectedInstallmentIndex, {
      paymentMethod,
      transactionRef,
      note
    });
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card rounded-3xl max-w-md w-full p-6 sm:p-7 border shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/25">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Record Tuition Settlement</h2>
              <p className="text-xs opacity-70">Official Invoice Receipt Generation</p>
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
        <div className="p-4 rounded-2xl glass-card border bg-black/5 dark:bg-white/5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="opacity-70">Student:</span>
            <span className="font-bold">{selectedStudentForPayment.name} ({selectedStudentForPayment.id})</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Program:</span>
            <span className="font-medium">{selectedStudentForPayment.programTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Milestone:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{currentInstallment?.title}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-black/5 dark:border-white/10 text-sm">
            <span className="font-bold">Amount to Settle:</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {settings.currency}{currentInstallment?.amount}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold opacity-75 block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input outline-hidden cursor-pointer"
            >
              <option value="Stripe Card">Credit Card (Stripe / Visa / Mastercard)</option>
              <option value="Bank Transfer">Direct Bank Wire / SWIFT</option>
              <option value="UPI / QR">Instant UPI / QR Code</option>
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
              placeholder="e.g. Cleared via online banking portal"
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

