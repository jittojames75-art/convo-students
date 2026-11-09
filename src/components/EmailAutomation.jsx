import React, { useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { 
  Mail, 
  Send, 
  Sparkles, 
  Settings2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertCircle, 
  Play, 
  Edit3, 
  Eye,
  Check,
  ChevronRight
} from 'lucide-react';

export default function EmailAutomation() {
  const { 
    emailTemplates, 
    setEmailTemplates, 
    emailLogs, 
    students, 
    settings,
    sendAutomatedEmail, 
    bulkSendDueReminders, 
    bulkSendAttendanceWarnings,
    addToast 
  } = useAcademy();

  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editedSubject, setEditedSubject] = useState(emailTemplates[0].subject);
  const [editedBody, setEditedBody] = useState(emailTemplates[0].body);
  const [previewStudent, setPreviewStudent] = useState(students[0] || null);

  // Automation rule toggles
  const [automationRules, setAutomationRules] = useState([
    { id: 'rule-welcome', name: 'Auto-Send Welcome Kit on New Enrollment', enabled: true, desc: 'Instantly dispatches onboarding kit and LMS credentials.' },
    { id: 'rule-due', name: 'Auto-Send 3-Day Notice Before Installment Due', enabled: true, desc: 'Notifies student 72 hours before Month 2/3 installment due date.' },
    { id: 'rule-overdue', name: 'Auto-Send Overdue Notice on Grace Period Expiry', enabled: true, desc: 'Dispatches high-urgency fee alert if payment is overdue.' },
    { id: 'rule-receipt', name: 'Auto-Send Tax Compliant Invoice Receipt on Payment', enabled: true, desc: 'Generates and emails PDF receipt upon settlement.' },
    { id: 'rule-attendance', name: 'Auto-Send Academic Warning When Attendance < 75%', enabled: true, desc: 'Flags at-risk students automatically each Friday.' }
  ]);

  const toggleRule = (ruleId) => {
    setAutomationRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
    addToast('Automation trigger rule updated', 'info');
  };

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setEditedSubject(tpl.subject);
    setEditedBody(tpl.body);
    setIsEditingTemplate(false);
  };

  const handleSaveTemplate = () => {
    setEmailTemplates((prev) =>
      prev.map((t) => (t.id === selectedTemplate.id ? { ...t, subject: editedSubject, body: editedBody } : t))
    );
    setSelectedTemplate({ ...selectedTemplate, subject: editedSubject, body: editedBody });
    setIsEditingTemplate(false);
    addToast('Email template saved successfully!', 'success');
  };

  // Render simulated email preview with dynamic variable replacements
  const getRenderedPreview = () => {
    if (!previewStudent) return { subject: '', body: '' };

    let s = editedSubject;
    let b = editedBody;

    const replacements = {
      '{{student_name}}': previewStudent.name,
      '{{student_id}}': previewStudent.id,
      '{{course_name}}': previewStudent.programTitle,
      '{{amount_due}}': previewStudent.remainingBalance,
      '{{due_date}}': previewStudent.installments?.find((i) => i.status !== 'paid')?.dueDate || '2026-11-15',
      '{{installment_month}}': previewStudent.installments?.find((i) => i.status !== 'paid')?.month || '2',
      '{{remaining_balance}}': previewStudent.remainingBalance,
      '{{payment_plan}}': previewStudent.paymentMode === 'full' ? 'Full Tuition' : '3-Month Installments',
      '{{attendance_percentage}}': previewStudent.attendanceStats.percentage,
      '{{total_classes}}': previewStudent.attendanceStats.totalClasses,
      '{{attended_classes}}': previewStudent.attendanceStats.attended,
      '{{receipt_number}}': 'TXN-99824',
      '{{amount_paid}}': 600,
      '{{payment_date}}': new Date().toISOString().split('T')[0],
      '{{payment_method}}': 'Stripe Card',
      '{{academy_name}}': settings.name
    };

    Object.entries(replacements).forEach(([key, val]) => {
      s = s.replaceAll(key, String(val ?? ''));
      b = b.replaceAll(key, String(val ?? ''));
    });

    return { subject: s, body: b };
  };

  const rendered = getRenderedPreview();

  const handleSendTest = () => {
    if (!previewStudent) return;
    sendAutomatedEmail({
      student: previewStudent,
      template: selectedTemplate,
      customSubject: editedSubject,
      customBody: editedBody,
      triggerSource: 'Simulated Manual Trigger'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Email Automation Hub</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 border border-blue-500/30">
              Active SMTP Gateway
            </span>
          </div>
          <p className="text-xs sm:text-sm opacity-70 mt-1">
            Automated event triggers for Fee Installments, Admission Onboarding, Payment Receipts, and Low Attendance Warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={bulkSendDueReminders}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold glass-card glass-card-hover border cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-blue-500" />
            <span>Dispatch Pending Dues</span>
          </button>
        </div>
      </div>

      {/* Automation Trigger Rules (Toggles) */}
      <div className="glass-card rounded-xl p-3.5 border space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Active Automated Event Triggers</span>
          </h2>
          <span className="text-[10px] text-slate-400">Runs 24/7 on trigger conditions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {automationRules.map((rule) => (
            <div
              key={rule.id}
              onClick={() => toggleRule(rule.id)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                rule.enabled
                  ? 'bg-cyan-50/60 border-cyan-200'
                  : 'bg-slate-50 opacity-50 border-slate-200'
              }`}
            >
              <div>
                <div className="font-semibold text-xs text-slate-900">{rule.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{rule.desc}</div>
              </div>

              {/* Toggle switch */}
              <div className={`w-7 h-4 rounded-full p-0.5 transition-colors shrink-0 ${
                rule.enabled ? 'bg-cyan-600' : 'bg-slate-300'
              }`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                  rule.enabled ? 'translate-x-3' : 'translate-x-0'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Manager & Live Glass Mail Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Left Column: Template List (4 cols) */}
        <div className="lg:col-span-4 glass-card rounded-xl p-3.5 border space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Trigger Templates ({emailTemplates.length})
            </h3>
          </div>

          <div className="space-y-1.5">
            {emailTemplates.map((tpl) => {
              const isSelected = tpl.id === selectedTemplate.id;

              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-50 border-cyan-300 font-bold text-cyan-900 shadow-xs'
                      : 'hover:bg-slate-50 border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{tpl.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </div>
                  <div className="text-[10px] opacity-60 font-normal mt-0.5 truncate">
                    {tpl.subject}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Tags Cheat-sheet */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <div className="text-[9px] font-bold uppercase text-slate-400">Dynamic Merge Tags</div>
            <div className="flex flex-wrap gap-1 text-[9px] font-mono text-slate-600">
              <span className="px-1.5 py-0.5 rounded bg-slate-100">{'{{student_name}}'}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100">{'{{course_name}}'}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100">{'{{amount_due}}'}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100">{'{{due_date}}'}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100">{'{{receipt_number}}'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Template Editor & Live Glass Mail Client (8 cols) */}
        <div className="lg:col-span-8 glass-card rounded-xl p-4 border space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">{selectedTemplate.name}</h3>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                  {selectedTemplate.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.2">{selectedTemplate.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingTemplate(!isEditingTemplate)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold glass-card border hover:bg-slate-50 cursor-pointer flex items-center gap-1 text-slate-700"
              >
                <Edit3 className="w-3 h-3 text-cyan-600" />
                <span>{isEditingTemplate ? 'Cancel' : 'Edit'}</span>
              </button>

              {isEditingTemplate ? (
                <button
                  onClick={handleSaveTemplate}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Save</span>
                </button>
              ) : (
                <button
                  onClick={handleSendTest}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Test Send</span>
                </button>
              )}
            </div>
          </div>

          {/* Test Student Selector */}
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="opacity-70 font-medium">Previewing with student context:</span>
            <select
              value={previewStudent?.id || ''}
              onChange={(e) => {
                const found = students.find((s) => s.id === e.target.value);
                if (found) setPreviewStudent(found);
              }}
              className="px-2.5 py-1 rounded-lg glass-input font-medium outline-hidden"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.programTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Edit Mode Inputs */}
          {isEditingTemplate ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase opacity-70 block mb-1">Subject Line</label>
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase opacity-70 block mb-1">Email Body Content</label>
                <textarea
                  rows={10}
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs font-mono glass-input outline-hidden"
                />
              </div>
            </div>
          ) : (
            /* Frosted Glass Email Window */
            <div className="rounded-2xl border border-white/60 dark:border-white/10 overflow-hidden shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
              {/* Mail Window Header */}
              <div className="px-4 py-2.5 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="window-dot window-dot-red" />
                  <span className="window-dot window-dot-yellow" />
                  <span className="window-dot window-dot-green" />
                  <span className="ml-2 font-semibold opacity-70">Mail Dispatch Preview</span>
                </div>
                <span className="text-[10px] font-mono opacity-50">CONVOSIS Dispatch Engine</span>
              </div>

              {/* Email Envelope Meta */}
              <div className="p-4 border-b border-black/5 dark:border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="opacity-50 w-16">To:</span>
                  <span className="font-semibold text-blue-600">{previewStudent?.name} &lt;{previewStudent?.email}&gt;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="opacity-50 w-16">From:</span>
                  <span className="font-medium">{settings.name} &lt;{settings.email}&gt;</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                  <span className="opacity-50 w-16">Subject:</span>
                  <span className="font-bold text-sm">{rendered.subject}</span>
                </div>
              </div>

              {/* Email Body Content */}
              <div className="p-6 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed opacity-90 font-sans">
                {rendered.body}
              </div>

              {/* Mail Footer */}
              <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] opacity-60">
                <span>Certified by {settings.name} Security Services</span>
                <span>TLS 1.3 Encrypted</span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Dispatched Automation History Log Table */}
      <div className="glass-card rounded-2xl p-6 border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Complete Automated Dispatch Activity Log</span>
          </h3>
          <span className="text-xs opacity-60">{emailLogs.length} total logged events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 opacity-70 font-semibold">
                <th className="pb-3 pl-2">Student</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Trigger Source</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {emailLogs.map((log) => (
                <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-2.5 pl-2">
                    <div className="font-bold">{log.studentName}</div>
                    <div className="text-[10px] opacity-60 font-mono">{log.email}</div>
                  </td>
                  <td className="py-2.5 max-w-sm truncate font-medium">
                    {log.subject}
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      {log.trigger}
                    </span>
                  </td>
                  <td className="py-2.5 opacity-70 font-mono text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 text-right pr-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
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

