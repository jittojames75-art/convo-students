import React, { useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { 
  Search, 
  Filter, 
  CreditCard, 
  Mail, 
  CalendarCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MoreVertical, 
  UserPlus, 
  BookOpen, 
  Briefcase,
  AlertTriangle,
  Receipt,
  Award,
  Trash2,
  FileText
} from 'lucide-react';
import CertificateModal from './CertificateModal';

export default function StudentsDirectory() {
  const { 
    students, 
    setStudents,
    currentUser,
    deleteStudent,
    settings, 
    searchTerm, 
    setIsAdmissionModalOpen,
    setSelectedStudentForPayment,
    setSelectedInstallmentIndex,
    setIsPaymentModalOpen,
    setIsComposeEmailOpen,
    setComposeEmailProps,
    openInvoice,
    addToast
  } = useAcademy();

  const isAdmin = 
    currentUser?.role === 'Super Admin' || 
    currentUser?.role === 'Admin' || 
    currentUser?.is_superuser === true ||
    (currentUser?.role && currentUser.role.toLowerCase().includes('admin'));

  const [programFilter, setProgramFilter] = useState('all'); // 'all' | 'course' | 'internship'
  const [feeStatusFilter, setFeeStatusFilter] = useState('all'); // 'all' | 'paid' | 'installment' | 'overdue'
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all' | 'warning'
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [selectedStudentForCertificate, setSelectedStudentForCertificate] = useState(null);

  // Filter students
  const filteredStudents = students.filter((student) => {
    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = 
        student.name.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        student.id.toLowerCase().includes(q) ||
        student.programTitle.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Program type filter
    if (programFilter !== 'all' && student.programType !== programFilter) {
      return false;
    }

    // Fee status filter
    if (feeStatusFilter === 'paid' && student.remainingBalance > 0) return false;
    if (feeStatusFilter === 'installment' && (student.paymentMode !== 'installment' || student.remainingBalance === 0)) return false;
    if (feeStatusFilter === 'overdue') {
      const hasOverdue = student.installments?.some((i) => i.status === 'overdue');
      if (!hasOverdue) return false;
    }

    // Attendance filter
    if (attendanceFilter === 'warning' && student.attendanceStats.percentage >= 75) {
      return false;
    }

    return true;
  });

  const handleDeleteStudent = (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to remove ${studentName}?`)) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      addToast(`Removed student record for ${studentName}`, 'info');
      setSelectedStudentDetail(null);
    }
  };

  const handleOpenCompose = (student, templateType = 'fee_reminder') => {
    setComposeEmailProps({
      student,
      initialTemplateType: templateType
    });
    setIsComposeEmailOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & New Admission shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Student & Intern Directory</h1>
          <p className="text-xs sm:text-sm opacity-70 mt-1">
            Manage registrations, track 3-month installment plans, attendance records, and direct email dispatch.
          </p>
        </div>

        <button
          onClick={() => setIsAdmissionModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Admission</span>
        </button>
      </div>

      {/* Filter and Query Bar */}
      <div className="glass-card rounded-2xl p-4 border flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold opacity-60 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter By:</span>
          </div>

          {/* Program filter */}
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl glass-input outline-hidden font-medium cursor-pointer"
          >
            <option value="all">All Programs</option>
            <option value="course">Courses Only</option>
            <option value="internship">Internships Only</option>
            <option value="dual">Course + Internship (Dual Track)</option>
          </select>

          {/* Fee status filter */}
          <select
            value={feeStatusFilter}
            onChange={(e) => setFeeStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl glass-input outline-hidden font-medium cursor-pointer"
          >
            <option value="all">All Fee Statuses</option>
            <option value="paid">Fully Settled</option>
            <option value="installment">Active 3-Mo Installments</option>
            <option value="overdue">⚠️ Overdue Installments</option>
          </select>

          {/* Attendance warning filter */}
          <button
            onClick={() => setAttendanceFilter(attendanceFilter === 'all' ? 'warning' : 'all')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
              attendanceFilter === 'warning'
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                : 'opacity-70 hover:opacity-100 border-black/10 dark:border-white/10'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>Low Attendance (&lt;75%)</span>
          </button>
        </div>

        {/* Counter */}
        <div className="text-xs opacity-70 font-medium">
          Showing <span className="font-bold text-blue-600 dark:text-blue-400">{filteredStudents.length}</span> of {students.length} students
        </div>

      </div>

      {/* Main Student Directory Table - Compact & Fit Screen */}
      <div className="glass-card rounded-xl border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 pl-3">Candidate & ID</th>
                <th className="py-2.5">Program</th>
                <th className="py-2.5">Fee Mode</th>
                <th className="py-2.5">3-Month Milestones</th>
                <th className="py-2.5 text-center">Attendance</th>
                <th className="py-2.5 text-right pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No candidates matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isCourse = student.programType === 'course';
                  const isFullyPaid = student.remainingBalance === 0;
                  const hasOverdue = student.installments?.some((i) => i.status === 'overdue');
                  const nextPendingInst = student.installments?.find((i) => i.status !== 'paid');

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-cyan-50/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudentDetail(student)}
                    >
                      {/* Avatar & Name */}
                      <td className="py-2 pl-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs leading-tight flex items-center gap-1">
                              <span>{student.name}</span>
                              {hasOverdue && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" title="Overdue Installment" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {student.id} • {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Program */}
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          {isCourse ? (
                            <BookOpen className="w-3 h-3 text-cyan-600 shrink-0" />
                          ) : (
                            <Briefcase className="w-3 h-3 text-indigo-600 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800">{student.programTitle}</span>
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {student.enrollmentDate}
                        </div>
                      </td>

                      {/* Payment Mode */}
                      <td className="py-2">
                        {student.paymentMode === 'full' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Full ({settings.currency}{student.totalFee})
                          </span>
                        ) : (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                              3-Mo Plan
                            </span>
                            <div className="text-[9px] text-slate-500 mt-0.5">
                              {settings.currency}{student.paidAmount} of {settings.currency}{student.totalFee}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 3-Month Installment Visual Timeline */}
                      <td className="py-2">
                        {student.paymentMode === 'full' ? (
                          <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>100% Settled</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            {student.installments.map((inst) => {
                              let badgeClass = 'bg-slate-100 text-slate-500 border-slate-200';
                              let label = `M${inst.month}`;

                              if (inst.status === 'paid') {
                                badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
                              } else if (inst.status === 'overdue') {
                                badgeClass = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                              } else if (inst.status === 'pending') {
                                badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                              }

                              return (
                                <span
                                  key={inst.id}
                                  title={`Month ${inst.month}: ${settings.currency}${inst.amount} - ${inst.status.toUpperCase()}`}
                                  className={`px-1.5 py-0.5 rounded text-[9px] border flex items-center gap-0.5 ${badgeClass}`}
                                >
                                  <span>{label}: {settings.currency}{inst.amount}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Attendance */}
                      <td className="py-2 text-center">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          student.attendanceStats.percentage < 75
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {student.attendanceStats.percentage}%
                        </span>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {student.attendanceStats.attended}/{student.attendanceStats.totalClasses}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2 pr-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {!isFullyPaid && nextPendingInst && (
                            <button
                              onClick={() => {
                                setSelectedStudentForPayment(student);
                                setSelectedInstallmentIndex(student.installments.findIndex((i) => i.id === nextPendingInst.id));
                                setIsPaymentModalOpen(true);
                              }}
                              className="p-1 rounded-md text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-all cursor-pointer"
                              title={`Collect Month ${nextPendingInst.month} (${settings.currency}${nextPendingInst.amount})`}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => openInvoice(student, 'retainer')}
                            className="p-1 rounded-md text-[#0a2f5c] hover:bg-slate-100 border border-slate-300 transition-all cursor-pointer"
                            title="Generate Official Retainer Invoice"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#0a2f5c]" />
                          </button>

                          <button
                            onClick={() => handleOpenCompose(student, hasOverdue ? 'fee_overdue' : 'fee_reminder')}
                            className="p-1 rounded-md text-cyan-700 hover:bg-cyan-50 border border-cyan-200 transition-all cursor-pointer"
                            title="Send Automated Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedStudentDetail(student)}
                            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
                            title="View Profile"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete candidate admission for "${student.name}"?`)) {
                                  deleteStudent(student.id);
                                }
                              }}
                              className="p-1 rounded-md text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer"
                              title="Delete Candidate Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile & History Modal */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card rounded-3xl max-w-2xl w-full p-6 sm:p-8 border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudentDetail.avatar}
                  alt={selectedStudentDetail.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/50 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold">{selectedStudentDetail.name}</h2>
                    <span className="text-xs font-mono opacity-60">({selectedStudentDetail.id})</span>
                  </div>
                  <p className="text-xs opacity-75 mt-0.5">{selectedStudentDetail.email} • {selectedStudentDetail.phone}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-600">
                      {selectedStudentDetail.programTitle}
                    </span>
                    <span className="text-[11px] opacity-65">
                      Enrolled on {selectedStudentDetail.enrollmentDate}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Attendance & Financial Snapshot */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl glass-card border">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60 block">Fee Account</span>
                <div className="text-2xl font-extrabold text-blue-600 mt-1">
                  {settings.currency}{selectedStudentDetail.paidAmount} / {settings.currency}{selectedStudentDetail.totalFee}
                </div>
                <div className="text-xs opacity-75 mt-1">
                  Remaining: <span className="font-bold">{settings.currency}{selectedStudentDetail.remainingBalance}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-card border">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60 block">Attendance Rate</span>
                <div className="text-2xl font-extrabold text-indigo-600 mt-1">
                  {selectedStudentDetail.attendanceStats.percentage}%
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {selectedStudentDetail.attendanceStats.attended} of {selectedStudentDetail.attendanceStats.totalClasses} sessions attended
                </div>
              </div>
            </div>

            {/* Installments Detailed Log */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                Installment Payment Ledger
              </h3>
              <div className="space-y-2">
                {selectedStudentDetail.installments.map((inst, idx) => (
                  <div
                    key={inst.id}
                    className="p-3 rounded-xl glass-card border flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold">{inst.title}</div>
                      <div className="text-[11px] opacity-60">
                        Due: {inst.dueDate} {inst.paidDate && `• Settled: ${inst.paidDate} (${inst.method})`}
                      </div>
                      {inst.transactionRef && (
                        <div className="text-[10px] font-mono text-blue-500 mt-0.5">
                          Ref: {inst.transactionRef}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-extrabold text-sm">{settings.currency}{inst.amount}</div>
                        <span className={`text-[10px] font-bold uppercase ${
                          inst.status === 'paid' ? 'text-emerald-600' : inst.status === 'overdue' ? 'text-rose-600 font-extrabold' : 'text-amber-600'
                        }`}>
                          {inst.status}
                        </span>
                      </div>

                      {inst.status !== 'paid' && (
                        <button
                          onClick={() => {
                            setSelectedStudentDetail(null);
                            setSelectedStudentForPayment(selectedStudentDetail);
                            setSelectedInstallmentIndex(idx);
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
              <button
                onClick={() => handleDeleteStudent(selectedStudentDetail.id, selectedStudentDetail.name)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Deactivate Student
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const stu = selectedStudentDetail;
                    setSelectedStudentDetail(null);
                    openInvoice(stu, 'retainer');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0a2f5c] hover:bg-[#072447] text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  title="View and print official Convosis Retainer Invoice"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Retainer Invoice</span>
                </button>

                <button
                  onClick={() => {
                    const stu = selectedStudentDetail;
                    setSelectedStudentDetail(null);
                    handleOpenCompose(stu, 'fee_reminder');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-card border hover:bg-black/5 cursor-pointer flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>Send Notification</span>
                </button>
                <button
                  onClick={() => setSelectedStudentDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

