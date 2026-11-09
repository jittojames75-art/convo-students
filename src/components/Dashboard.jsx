import React from 'react';
import { useAcademy } from '../context/AcademyContext';
import { 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CalendarCheck, 
  Send, 
  TrendingUp, 
  BookOpen, 
  Briefcase, 
  ArrowUpRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { 
    students, 
    courses, 
    internships, 
    settings, 
    setActiveTab, 
    setIsAdmissionModalOpen,
    bulkSendDueReminders,
    bulkSendAttendanceWarnings,
    emailLogs,
    setSelectedStudentForPayment,
    setSelectedInstallmentIndex,
    setIsPaymentModalOpen
  } = useAcademy();

  // Financial aggregates
  const totalCollected = students.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalReceivables = students.reduce((acc, s) => acc + s.remainingBalance, 0);
  const totalExpectedRevenue = totalCollected + totalReceivables;
  const collectionPercentage = totalExpectedRevenue > 0 
    ? Math.round((totalCollected / totalExpectedRevenue) * 100) 
    : 100;

  // Attendance average
  const totalClassesAttended = students.reduce((acc, s) => acc + (s.attendanceStats?.attended || 0), 0);
  const totalClassesConducted = students.reduce((acc, s) => acc + (s.attendanceStats?.totalClasses || 0), 0);
  const overallAttendancePct = totalClassesConducted > 0 
    ? ((totalClassesAttended / totalClassesConducted) * 100).toFixed(1) 
    : '95.0';

  // Counts
  const courseStudents = students.filter((s) => s.programType === 'course').length;
  const internStudents = students.filter((s) => s.programType === 'internship').length;

  // Overdue and pending installments
  const overdueStudents = students.filter(
    (s) => s.paymentMode === 'installment' && s.installments.some((i) => i.status === 'overdue')
  );

  const lowAttendanceStudents = students.filter((s) => s.attendanceStats.percentage < 75);

  // Month 1, Month 2, Month 3 breakdown
  let m1Paid = 0, m1Total = 0;
  let m2Paid = 0, m2Total = 0;
  let m3Paid = 0, m3Total = 0;

  students.forEach((s) => {
    s.installments?.forEach((inst) => {
      if (inst.month === 1) {
        m1Total += inst.amount;
        if (inst.status === 'paid') m1Paid += inst.amount;
      } else if (inst.month === 2) {
        m2Total += inst.amount;
        if (inst.status === 'paid') m2Paid += inst.amount;
      } else if (inst.month === 3) {
        m3Total += inst.amount;
        if (inst.status === 'paid') m3Paid += inst.amount;
      }
    });
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Header - Slim & Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Operations Overview
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Active Session 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Convosis Technologies Private Limited • Academic & Internship Fee Lifecycle
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAdmissionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>New Admission</span>
          </button>
          <button
            onClick={bulkSendDueReminders}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass-card glass-card-hover border text-slate-700 cursor-pointer"
          >
            <Send className="w-3 h-3 text-cyan-600" />
            <span>Dispatch Due Reminders</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Bar if overdue / low attendance */}
      {(overdueStudents.length > 0 || lowAttendanceStudents.length > 0) && (
        <div className="glass-card rounded-xl p-3 border-l-4 border-l-rose-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-rose-50/40 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold text-rose-900">
              Notice: {overdueStudents.length} Overdue Installments & {lowAttendanceStudents.length} Low Attendance Alerts (&lt;75%)
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {overdueStudents.length > 0 && (
              <button
                onClick={bulkSendDueReminders}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                Send Overdue Notices
              </button>
            )}
            {lowAttendanceStudents.length > 0 && (
              <button
                onClick={bulkSendAttendanceWarnings}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold border border-amber-300 bg-amber-50 text-amber-800 cursor-pointer"
              >
                Warn Attendance
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4 Compact Metric Cards - Screen-Fitting */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* KPI 1 */}
        <div className="glass-card rounded-xl p-3.5 border transition-all hover:border-cyan-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Candidates</span>
            <Users className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{students.length}</span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Active
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{courseStudents} Courses</span>
            <span>{internStudents} Internships</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card rounded-xl p-3.5 border transition-all hover:border-cyan-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">
              {settings.currency}{totalCollected.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
              {collectionPercentage}%
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Target: {settings.currency}{totalExpectedRevenue.toLocaleString()}</span>
            <span className="text-emerald-600 font-medium">Inflow OK</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card rounded-xl p-3.5 border transition-all hover:border-cyan-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Receivables</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-amber-600">
              {settings.currency}{totalReceivables.toLocaleString()}
            </span>
            {overdueStudents.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600">
                {overdueStudents.length} Overdue
              </span>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>3-Month Schedule</span>
            <button onClick={() => setActiveTab('fees')} className="text-cyan-700 font-semibold hover:underline">
              Ledger
            </button>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card rounded-xl p-3.5 border transition-all hover:border-cyan-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{overallAttendancePct}%</span>
            <span className="text-[10px] font-semibold text-cyan-700">Min 75%</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{lowAttendanceStudents.length} under threshold</span>
            <button onClick={() => setActiveTab('attendance')} className="text-cyan-700 font-semibold hover:underline">
              Logs
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid: 3-Month Milestone Progress & Programs Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Cols: 3-Month Installment Pipeline & Deadlines */}
        <div className="lg:col-span-2 glass-card rounded-xl p-4 border space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                3-Month Installment Collection Progress
              </h2>
              <p className="text-[11px] text-slate-500">
                Milestone 1 (Admission) • Milestone 2 (+30d) • Milestone 3 (+60d)
              </p>
            </div>
            <button
              onClick={() => setActiveTab('fees')}
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Manage Fees</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Month 1 Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Month 1 (Admission Settlement)
              </span>
              <span className="text-[11px] text-slate-500">
                {settings.currency}{m1Paid.toLocaleString()} / {settings.currency}{m1Total.toLocaleString()} ({m1Total > 0 ? Math.round((m1Paid / m1Total) * 100) : 100}%)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${m1Total > 0 ? Math.min(100, Math.round((m1Paid / m1Total) * 100)) : 100}%` }}
              />
            </div>
          </div>

          {/* Month 2 Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-600" />
                Month 2 (+30 Days Mid-Term)
              </span>
              <span className="text-[11px] text-slate-500">
                {settings.currency}{m2Paid.toLocaleString()} / {settings.currency}{m2Total.toLocaleString()} ({m2Total > 0 ? Math.round((m2Paid / m2Total) * 100) : 0}%)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-600 rounded-full transition-all"
                style={{ width: `${m2Total > 0 ? Math.min(100, Math.round((m2Paid / m2Total) * 100)) : 0}%` }}
              />
            </div>
          </div>

          {/* Month 3 Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Month 3 (+60 Days Final Clearance)
              </span>
              <span className="text-[11px] text-slate-500">
                {settings.currency}{m3Paid.toLocaleString()} / {settings.currency}{m3Total.toLocaleString()} ({m3Total > 0 ? Math.round((m3Paid / m3Total) * 100) : 0}%)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${m3Total > 0 ? Math.min(100, Math.round((m3Paid / m3Total) * 100)) : 0}%` }}
              />
            </div>
          </div>

          {/* Actionable Deadlines Row */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Upcoming & Overdue Installment Milestones
            </div>
            <div className="space-y-1.5">
              {students
                .filter((s) => s.paymentMode === 'installment' && s.remainingBalance > 0)
                .slice(0, 3)
                .map((student) => {
                  const pendingInst = student.installments.find((i) => i.status !== 'paid');
                  const isOverdue = pendingInst?.status === 'overdue';

                  return (
                    <div
                      key={student.id}
                      className="p-2.5 rounded-lg glass-card flex items-center justify-between border text-xs gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <div className="truncate">
                          <div className="font-bold text-slate-900 truncate">{student.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {student.programTitle} • Month {pendingInst?.month || 2}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <div className="font-bold text-slate-900">{settings.currency}{pendingInst?.amount}</div>
                          <div className={`text-[10px] font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                            {isOverdue ? 'Overdue' : pendingInst?.dueDate}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedStudentForPayment(student);
                            setSelectedInstallmentIndex(student.installments.findIndex((i) => i.id === pendingInst?.id));
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                        >
                          Collect
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

        </div>

        {/* Right Col: Program Matrix */}
        <div className="glass-card rounded-xl p-4 border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Programs & Fees</h2>
            <button
              onClick={() => setActiveTab('courses')}
              className="text-xs text-cyan-700 font-semibold hover:underline"
            >
              All
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-cyan-600" />
              Academic Courses
            </div>
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => setActiveTab('courses')}
                className="p-2 rounded-lg glass-card glass-card-hover border flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="truncate pr-2">
                  <div className="font-bold text-slate-800 truncate">{course.title}</div>
                  <div className="text-[10px] text-slate-500">{course.duration}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-cyan-700">
                    {settings.currency}{course.feeStructure.fullAmount}
                  </div>
                  <div className="text-[9px] text-slate-400">3x {settings.currency}{course.feeStructure.installmentBreakdown[0].amount}</div>
                </div>
              </div>
            ))}

            <div className="pt-1 text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-indigo-600" />
              Live Internships
            </div>
            {internships.map((intern) => (
              <div
                key={intern.id}
                onClick={() => setActiveTab('courses')}
                className="p-2 rounded-lg glass-card glass-card-hover border flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="truncate pr-2">
                  <div className="font-bold text-slate-800 truncate">{intern.title}</div>
                  <div className="text-[10px] text-slate-500">{intern.duration}</div>
                </div>
                <div className="text-right shrink-0 font-bold text-indigo-700">
                  {settings.currency}{intern.feeStructure.fullAmount}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Recent Dispatches - Slim Table */}
      <div className="glass-card rounded-xl p-4 border space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Email Automation Log</h2>
            <span className="text-[10px] text-slate-500">Receipts & Due Alerts</span>
          </div>
          <button
            onClick={() => setActiveTab('email_automation')}
            className="text-xs font-semibold text-cyan-700 hover:underline flex items-center gap-0.5"
          >
            <span>Automation Center</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold text-[11px]">
                <th className="pb-2 pl-1">Candidate</th>
                <th className="pb-2">Subject</th>
                <th className="pb-2">Trigger Event</th>
                <th className="pb-2">Timestamp</th>
                <th className="pb-2 text-right pr-1">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emailLogs.slice(0, 4).map((log) => (
                <tr key={log.id} className="hover:bg-cyan-50/40 transition-colors">
                  <td className="py-2 pl-1">
                    <span className="font-bold text-slate-900">{log.studentName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{log.email}</span>
                  </td>
                  <td className="py-2 max-w-xs truncate text-slate-700 font-medium">{log.subject}</td>
                  <td className="py-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-100">
                      {log.trigger}
                    </span>
                  </td>
                  <td className="py-2 text-[10px] font-mono text-slate-500">{log.timestamp}</td>
                  <td className="py-2 text-right pr-1">
                    <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
