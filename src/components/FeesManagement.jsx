import React, { useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  FileText, 
  Search, 
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Download
} from 'lucide-react';

export default function FeesManagement() {
  const { 
    students, 
    settings, 
    recordPayment, 
    bulkSendDueReminders, 
    setSelectedStudentForPayment, 
    setSelectedInstallmentIndex,
    setIsPaymentModalOpen,
    setActiveReceiptData,
    setIsReceiptModalOpen,
    setIsComposeEmailOpen,
    setComposeEmailProps,
    addToast
  } = useAcademy();

  const [feeFilter, setFeeFilter] = useState('all'); // 'all' | 'overdue' | 'pending' | 'settled'
  const [searchTerm, setSearchTerm] = useState('');

  // Calculations
  const totalCollected = students.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalReceivables = students.reduce((acc, s) => acc + s.remainingBalance, 0);
  const totalRevenue = totalCollected + totalReceivables;

  const overdueList = students.filter(
    (s) => s.paymentMode === 'installment' && s.installments.some((i) => i.status === 'overdue')
  );

  const pendingList = students.filter(
    (s) => s.paymentMode === 'installment' && s.installments.some((i) => i.status === 'pending')
  );

  const filteredStudents = students.filter((s) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.programTitle.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (feeFilter === 'overdue') {
      return s.paymentMode === 'installment' && s.installments.some((i) => i.status === 'overdue');
    }
    if (feeFilter === 'pending') {
      return s.paymentMode === 'installment' && s.installments.some((i) => i.status === 'pending');
    }
    if (feeFilter === 'settled') {
      return s.remainingBalance === 0;
    }
    return true;
  });

  const handleViewReceipt = (student, installment) => {
    setActiveReceiptData({
      receiptNumber: installment.transactionRef || `REC-${Math.floor(10000 + Math.random() * 90000)}`,
      studentName: student.name,
      studentEmail: student.email,
      studentId: student.id,
      programTitle: student.programTitle,
      amountPaid: installment.amount,
      paymentDate: installment.paidDate || new Date().toISOString().split('T')[0],
      paymentMethod: installment.method || 'Online Payment',
      remainingBalance: student.remainingBalance,
      installmentTitle: installment.title,
      academyName: settings.name
    });
    setIsReceiptModalOpen(true);
  };

  // Export Fee Ledger to CSV
  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Email', 'Program', 'Payment Mode', 'Total Fee', 'Paid Amount', 'Remaining Balance', 'Month 1', 'Month 2', 'Month 3'];
    const rows = students.map((s) => [
      s.id,
      `"${s.name}"`,
      s.email,
      `"${s.programTitle}"`,
      s.paymentMode,
      s.totalFee,
      s.paidAmount,
      s.remainingBalance,
      s.installments[0] ? `${s.installments[0].status} ($${s.installments[0].amount})` : 'N/A',
      s.installments[1] ? `${s.installments[1].status} ($${s.installments[1].amount})` : 'N/A',
      s.installments[2] ? `${s.installments[2].status} ($${s.installments[2].amount})` : 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CONVOSIS_Fee_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Fee ledger exported to CSV successfully!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Actions - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Tuition Fees & 3-Month Installments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Convosis Technologies Private Limited • Installment ledger, receipts, and reminder dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass-card glass-card-hover border text-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={bulkSendDueReminders}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Due Reminders</span>
          </button>
        </div>
      </div>

      {/* KPI Cards - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3.5 border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Received</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600">
            {settings.currency}{totalCollected.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Total Pipeline: {settings.currency}{totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="glass-card rounded-xl p-3.5 border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Receivables</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 text-2xl font-extrabold text-amber-600">
            {settings.currency}{totalReceivables.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Across next 60 days
          </div>
        </div>

        <div className="glass-card rounded-xl p-3.5 border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Overdue Alerts</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-1 text-2xl font-extrabold text-rose-600">
            {overdueList.length} Candidates
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-semibold">
            Action required: Notice queue
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFeeFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer ${
              feeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'opacity-70 hover:opacity-100 border-black/10 dark:border-white/10'
            }`}
          >
            All Accounts ({students.length})
          </button>
          <button
            onClick={() => setFeeFilter('overdue')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              feeFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 border-rose-500/30 hover:bg-rose-50/20'
            }`}
          >
            <span>Overdue Installments ({overdueList.length})</span>
          </button>
          <button
            onClick={() => setFeeFilter('pending')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer ${
              feeFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-600 border-amber-500/30 hover:bg-amber-50/20'
            }`}
          >
            Upcoming Installments ({pendingList.length})
          </button>
          <button
            onClick={() => setFeeFilter('settled')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer ${
              feeFilter === 'settled'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-600 border-emerald-500/30 hover:bg-emerald-50/20'
            }`}
          >
            Fully Settled
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            placeholder="Search by student or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl text-xs glass-input outline-hidden"
          />
        </div>
      </div>

      {/* Installment Grid Cards */}
      <div className="space-y-4">
        {filteredStudents.map((student) => {
          const isFullySettled = student.remainingBalance === 0;

          return (
            <div
              key={student.id}
              className="glass-card rounded-xl p-3.5 border transition-all hover:border-cyan-300 space-y-2.5"
            >
              {/* Top Row: Student info and Fee status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{student.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({student.id})</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {student.programTitle}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.2">
                      Mode: <span className="font-semibold text-slate-700">{student.paymentMode === 'full' ? 'Full Settlement' : '3-Month Plan'}</span> • Enrolled: {student.enrollmentDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Settled / Total</div>
                    <div className="text-xs sm:text-sm font-bold text-cyan-700">
                      {settings.currency}{student.paidAmount} / {settings.currency}{student.totalFee}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Remaining</div>
                    <div className={`text-xs sm:text-sm font-bold ${student.remainingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {settings.currency}{student.remainingBalance}
                    </div>
                  </div>
                </div>
              </div>

              {/* Installment Milestones Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {student.installments.map((inst, idx) => {
                  const isPaid = inst.status === 'paid';
                  const isOverdue = inst.status === 'overdue';

                  return (
                    <div
                      key={inst.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between text-xs transition-all ${
                        isPaid
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : isOverdue
                          ? 'bg-rose-500/10 border-rose-500/40 shadow-xs'
                          : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold flex items-center gap-1">
                            {isPaid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                            <span>{inst.title}</span>
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : isOverdue
                              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 animate-pulse'
                              : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          }`}>
                            {inst.status}
                          </span>
                        </div>

                        <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                          {settings.currency}{inst.amount}
                        </div>

                        <div className="text-[11px] opacity-70 mt-1">
                          {isPaid ? (
                            <span>Paid on: {inst.paidDate} ({inst.method})</span>
                          ) : (
                            <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>Due by: {inst.dueDate}</span>
                          )}
                        </div>

                        {inst.transactionRef && (
                          <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                            Txn: {inst.transactionRef}
                          </div>
                        )}
                      </div>

                      {/* Card Action */}
                      <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                        {isPaid ? (
                          <button
                            onClick={() => handleViewReceipt(student, inst)}
                            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View Receipt</span>
                          </button>
                        ) : (
                          <div className="w-full flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudentForPayment(student);
                                setSelectedInstallmentIndex(idx);
                                setIsPaymentModalOpen(true);
                              }}
                              className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all text-center cursor-pointer"
                            >
                              Collect {settings.currency}{inst.amount}
                            </button>
                            <button
                              onClick={() => {
                                setComposeEmailProps({
                                  student,
                                  initialTemplateType: isOverdue ? 'fee_overdue' : 'fee_reminder'
                                });
                                setIsComposeEmailOpen(true);
                              }}
                              className="p-1.5 rounded-lg border glass-card hover:bg-black/5 transition-all cursor-pointer text-blue-600"
                              title="Send Reminder Email"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

