import React, { useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { 
  BookOpen, 
  Briefcase, 
  Clock, 
  Users, 
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle2,
  ListPlus,
  X,
  Check,
  Percent,
  CreditCard,
  RotateCcw,
  PlusCircle,
  FileText
} from 'lucide-react';

export default function CoursesInternships() {
  const { 
    courses, 
    internships, 
    dualPrograms,
    allPrograms,
    settings, 
    setIsAdmissionModalOpen,
    createProgram,
    deleteProgram,
    updateProgramFees,
    addModuleToProgram,
    updateModuleInProgram,
    deleteModuleFromProgram,
    addSubmoduleToModule,
    updateSubmoduleInModule,
    deleteSubmoduleFromModule,
    loadOfficialConvosisTemplates,
    clearAllPrograms,
    isAdminOrSuperAdmin,
    addToast
  } = useAcademy();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'courses' | 'internships' | 'dual'
  const [selectedProgramModal, setSelectedProgramModal] = useState(null);
  
  // Customization modal states
  const [expandedModuleIdx, setExpandedModuleIdx] = useState(0);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleData, setNewModuleData] = useState({ 
    module: 'Module 1', 
    title: '', 
    weeks: 'Weeks 1-4' 
  });
  const [newSubmoduleTitle, setNewSubmoduleTitle] = useState('');
  const [newSubmoduleHours, setNewSubmoduleHours] = useState('6 Hours');

  // Inline editing state for module
  const [editingModuleIdx, setEditingModuleIdx] = useState(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [editModuleWeeks, setEditModuleWeeks] = useState('');

  // Inline editing state for sub-module topic
  const [editingSubmoduleKey, setEditingSubmoduleKey] = useState(null); // 'modIdx-subIdx'
  const [editSubmoduleTitle, setEditSubmoduleTitle] = useState('');
  const [editSubmoduleHours, setEditSubmoduleHours] = useState('');

  // Create Program Modal state
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const [newProgramForm, setNewProgramForm] = useState({
    title: '',
    type: 'course', // 'course', 'internship', or 'dual'
    category: 'Data Science & AI',
    duration: '4 Months',
    totalHours: '200+ Hours',
    baseFee: 15000,
    gstPercent: 18,
    installmentMonths: 3,
    instructorName: '',
    description: '',
    badge: 'Popular'
  });

  // Edit Fees & GST Modal state
  const [editingFeeProgram, setEditingFeeProgram] = useState(null);
  const [feeForm, setFeeForm] = useState({
    baseFee: 15000,
    gstPercent: 18,
    installmentMonths: 3
  });

  const displayList = [
    ...(filterType === 'all' || filterType === 'courses' ? courses : []),
    ...(filterType === 'all' || filterType === 'internships' ? internships : []),
    ...(filterType === 'all' || filterType === 'dual' ? (dualPrograms || []) : [])
  ];

  // Refresh current open program modal from context
  const currentProgram = selectedProgramModal 
    ? [...courses, ...internships, ...(dualPrograms || [])].find((p) => p.id === selectedProgramModal.id) || selectedProgramModal
    : null;

  // Handle Create Program Form Submit
  const handleCreateProgramSubmit = async (e) => {
    e.preventDefault();
    if (!newProgramForm.title.trim()) {
      addToast('Please enter a program title', 'error');
      return;
    }

    const bFee = Number(newProgramForm.baseFee) || 15000;
    const gPct = Number(newProgramForm.gstPercent) || 18;
    const gAmt = Math.round(bFee * (gPct / 100));
    const total = bFee + gAmt;

    await createProgram({
      ...newProgramForm,
      baseFee: bFee,
      gstPercent: gPct,
      gstAmount: gAmt,
      fullAmount: total,
      installmentMonths: Number(newProgramForm.installmentMonths) || 3,
      instructor: {
        name: newProgramForm.instructorName || 'Convosis Faculty Team',
        role: newProgramForm.type === 'internship' ? 'Industry Mentor' : 'Lead Instructor'
      }
    });

    setIsCreateProgramOpen(false);
    setNewProgramForm({
      title: '',
      type: 'course',
      category: 'Data Science & AI',
      duration: '4 Months',
      totalHours: '200+ Hours',
      baseFee: 15000,
      gstPercent: 18,
      installmentMonths: 3,
      instructorName: '',
      description: '',
      badge: 'Popular'
    });
  };

  // Open Edit Fees Modal
  const handleOpenFeeEditor = (item) => {
    const bFee = item.baseFee || item.feeStructure?.baseFee || 15000;
    const gPct = item.gstPercent || item.feeStructure?.gstPercent || 18;
    const months = item.installmentMonths || item.feeStructure?.installmentMonths || 3;
    setEditingFeeProgram(item);
    setFeeForm({
      baseFee: bFee,
      gstPercent: gPct,
      installmentMonths: months
    });
  };

  const handleSaveProgramFees = (e) => {
    e.preventDefault();
    if (!editingFeeProgram) return;
    updateProgramFees(editingFeeProgram.id, feeForm);
    setEditingFeeProgram(null);
  };

  // Create Module
  const handleCreateModule = (e) => {
    e.preventDefault();
    if (!newModuleData.title.trim()) return;

    const moduleNum = (currentProgram.syllabus?.length || 0) + 1;
    addModuleToProgram(currentProgram.id, {
      module: newModuleData.module || `Module ${moduleNum}`,
      title: newModuleData.title.trim(),
      weeks: newModuleData.weeks || 'Weeks 1-4',
      submodules: [
        { 
          id: `sub-${Date.now()}-1`, 
          title: 'Foundations & Architectural Overview', 
          hours: '4 Hours',
          labs: 'Core lab setup' 
        }
      ]
    });

    setNewModuleData({ 
      module: `Module ${moduleNum + 1}`, 
      title: '', 
      weeks: 'Weeks 1-4' 
    });
    setIsAddingModule(false);
  };

  // Save Module Edit
  const handleSaveModuleEdit = (modIdx) => {
    if (!editModuleTitle.trim()) return;
    updateModuleInProgram(currentProgram.id, modIdx, {
      title: editModuleTitle.trim(),
      weeks: editModuleWeeks.trim()
    });
    setEditingModuleIdx(null);
  };

  // Create Sub-module
  const handleCreateSubmodule = (moduleIdx) => {
    if (!newSubmoduleTitle.trim()) return;

    addSubmoduleToModule(currentProgram.id, moduleIdx, {
      id: `sub-${Date.now()}`,
      title: newSubmoduleTitle.trim(),
      hours: newSubmoduleHours || '4 Hours'
    });

    setNewSubmoduleTitle('');
  };

  // Save Sub-module Edit
  const handleSaveSubmoduleEdit = (modIdx, subIdx) => {
    if (!editSubmoduleTitle.trim()) return;
    updateSubmoduleInModule(currentProgram.id, modIdx, subIdx, {
      title: editSubmoduleTitle.trim(),
      hours: editSubmoduleHours.trim()
    });
    setEditingSubmoduleKey(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Header and Filter segmented buttons - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Curriculum & Programs</span>
            <span className="text-[11px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
              ₹15,000 + 18% GST (3x ₹5,900)
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Convosis Technologies Private Limited • Courses, Internships & Fully Customizable Modules
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdminOrSuperAdmin && (
            <>
              <button
                onClick={() => setIsCreateProgramOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Program</span>
              </button>

              <button
                onClick={loadOfficialConvosisTemplates}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer transition-all"
                title="Initialize standard 3 Courses & 4 Internships (₹15,000 + 18% GST = ₹17,700)"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Load Official Templates</span>
              </button>

              {(courses.length > 0 || internships.length > 0 || (dualPrograms && dualPrograms.length > 0)) && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to remove all courses, internships, and dual tracks? This provides a clean zero-data state.')) {
                      clearAllPrograms();
                    }
                  }}
                  className="p-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-all"
                  title="Remove all courses & internships (Clean state)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}

          {/* Filter Segmented Control */}
          <div className="glass-card rounded-lg p-0.5 flex items-center border text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({courses.length + internships.length + (dualPrograms?.length || 0)})
            </button>
            <button
              onClick={() => setFilterType('courses')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'courses'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              Courses ({courses.length})
            </button>
            <button
              onClick={() => setFilterType('internships')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'internships'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              Internships ({internships.length})
            </button>
            <button
              onClick={() => setFilterType('dual')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'dual'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Course + Internship ({dualPrograms?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Program Cards Grid - Compact & Fit-Screen */}
      {displayList.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 border border-slate-200 text-center max-w-lg mx-auto my-8 bg-white/95 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto border border-cyan-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800">
            No Programs or Offerings Published (Clean Slate)
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            All pre-filled sample courses and internships have been removed as requested. As an administrator, you have full access to add custom courses, internships, and configure fees (Base ₹15,000 + 18% GST).
          </p>

          {isAdminOrSuperAdmin && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsCreateProgramOpen(true)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom Program</span>
              </button>

              <button
                onClick={loadOfficialConvosisTemplates}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Load Official Templates (₹15,000 + 18% GST)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayList.map((item) => {
            const isDual = item.type === 'dual' || item.type === 'course_internship';
            const isCourse = item.type === 'course';
            const modulesCount = item.syllabus?.length || 0;
            const submodulesCount = item.syllabus?.reduce((acc, m) => acc + (m.submodules?.length || 0), 0) || 0;
            
            const baseFee = item.baseFee || item.feeStructure?.baseFee || (isDual ? 30000 : 15000);
            const gstPercent = item.gstPercent || item.feeStructure?.gstPercent || 18;
            const gstAmount = item.gstAmount || item.feeStructure?.gstAmount || Math.round(baseFee * (gstPercent / 100));
            const fullAmount = item.fullAmount || item.feeStructure?.fullAmount || (baseFee + gstAmount);
            const months = item.installmentMonths || item.feeStructure?.installmentMonths || 3;
            const monthlyAmt = item.installmentAmount || item.feeStructure?.monthlyInstallment || Math.round(fullAmount / months);

            return (
              <div
                key={item.id}
                className={`glass-card rounded-xl p-3.5 border flex flex-col justify-between transition-all duration-150 hover:shadow-xs relative group text-xs bg-white/90 ${
                  isDual ? 'border-purple-200/90 hover:border-purple-400' : 'hover:border-cyan-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider border ${
                      isDual
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : isCourse
                          ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}>
                      {isDual ? 'Course + Internship' : (isCourse ? 'Academic Course' : 'Live Internship')}
                    </span>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isDual ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Sparkles className={`w-2.5 h-2.5 ${isDual ? 'text-purple-600' : 'text-amber-500'}`} />
                      {item.badge || (isDual ? 'Dual Track' : 'Popular')}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 group-hover:text-cyan-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.description || 'Comprehensive industry curriculum with lab assignments and milestone tracking.'}
                  </p>

                  {/* Modules & Submodules badge */}
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-medium text-cyan-800">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-100 font-bold">
                      {modulesCount} Modules
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {submodulesCount > 0 ? `${submodulesCount} Sub-topics` : 'Practical Topics'}
                    </span>
                  </div>

                  {/* Duration & Key stats */}
                  <div className="mt-2.5 py-1.5 border-y border-slate-100 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-600" />
                      <span>{item.duration || '4 Months'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-indigo-600" />
                      <span>{item.enrolledCount ? `${item.enrolledCount} Enrolled` : 'Seats Open'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Fee & 3-Month Installment Structure */}
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-200/60 mb-2 space-y-1">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-[10px] text-slate-500">
                        Base Fee: <strong className="text-slate-800">₹{baseFee.toLocaleString()}</strong> + {gstPercent}% GST (₹{gstAmount.toLocaleString()})
                      </span>
                      <span className="text-xs font-extrabold text-cyan-800">
                        Total: ₹{fullAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-emerald-700">
                      <span>3-Month Milestone Plan:</span>
                      <span className="font-bold">{months}x ₹{monthlyAmt.toLocaleString()} / mo</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setSelectedProgramModal(item);
                        setExpandedModuleIdx(0);
                      }}
                      className="flex-1 py-1 px-2 rounded-lg text-xs font-semibold glass-card glass-card-hover border text-slate-700 transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Layers className="w-3 h-3 text-cyan-600" />
                      <span>Modules ({modulesCount})</span>
                    </button>

                    {isAdminOrSuperAdmin && (
                      <button
                        onClick={() => handleOpenFeeEditor(item)}
                        className="p-1 rounded-lg text-xs font-semibold text-cyan-700 hover:bg-cyan-50 border border-cyan-200 cursor-pointer transition-all"
                        title="Edit Base Fee, GST % & Installment Schedule"
                      >
                        <Percent className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isAdminOrSuperAdmin && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                            deleteProgram(item.id);
                          }
                        }}
                        className="p-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-all"
                        title="Delete Program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => setIsAdmissionModalOpen(true)}
                      className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-all text-center cursor-pointer"
                    >
                      Enroll
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* FULLY CUSTOMIZABLE MODULES & SUB-MODULES MODAL */}
      {currentProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="glass-card rounded-2xl max-w-2xl w-full p-4 sm:p-6 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto bg-white">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {currentProgram.type === 'course' ? 'Academic Course Curriculum' : 'Internship Sprints'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentProgram.duration || '4 Months'} • ₹{(currentProgram.baseFee || 15000).toLocaleString()} + {currentProgram.gstPercent || 18}% GST
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{currentProgram.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{currentProgram.description}</p>
              </div>

              <button
                onClick={() => setSelectedProgramModal(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modules Header & Add Module Trigger */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Modules & Sub-Modules Customization</span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Full control: Add, edit, or remove modules and topic sub-modules
                </p>
              </div>

              {isAdminOrSuperAdmin && (
                <button
                  onClick={() => setIsAddingModule(!isAddingModule)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingModule ? 'Cancel' : 'Add New Module'}</span>
                </button>
              )}
            </div>

            {/* Inline Add Module Form */}
            {isAddingModule && (
              <form onSubmit={handleCreateModule} className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/50 space-y-2.5 text-xs">
                <div className="font-bold text-cyan-900 text-xs flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-cyan-600" />
                  <span>New Module Configuration</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Module Code</label>
                    <input
                      type="text"
                      placeholder="e.g. Module 1"
                      value={newModuleData.module}
                      onChange={(e) => setNewModuleData({ ...newModuleData, module: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Module Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Advanced Deep Learning & Generative Models"
                      value={newModuleData.title}
                      onChange={(e) => setNewModuleData({ ...newModuleData, title: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <input
                      type="text"
                      placeholder="Timeline (e.g. Weeks 1-4)"
                      value={newModuleData.weeks}
                      onChange={(e) => setNewModuleData({ ...newModuleData, weeks: e.target.value })}
                      className="px-2.5 py-1 rounded-lg glass-input text-xs w-44"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save Module</span>
                  </button>
                </div>
              </form>
            )}

            {/* Modules List with Sub-modules Accordion */}
            <div className="space-y-2.5">
              {(!currentProgram.syllabus || currentProgram.syllabus.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl space-y-2">
                  <p>No modules created for this program yet.</p>
                  {isAdminOrSuperAdmin && (
                    <button
                      onClick={() => setIsAddingModule(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Module</span>
                    </button>
                  )}
                </div>
              ) : (
                currentProgram.syllabus.map((mod, modIdx) => {
                  const isExpanded = expandedModuleIdx === modIdx;
                  const submodules = mod.submodules || [];
                  const isEditingThisModule = editingModuleIdx === modIdx;

                  return (
                    <div
                      key={modIdx}
                      className={`rounded-xl border transition-all text-xs ${
                        isExpanded
                          ? 'border-cyan-300 bg-cyan-50/20 shadow-xs'
                          : 'border-slate-200/80 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {/* Module Header Bar */}
                      <div className="p-3 flex items-center justify-between select-none">
                        <div 
                          onClick={() => setExpandedModuleIdx(isExpanded ? null : modIdx)}
                          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                        >
                          <span className="w-6 h-6 rounded-md bg-cyan-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                            {modIdx + 1}
                          </span>
                          
                          {isEditingThisModule ? (
                            <div className="flex items-center gap-1.5 flex-1 pr-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editModuleTitle}
                                onChange={(e) => setEditModuleTitle(e.target.value)}
                                className="px-2 py-1 rounded border border-cyan-400 text-xs font-bold w-full"
                              />
                              <input
                                type="text"
                                value={editModuleWeeks}
                                onChange={(e) => setEditModuleWeeks(e.target.value)}
                                className="px-2 py-1 rounded border border-slate-300 text-[10px] w-28"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveModuleEdit(modIdx)}
                                className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                title="Save"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingModuleIdx(null)}
                                className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="truncate">
                              <div className="font-bold text-slate-900 text-xs truncate">{mod.title}</div>
                              <div className="text-[10px] text-slate-500">
                                {mod.module || `Module ${modIdx + 1}`} • {mod.weeks} • <span className="text-cyan-700 font-semibold">{submodules.length} Topics</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Module Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                          {isAdminOrSuperAdmin && !isEditingThisModule && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingModuleIdx(modIdx);
                                  setEditModuleTitle(mod.title);
                                  setEditModuleWeeks(mod.weeks || 'Weeks 1-4');
                                }}
                                className="px-2 py-0.5 rounded text-[11px] font-semibold text-cyan-700 hover:bg-cyan-50 border border-cyan-200 transition-all cursor-pointer inline-flex items-center gap-1"
                                title="Edit Module Title & Weeks"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Remove module "${mod.title}" and its topics?`)) {
                                    deleteModuleFromProgram(currentProgram.id, modIdx);
                                  }
                                }}
                                className="px-2 py-0.5 rounded text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer inline-flex items-center gap-1"
                                title="Remove Module"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setExpandedModuleIdx(isExpanded ? null : modIdx)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Sub-modules / Topics Drawer */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-2 bg-white/70 rounded-b-xl">
                          <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center justify-between">
                            <span>Sub-modules & Practical Topics ({submodules.length})</span>
                            <span className="text-cyan-700">Full Customization</span>
                          </div>

                          {/* Submodules List */}
                          <div className="space-y-1.5">
                            {submodules.length === 0 ? (
                              <div className="py-2 text-center text-[10px] text-slate-400 italic">
                                No sub-modules added yet. Enter a topic title below and click "Add Topic".
                              </div>
                            ) : (
                              submodules.map((sub, sIdx) => {
                                const subKey = `${modIdx}-${sIdx}`;
                                const isEditingSub = editingSubmoduleKey === subKey;

                                return (
                                  <div
                                    key={sub.id || sIdx}
                                    className="p-2 rounded-lg border border-slate-200/70 bg-slate-50/70 flex items-center justify-between text-xs hover:border-cyan-200 transition-colors"
                                  >
                                    {isEditingSub ? (
                                      <div className="flex items-center gap-1.5 flex-1 pr-2">
                                        <input
                                          type="text"
                                          value={editSubmoduleTitle}
                                          onChange={(e) => setEditSubmoduleTitle(e.target.value)}
                                          className="px-2 py-0.5 rounded border border-cyan-400 text-xs flex-1"
                                        />
                                        <input
                                          type="text"
                                          value={editSubmoduleHours}
                                          onChange={(e) => setEditSubmoduleHours(e.target.value)}
                                          className="px-2 py-0.5 rounded border border-slate-300 text-[10px] w-20 text-center"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleSaveSubmoduleEdit(modIdx, sIdx)}
                                          className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                        >
                                          <Check className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingSubmoduleKey(null)}
                                          className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                                        <span className="font-semibold text-slate-800 text-[11px] truncate">
                                          {sub.title}
                                        </span>
                                        {sub.hours && (
                                          <span className="text-[9px] font-mono px-1 rounded bg-slate-200/80 text-slate-600 shrink-0">
                                            {sub.hours}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {/* Sub-module Actions */}
                                    {isAdminOrSuperAdmin && !isEditingSub && (
                                      <div className="flex items-center gap-1 shrink-0 ml-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingSubmoduleKey(subKey);
                                            setEditSubmoduleTitle(sub.title);
                                            setEditSubmoduleHours(sub.hours || '4 Hours');
                                          }}
                                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-cyan-700 hover:bg-cyan-50 border border-cyan-200 cursor-pointer"
                                          title="Edit Topic"
                                        >
                                          Edit
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => deleteSubmoduleFromModule(currentProgram.id, modIdx, sIdx)}
                                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                                          title="Remove Sub-module Topic"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Quick Add Submodule Input */}
                          {isAdminOrSuperAdmin && (
                            <div className="pt-2 flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="New sub-module topic title (e.g. Model Serving via FastAPI)..."
                                value={newSubmoduleTitle}
                                onChange={(e) => setNewSubmoduleTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleCreateSubmodule(modIdx);
                                  }
                                }}
                                className="flex-1 px-2.5 py-1 rounded-lg glass-input text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Hours"
                                value={newSubmoduleHours}
                                onChange={(e) => setNewSubmoduleHours(e.target.value)}
                                className="w-20 px-2 py-1 rounded-lg glass-input text-xs text-center"
                              />
                              <button
                                type="button"
                                onClick={() => handleCreateSubmodule(modIdx)}
                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Sub-module</span>
                              </button>
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                All changes saved live in database & storage
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProgramModal(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold glass-card border hover:bg-slate-100 cursor-pointer text-slate-700"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    setSelectedProgramModal(null);
                    setIsAdmissionModalOpen(true);
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer"
                >
                  Enroll Candidate
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CREATE PROGRAM MODAL (COURSES OR INTERNSHIP WITH 15,000 + 18% GST) */}
      {isCreateProgramOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="glass-card rounded-2xl max-w-lg w-full p-5 sm:p-6 border shadow-2xl bg-white max-h-[90vh] overflow-y-auto space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">Add New Course or Internship</h3>
              </div>
              <button
                onClick={() => setIsCreateProgramOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProgramSubmit} className="space-y-3 text-xs">
              
              {/* Type Switcher */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Program Classification</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewProgramForm(p => ({ 
                      ...p, 
                      type: 'course',
                      baseFee: p.baseFee === 30000 ? 15000 : p.baseFee,
                      duration: p.duration === '6 Months' ? '4 Months' : p.duration
                    }))}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      newProgramForm.type === 'course'
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Academic Course (₹15k)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProgramForm(p => ({ 
                      ...p, 
                      type: 'internship',
                      baseFee: p.baseFee === 30000 ? 15000 : p.baseFee,
                      duration: p.duration === '6 Months' ? '4 Months' : p.duration
                    }))}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      newProgramForm.type === 'internship'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Industry Internship (₹15k)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProgramForm(p => ({ 
                      ...p, 
                      type: 'dual',
                      baseFee: 30000,
                      duration: '6 Months',
                      totalHours: '400+ Hours',
                      badge: 'Dual Track'
                    }))}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      newProgramForm.type === 'dual'
                        ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Course + Internship (₹30k)
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newProgramForm.title}
                  onChange={(e) => setNewProgramForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Data Science and AI"
                  className="w-full px-3 py-1.5 rounded-lg glass-input font-bold"
                />
              </div>

              {/* Category & Duration */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={newProgramForm.category}
                    onChange={(e) => setNewProgramForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg glass-input"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration & Hours</label>
                  <input
                    type="text"
                    value={newProgramForm.duration}
                    onChange={(e) => setNewProgramForm(p => ({ ...p, duration: e.target.value }))}
                    placeholder="e.g. 4 Months"
                    className="w-full px-3 py-1.5 rounded-lg glass-input"
                  />
                </div>
              </div>

              {/* Tuition & GST Configuration */}
              <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-2">
                <span className="font-bold text-cyan-900 block text-xs">
                  Tuition Fees & 18% GST Setup (Admin Control)
                </span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Base Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newProgramForm.baseFee}
                      onChange={(e) => setNewProgramForm(p => ({ ...p, baseFee: e.target.value }))}
                      className="w-full px-2 py-1 rounded-lg glass-input font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">GST Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newProgramForm.gstPercent}
                      onChange={(e) => setNewProgramForm(p => ({ ...p, gstPercent: e.target.value }))}
                      className="w-full px-2 py-1 rounded-lg glass-input font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Installments</label>
                    <select
                      value={newProgramForm.installmentMonths}
                      onChange={(e) => setNewProgramForm(p => ({ ...p, installmentMonths: Number(e.target.value) }))}
                      className="w-full px-2 py-1 rounded-lg glass-input font-bold"
                    >
                      <option value={1}>1 Month (Full)</option>
                      <option value={2}>2 Months</option>
                      <option value={3}>3 Months (Standard)</option>
                      <option value={4}>4 Months</option>
                    </select>
                  </div>
                </div>

                {/* Live Computed Pricing Preview */}
                <div className="pt-1.5 border-t border-cyan-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    GST Amount: <strong>₹{Math.round((Number(newProgramForm.baseFee) || 15000) * ((Number(newProgramForm.gstPercent) || 18) / 100)).toLocaleString()}</strong>
                  </span>
                  <span className="font-extrabold text-cyan-900 text-sm">
                    Total: ₹{(
                      (Number(newProgramForm.baseFee) || 15000) + 
                      Math.round((Number(newProgramForm.baseFee) || 15000) * ((Number(newProgramForm.gstPercent) || 18) / 100))
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold text-right">
                  Monthly: {newProgramForm.installmentMonths}x ₹{Math.round((
                    (Number(newProgramForm.baseFee) || 15000) + 
                    Math.round((Number(newProgramForm.baseFee) || 15000) * ((Number(newProgramForm.gstPercent) || 18) / 100))
                  ) / (Number(newProgramForm.installmentMonths) || 3)).toLocaleString()} / mo
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProgramForm.description}
                  onChange={(e) => setNewProgramForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Master core industry concepts, practical labs, and real deployment..."
                  className="w-full px-3 py-1.5 rounded-lg glass-input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateProgramOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Program</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT FEES & GST MODAL */}
      {editingFeeProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="glass-card rounded-2xl max-w-md w-full p-5 border shadow-2xl bg-white space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">Configure Program Fees & GST %</h3>
              </div>
              <button
                onClick={() => setEditingFeeProgram(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-bold">
              {editingFeeProgram.title} ({editingFeeProgram.type === 'internship' ? 'Internship' : 'Course'})
            </p>

            <form onSubmit={handleSaveProgramFees} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Tuition Fee (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={feeForm.baseFee}
                  onChange={(e) => setFeeForm({ ...feeForm, baseFee: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg glass-input font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GST Rate (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={feeForm.gstPercent}
                    onChange={(e) => setFeeForm({ ...feeForm, gstPercent: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg glass-input font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Installment Months</label>
                  <select
                    value={feeForm.installmentMonths}
                    onChange={(e) => setFeeForm({ ...feeForm, installmentMonths: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 rounded-lg glass-input font-bold"
                  >
                    <option value={1}>1 Month (Full Tuition)</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months (Standard)</option>
                    <option value={4}>4 Months</option>
                  </select>
                </div>
              </div>

              {/* Calculated Summary */}
              <div className="p-3 rounded-xl bg-cyan-50/80 border border-cyan-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Tuition:</span>
                  <span className="font-bold text-slate-800">₹{(Number(feeForm.baseFee) || 15000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">GST ({feeForm.gstPercent}%):</span>
                  <span className="font-bold text-slate-800">
                    ₹{Math.round((Number(feeForm.baseFee) || 15000) * ((Number(feeForm.gstPercent) || 18) / 100)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-cyan-200 font-extrabold text-cyan-900 text-sm">
                  <span>Total Payable:</span>
                  <span>
                    ₹{(
                      (Number(feeForm.baseFee) || 15000) + 
                      Math.round((Number(feeForm.baseFee) || 15000) * ((Number(feeForm.gstPercent) || 18) / 100))
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold text-right pt-0.5">
                  Installments: {feeForm.installmentMonths}x ₹{Math.round((
                    (Number(feeForm.baseFee) || 15000) + 
                    Math.round((Number(feeForm.baseFee) || 15000) * ((Number(feeForm.gstPercent) || 18) / 100))
                  ) / (Number(feeForm.installmentMonths) || 3)).toLocaleString()} / month
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFeeProgram(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Fees & GST</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
