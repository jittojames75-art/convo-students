import React, { useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { 
  FileText, 
  Printer, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Building2, 
  ArrowUpRight,
  ShieldCheck,
  Eye,
  CreditCard,
  SlidersHorizontal
} from 'lucide-react';

export default function InvoicesManager() {
  const { 
    students, 
    settings, 
    organization,
    openInvoice, 
    openFeeAdjustment,
    setIsInvoiceModalOpen,
    setActiveInvoiceData 
  } = useAcademy();

  const [filterType, setFilterType] = useState('all'); // 'all', 'retainer', 'tax'
  const [searchTerm, setSearchTerm] = useState('');

  // Generate blank template
  const handleOpenBlankTemplate = (type = 'retainer') => {
    setActiveInvoiceData({
      invoiceNumber: 'CONV/26-27/___',
      invoiceType: type,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      studentName: '',
      address: '',
      phone: '',
      email: '',
      programTitle: '',
      programType: type === 'retainer' ? 'internship' : 'course',
      baseFee: 30000,
      gstPercent: 18,
      gstAmount: 5400,
      totalFee: 35400,
      paidAmount: 0,
      balanceDue: 35400,
      paymentMethod: '',
      upiId: ''
    });
    setIsInvoiceModalOpen(true);
  };

  // Sample student list or active students
  const filteredStudents = students.filter(student => {
    const isRetainer = student.programType === 'internship';
    if (filterType === 'retainer' && !isRetainer) return false;
    if (filterType === 'tax' && isRetainer) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        student.name.toLowerCase().includes(q) ||
        student.id.toLowerCase().includes(q) ||
        student.programTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Top Banner / Summary */}
      <div className="glass-card rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0a2540] to-[#1d63b8] text-white flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                Invoices & Retainers Management
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#14539a] border border-blue-200">
                Official Convosis Formats
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate, edit, and print official Retainer Invoices and GST Tax Invoices matching company compliance.
            </p>
          </div>
        </div>

        {/* Action Buttons: Blank Templates */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenBlankTemplate('retainer')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#14539a] hover:bg-[#0f4077] text-white shadow-xs cursor-pointer transition-all"
            title="Open printable blank Retainer Invoice template with underline fields"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Blank Retainer Template</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenBlankTemplate('tax')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 cursor-pointer transition-all"
            title="Open printable blank Tax Invoice template"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Blank Tax Template</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-xl p-3 border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/90">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              filterType === 'all' 
                ? 'bg-white text-[#14539a] shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Candidates ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('retainer')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              filterType === 'retainer' 
                ? 'bg-white text-[#14539a] shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Retainer Invoices ({students.filter(s => s.programType === 'internship').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('tax')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              filterType === 'tax' 
                ? 'bg-white text-[#14539a] shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tax Invoices ({students.filter(s => s.programType !== 'internship').length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate or program..."
            className="pl-8 pr-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden w-full sm:w-64"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="glass-card rounded-xl border border-slate-200 overflow-hidden bg-white/95">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a2540] text-white font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Candidate / Intern</th>
                <th className="py-3 px-3">Invoice Type</th>
                <th className="py-3 px-3">Role / Programme</th>
                <th className="py-3 px-3">Total Value</th>
                <th className="py-3 px-3">Received to Date</th>
                <th className="py-3 px-3">Balance Due</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-xs text-slate-600">No candidates found for invoices</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Admit a student or click "Blank Retainer Template" to generate a blank invoice.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isRetainer = student.programType === 'internship';
                  const docType = isRetainer ? 'retainer' : 'tax';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {student.id} • {student.phone || student.email}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isRetainer
                            ? 'bg-blue-50 text-[#14539a] border border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isRetainer ? 'Retainer Invoice' : 'Tax Invoice'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-700">
                        {student.programTitle}
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                        ₹{Number(student.totalFee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">
                        ₹{Number(student.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 font-mono text-amber-700 font-bold">
                        ₹{Number(student.remainingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openFeeAdjustment(student)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-xs cursor-pointer transition-all"
                            title="Adjust fees, apply concession or modify target due"
                          >
                            <SlidersHorizontal className="w-3 h-3 text-cyan-600" />
                            <span>Adjust Fee</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openInvoice(student, docType)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#14539a] hover:bg-[#0f4077] text-white shadow-xs cursor-pointer transition-all"
                            title="Open official Convosis Invoice"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View {isRetainer ? 'Retainer' : 'Invoice'}</span>
                          </button>
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

    </div>
  );
}

