import React, { useState, useEffect } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { Mail, Send, X, Sparkles } from 'lucide-react';

export default function ComposeEmailModal() {
  const { 
    isComposeEmailOpen, 
    setIsComposeEmailOpen, 
    composeEmailProps, 
    emailTemplates, 
    settings, 
    sendAutomatedEmail 
  } = useAcademy();

  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl-installment-due');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const targetStudent = composeEmailProps?.student;

  useEffect(() => {
    if (composeEmailProps?.initialTemplateType) {
      const match = emailTemplates.find((t) => t.type === composeEmailProps.initialTemplateType);
      if (match) setSelectedTemplateId(match.id);
    }
  }, [composeEmailProps, emailTemplates]);

  useEffect(() => {
    const currentTemplate = emailTemplates.find((t) => t.id === selectedTemplateId) || emailTemplates[0];
    if (currentTemplate && targetStudent) {
      let s = currentTemplate.subject;
      let b = currentTemplate.body;

      const replacements = {
        '{{student_name}}': targetStudent.name,
        '{{student_id}}': targetStudent.id,
        '{{course_name}}': targetStudent.programTitle,
        '{{amount_due}}': targetStudent.remainingBalance,
        '{{due_date}}': targetStudent.installments?.find((i) => i.status !== 'paid')?.dueDate || 'Immediately',
        '{{installment_month}}': targetStudent.installments?.find((i) => i.status !== 'paid')?.month || '2',
        '{{remaining_balance}}': targetStudent.remainingBalance,
        '{{payment_plan}}': targetStudent.paymentMode === 'full' ? 'Full Tuition' : '3-Month Installments',
        '{{attendance_percentage}}': targetStudent.attendanceStats.percentage,
        '{{total_classes}}': targetStudent.attendanceStats.totalClasses,
        '{{attended_classes}}': targetStudent.attendanceStats.attended,
        '{{receipt_number}}': 'TXN-AUTO',
        '{{amount_paid}}': targetStudent.paidAmount,
        '{{payment_date}}': new Date().toISOString().split('T')[0],
        '{{payment_method}}': 'Direct Settle',
        '{{academy_name}}': settings.name
      };

      Object.entries(replacements).forEach(([key, val]) => {
        s = s.replaceAll(key, String(val ?? ''));
        b = b.replaceAll(key, String(val ?? ''));
      });

      setSubject(s);
      setBody(b);
    }
  }, [selectedTemplateId, targetStudent, emailTemplates, settings]);

  if (!isComposeEmailOpen || !targetStudent) return null;

  const handleSend = (e) => {
    e.preventDefault();
    const tpl = emailTemplates.find((t) => t.id === selectedTemplateId);
    sendAutomatedEmail({
      student: targetStudent,
      template: tpl,
      customSubject: subject,
      customBody: body,
      triggerSource: 'Manual Direct Dispatch'
    });
    setIsComposeEmailOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-7 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Direct Dispatch Email</h2>
              <p className="text-xs opacity-70">Recipient: {targetStudent.name} ({targetStudent.email})</p>
            </div>
          </div>

          <button
            onClick={() => setIsComposeEmailOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector */}
        <div>
          <label className="text-xs font-bold opacity-75 block mb-1">Select Trigger Template</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs glass-input outline-hidden cursor-pointer font-medium"
          >
            {emailTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="space-y-3 text-xs">
          <div>
            <label className="font-bold opacity-75 block mb-1">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input outline-hidden font-semibold"
            />
          </div>

          <div>
            <label className="font-bold opacity-75 block mb-1">Message Body</label>
            <textarea
              rows={9}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3 rounded-xl glass-input outline-hidden font-mono text-[11px] leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsComposeEmailOpen(false)}
              className="px-4 py-2 rounded-xl glass-card border hover:bg-black/5 cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

