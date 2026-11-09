import React, { useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { 
  CalendarCheck, 
  Calendar as CalendarIcon, 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  Send, 
  Users, 
  BookOpen, 
  Briefcase,
  CheckCircle2
} from 'lucide-react';

export default function AttendanceTracker() {
  const { 
    students, 
    courses, 
    internships, 
    dualPrograms,
    attendanceRecords, 
    markAttendance, 
    bulkMarkBatchAttendance,
    bulkSendAttendanceWarnings,
    setIsComposeEmailOpen,
    setComposeEmailProps,
    addToast
  } = useAcademy();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedProgramId, setSelectedProgramId] = useState('all');

  const allPrograms = [
    ...courses.map((c) => ({ id: c.id, title: c.title, type: 'Course' })),
    ...internships.map((i) => ({ id: i.id, title: `${i.title} Internship`, type: 'Internship' })),
    ...(dualPrograms || []).map((d) => ({ id: d.id, title: `${d.title} (Dual Track)`, type: 'Course + Internship' }))
  ];

  // Filter students by selected program
  const activeStudents = selectedProgramId === 'all'
    ? students
    : students.filter((s) => s.programId === selectedProgramId);

  // Helper to get status of student on selected date
  const getStudentStatusOnDate = (studentId) => {
    const record = attendanceRecords.find((r) => r.date === selectedDate && r.studentId === studentId);
    return record ? record.status : 'unmarked';
  };

  const handleStatusChange = (student, status) => {
    markAttendance(selectedDate, student.id, student.programId, status);
  };

  const lowAttendanceStudents = students.filter((s) => s.attendanceStats.percentage < 75);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Academic Attendance System</h1>
          <p className="text-xs sm:text-sm opacity-70 mt-1">
            Log daily session participation, track attendance percentages, and automate warnings for rates below 75%.
          </p>
        </div>

        {lowAttendanceStudents.length > 0 && (
          <button
            onClick={bulkSendAttendanceWarnings}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Send Warning to {lowAttendanceStudents.length} Students (&lt;75%)</span>
          </button>
        )}
      </div>

      {/* Date & Batch Filter Toolbar */}
      <div className="glass-card rounded-2xl p-4 border flex flex-wrap items-center justify-between gap-4 text-xs">
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl glass-input font-medium outline-hidden cursor-pointer"
            />
          </div>

          {/* Program / Batch Selector */}
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="px-3 py-1.5 rounded-xl glass-input font-medium outline-hidden cursor-pointer"
          >
            <option value="all">All Batches & Programs ({students.length} students)</option>
            {allPrograms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.type}: {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Bulk Actions for this Date */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (selectedProgramId === 'all') {
                students.forEach((s) => markAttendance(selectedDate, s.id, s.programId, 'present'));
                addToast(`Marked all ${students.length} students as Present for ${selectedDate}`, 'success');
              } else {
                bulkMarkBatchAttendance(selectedDate, selectedProgramId, 'present');
              }
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={() => {
              if (selectedProgramId === 'all') {
                students.forEach((s) => markAttendance(selectedDate, s.id, s.programId, 'absent'));
                addToast(`Marked all ${students.length} students as Absent for ${selectedDate}`, 'info');
              } else {
                bulkMarkBatchAttendance(selectedDate, selectedProgramId, 'absent');
              }
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-card glass-card-hover border text-rose-600 cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Mark All Absent</span>
          </button>
        </div>

      </div>

      {/* Attendance Logging Table - Compact */}
      <div className="glass-card rounded-xl border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 pl-3">Candidate</th>
                <th className="py-2.5">Program</th>
                <th className="py-2.5 text-center">Cumulative Rate</th>
                <th className="py-2.5 text-center">Status for {selectedDate}</th>
                <th className="py-2.5 text-right pr-3">Notice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No candidates found in this batch.
                  </td>
                </tr>
              ) : (
                activeStudents.map((student) => {
                  const currentStatus = getStudentStatusOnDate(student.id);
                  const isLow = student.attendanceStats.percentage < 75;

                  return (
                    <tr key={student.id} className="hover:bg-cyan-50/40 transition-colors">
                      {/* Student Info */}
                      <td className="py-2 pl-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs leading-tight">{student.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{student.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Program */}
                      <td className="py-2">
                        <div className="font-medium text-slate-800">{student.programTitle}</div>
                        <div className="text-[9px] text-slate-400">
                          {student.programType === 'course' ? 'Academic Course' : 'Live Internship'}
                        </div>
                      </td>

                      {/* Cumulative Attendance */}
                      <td className="py-2 text-center">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isLow
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {student.attendanceStats.percentage}%
                        </span>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {student.attendanceStats.attended}/{student.attendanceStats.totalClasses}
                        </div>
                      </td>

                      {/* Quick Attendance Selector for Today */}
                      <td className="py-2 text-center">
                        <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg glass-card border">
                          <button
                            onClick={() => handleStatusChange(student, 'present')}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-500 hover:bg-emerald-50'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleStatusChange(student, 'absent')}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-500 hover:bg-rose-50'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleStatusChange(student, 'late')}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              currentStatus === 'late'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-500 hover:bg-amber-50'
                            }`}
                          >
                            Late
                          </button>
                        </div>
                      </td>

                      {/* Notification Action */}
                      <td className="py-2 pr-3 text-right">
                        {isLow ? (
                          <button
                            onClick={() => {
                              setComposeEmailProps({
                                student,
                                initialTemplateType: 'attendance_alert'
                              });
                              setIsComposeEmailOpen(true);
                            }}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Warn</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Good
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

