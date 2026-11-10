import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_COURSES,
  INITIAL_INTERNSHIPS,
  INITIAL_STUDENTS,
  INITIAL_EMAIL_TEMPLATES,
  INITIAL_SENT_LOGS,
  INITIAL_ATTENDANCE_LOGS,
  INITIAL_ACADEMY_SETTINGS,
  OFFICIAL_CONVOSIS_PROGRAM_TEMPLATES
} from '../data/initialData';
import { ConvosisApi } from '../services/api';
import confetti from 'canvas-confetti';

const AcademyContext = createContext();

export function AcademyProvider({ children }) {
  // Fixed permanent Minimal Light Theme
  const theme = 'theme-minimal-light';
  const setTheme = () => {}; // no-op since fixed theme requested

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Core Data - Clean Production State: No Pre-filled Courses or Internships (User-Controlled)
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('nexus_courses');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Clean out legacy USD pricing data ($1200 / $1800)
      if (Array.isArray(parsed) && parsed.some(c => (c.feeStructure?.fullAmount || c.fullAmount || 0) < 5000)) {
        localStorage.removeItem('nexus_courses');
        return [];
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [internships, setInternships] = useState(() => {
    const saved = localStorage.getItem('nexus_internships');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Clean out legacy USD pricing data ($900)
      if (Array.isArray(parsed) && parsed.some(i => (i.feeStructure?.fullAmount || i.fullAmount || 0) < 5000)) {
        localStorage.removeItem('nexus_internships');
        return [];
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [dualPrograms, setDualPrograms] = useState(() => {
    const saved = localStorage.getItem('nexus_dual_programs');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.some(d => (d.feeStructure?.fullAmount || d.fullAmount || 0) < 10000)) {
        localStorage.removeItem('nexus_dual_programs');
        return [];
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('nexus_students');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Clean out legacy dummy test candidate records
      if (Array.isArray(parsed) && parsed.some(s => s.id?.startsWith('STU-100'))) {
        localStorage.removeItem('nexus_students');
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  });

  const [emailTemplates, setEmailTemplates] = useState(() => {
    const saved = localStorage.getItem('nexus_templates');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_TEMPLATES;
  });

  const [emailLogs, setEmailLogs] = useState(() => {
    const saved = localStorage.getItem('nexus_email_logs');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.some(l => l.id?.startsWith('log-10'))) {
        localStorage.removeItem('nexus_email_logs');
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem('nexus_attendance');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.some(a => a.studentId?.startsWith('STU-100'))) {
        localStorage.removeItem('nexus_attendance');
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  });

  // Organization State with Unique Organization Number
  const [organization, setOrganization] = useState(() => {
    const saved = localStorage.getItem('convosis_organization');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          name: 'CONVOSIS TECHNOLOGIES PRIVATE LIMITED',
          address: 'TechnolodgePhase II, AnugrahaMedicalComplexBuilding, Union Club Road, Kottayam, Kerala – 686003',
          taxId: '32AANCC9298C1ZE',
          gstin: '32AANCC9298C1ZE',
          email: 'info@convosis.com',
          phone: '+91 8943440266'
        };
      } catch {}
    }
    return {
      id: 1,
      name: 'CONVOSIS TECHNOLOGIES PRIVATE LIMITED',
      orgNumber: 'CV-ORG-2026', // Unique Organization Code
      cinNumber: 'U72900KA2026PTC184920',
      taxId: '32AANCC9298C1ZE',
      gstin: '32AANCC9298C1ZE',
      email: 'info@convosis.com',
      phone: '+91 8943440266',
      address: 'TechnolodgePhase II, AnugrahaMedicalComplexBuilding, Union Club Road, Kottayam, Kerala – 686003',
      currency: '₹',
      currencyCode: 'INR'
    };
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('nexus_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...INITIAL_ACADEMY_SETTINGS, 
        ...parsed, 
        name: 'Convosis Technologies Private Limited',
        orgNumber: parsed.orgNumber || 'CV-ORG-2026',
        cinNumber: parsed.cinNumber || 'U72900KA2026PTC184920',
        currency: parsed.currency || '₹',
        currencyCode: parsed.currencyCode || 'INR'
      };
    }
    return INITIAL_ACADEMY_SETTINGS;
  });

  // Company Authorised Signature (PDF/Image Data URL)
  const [companySignature, setCompanySignature] = useState(() => {
    return localStorage.getItem('convosis_company_signature') || null;
  });

  const updateCompanySignature = (dataUrl) => {
    setCompanySignature(dataUrl);
    if (dataUrl) {
      localStorage.setItem('convosis_company_signature', dataUrl);
      addToast('Company authorised signature updated and saved!', 'success');
    } else {
      localStorage.removeItem('convosis_company_signature');
      addToast('Company authorised signature removed. Default signature restored.', 'info');
    }
  };

  const removeCompanySignature = () => {
    setCompanySignature(null);
    localStorage.removeItem('convosis_company_signature');
    addToast('Company authorised signature reset to default.', 'info');
  };

  // Modal states
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [selectedInstallmentIndex, setSelectedInstallmentIndex] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceiptData, setActiveReceiptData] = useState(null);

  // Official Convosis Invoice & Retainer Invoice Modal state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [activeInvoiceData, setActiveInvoiceData] = useState(null);

  const openInvoice = (student, type = 'retainer') => {
    if (!student) return;
    const totalFee = Number(student.totalFee) || 35400;
    const baseFee = Number(student.baseFee) || Math.round(totalFee / 1.18);
    const gstAmount = Number(student.gstAmount) || (totalFee - baseFee);
    const paidAmount = Number(student.paidAmount) || 0;
    const balanceDue = Number(student.remainingBalance) ?? Math.max(0, totalFee - paidAmount);
    
    // Auto-generate official sequence number: CONV/26-27/003
    const numPart = student.id ? student.id.replace(/\D/g, '').slice(-3).padStart(3, '0') : '003';
    const invoiceNumber = `CONV/26-27/${numPart}`;

    setActiveInvoiceData({
      invoiceNumber,
      invoiceType: type, // 'retainer' or 'tax'
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      rawDate: new Date().toLocaleDateString('en-GB'),
      studentName: student.name || 'Adithya Krishna PK',
      address: student.address || 'Vilayil Veedu, Ellukala , Puthuppally P.O, Kottayam',
      phone: student.phone || '+91 9383445417',
      email: student.email || 'info@convosis.com',
      programTitle: student.programTitle || 'Ethical hacking and Cybersecurity',
      programType: student.programType || 'internship',
      baseFee,
      gstPercent: student.gstPercent || 18,
      gstAmount,
      totalFee,
      paidAmount,
      balanceDue,
      paymentMethod: student.installments?.find(i => i.method)?.method || 'UPI(ID:628943139310)',
      upiId: student.upiId || '628943139310',
      studentObj: student
    });
    setIsInvoiceModalOpen(true);
  };

  // Fee Adjustment & Due Amount Modal State
  const [isFeeAdjustmentModalOpen, setIsFeeAdjustmentModalOpen] = useState(false);
  const [selectedStudentForAdjustment, setSelectedStudentForAdjustment] = useState(null);

  const openFeeAdjustment = (student) => {
    if (!student) return;
    setSelectedStudentForAdjustment(student);
    setIsFeeAdjustmentModalOpen(true);
  };

  const closeFeeAdjustment = () => {
    setIsFeeAdjustmentModalOpen(false);
    setSelectedStudentForAdjustment(null);
  };

  const [isComposeEmailOpen, setIsComposeEmailOpen] = useState(false);
  const [composeEmailProps, setComposeEmailProps] = useState(null);

  // Authentication & Multi-User State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  
  // Multiple Simultaneous Logged-In Sessions
  const [activeSessions, setActiveSessions] = useState(() => {
    const saved = localStorage.getItem('convosis_active_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('convosis_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null; // Requires login first before adding data
  });

  const [usersList, setUsersList] = useState([]);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Sync theme to body class and localStorage
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nexus_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('nexus_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('nexus_internships', JSON.stringify(internships));
  }, [internships]);

  useEffect(() => {
    localStorage.setItem('nexus_dual_programs', JSON.stringify(dualPrograms));
  }, [dualPrograms]);

  useEffect(() => {
    localStorage.setItem('nexus_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  useEffect(() => {
    localStorage.setItem('nexus_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('nexus_templates', JSON.stringify(emailTemplates));
  }, [emailTemplates]);

  useEffect(() => {
    localStorage.setItem('nexus_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('convosis_organization', JSON.stringify(organization));
  }, [organization]);

  useEffect(() => {
    localStorage.setItem('convosis_active_sessions', JSON.stringify(activeSessions));
  }, [activeSessions]);

  // Auth methods & user directory
  const refreshUsers = async () => {
    try {
      const users = await ConvosisApi.getUsers();
      setUsersList(users);
    } catch (err) {
      setUsersList([]);
    }
  };

  const deleteUserAccount = async (userId) => {
    const userToDelete = usersList.find(u => u.id === userId || u.username === userId);
    if (!userToDelete) return;

    if (userToDelete.username === currentUser?.username) {
      addToast('Cannot delete your own currently active account.', 'error');
      return;
    }
    if (userToDelete.username?.toLowerCase() === 'admin') {
      addToast('Cannot delete the root administrator account.', 'error');
      return;
    }

    try {
      await ConvosisApi.deleteUser(userId);
    } catch (err) {
      addToast(err.message || 'Error deleting user from server', 'error');
      return;
    }

    setUsersList((prev) => prev.filter(u => u.id !== userId && u.username !== userId));
    setActiveSessions((prev) => prev.filter(s => s.id !== userId && s.username !== userId));
    addToast(`User account "${userToDelete.username}" deleted successfully.`, 'success');
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('convosis_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('convosis_user');
    }
    refreshUsers();
  }, [currentUser]);

  // Multiple Login Users - Fast User Switching
  const switchAccount = (userId) => {
    const target = activeSessions.find(s => s.id === userId || s.username === userId);
    if (target) {
      setCurrentUser(target);
      addToast(`Switched active profile to ${target.fullName || target.username} (${target.role})`, 'info');
    }
  };

  const logoutAccount = (userId) => {
    setActiveSessions((prev) => {
      const remaining = prev.filter(s => s.id !== userId && s.username !== userId);
      if (currentUser?.id === userId || currentUser?.username === userId) {
        const nextUser = remaining.length > 0 ? remaining[0] : null;
        setCurrentUser(nextUser);
      }
      return remaining;
    });
    addToast('Account session closed.', 'info');
  };

  const logoutAll = () => {
    setActiveSessions([]);
    setCurrentUser(null);
    localStorage.removeItem('convosis_user');
    localStorage.removeItem('convosis_active_sessions');
    addToast('All active sessions have been signed out.', 'info');
  };

  const login = async (userOrEmail, password, orgNumber = '') => {
    const res = await ConvosisApi.login(userOrEmail, password, orgNumber);
    const user = {
      ...res.user,
      fullName: `${res.user.first_name || ''} ${res.user.last_name || ''}`.trim() || res.user.username,
      role: res.user.role || (res.user.is_superuser ? 'Super Admin' : 'Admin / Faculty'),
      orgNumber: res.user.organization_number || organization.orgNumber
    };

    setCurrentUser(user);
    setActiveSessions((prev) => {
      const filtered = prev.filter(s => s.username !== user.username);
      return [...filtered, user];
    });

    if (res.organization) {
      setOrganization({
        ...organization,
        ...res.organization,
        orgNumber: res.organization.org_number || organization.orgNumber
      });
    }

    addToast(`Signed in as ${user.fullName} (${user.role})`, 'success');
    return user;
  };

  const register = async (userData) => {
    const res = await ConvosisApi.register(userData);
    const user = {
      ...res.user,
      fullName: userData.full_name || res.user.username,
      role: userData.role || 'Admin',
      orgNumber: userData.org_number || organization.orgNumber
    };

    setCurrentUser(user);
    setActiveSessions((prev) => {
      const filtered = prev.filter(s => s.username !== user.username);
      return [...filtered, user];
    });

    addToast(`Account created! Welcome to Convosis, ${user.fullName}.`, 'success');
    refreshUsers();
    return user;
  };

  const logout = () => {
    if (currentUser) {
      logoutAccount(currentUser.id);
    }
  };

  // Record a payment for an installment, custom amount, or full settlement
  const recordPayment = (studentId, installmentIndex, paymentDetails) => {
    const { 
      paymentMethod = 'UPI / QR', 
      transactionRef = `TXN-${Math.floor(10000 + Math.random() * 90000)}`, 
      note = '',
      customAmount = null
    } = paymentDetails;
    
    let updatedStudentObj = null;
    let paidAmount = 0;
    let installmentTitle = '';

    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;

        const currentInst = student.installments[installmentIndex] || student.installments[0];
        paidAmount = customAmount !== null && Number(customAmount) > 0 
          ? Number(customAmount) 
          : (currentInst ? currentInst.amount : student.remainingBalance);

        installmentTitle = currentInst ? currentInst.title : 'Tuition Settlement';

        const updatedInstallments = student.installments.map((inst, idx) => {
          if (idx === installmentIndex) {
            return {
              ...inst,
              status: 'paid',
              paidDate: new Date().toISOString().split('T')[0],
              transactionRef,
              method: paymentMethod,
              note: note || (customAmount ? `Custom settlement ₹${paidAmount}` : '')
            };
          }
          return inst;
        });

        const newPaidAmount = student.paidAmount + paidAmount;
        const newRemaining = Math.max(0, student.totalFee - newPaidAmount);

        // If completely paid off, mark any lingering installments as paid
        const finalizedInstallments = newRemaining === 0
          ? updatedInstallments.map(i => ({
              ...i,
              status: 'paid',
              paidDate: i.paidDate || new Date().toISOString().split('T')[0],
              method: i.method || paymentMethod
            }))
          : updatedInstallments;

        updatedStudentObj = {
          ...student,
          paidAmount: newPaidAmount,
          remainingBalance: newRemaining,
          installments: finalizedInstallments
        };

        return updatedStudentObj;
      })
    );

    // Launch celebratory confetti for payment
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // ignore
    }

    // Auto-log email receipt
    if (updatedStudentObj) {
      const receiptData = {
        receiptNumber: transactionRef,
        studentName: updatedStudentObj.name,
        studentEmail: updatedStudentObj.email,
        studentId: updatedStudentObj.id,
        programTitle: updatedStudentObj.programTitle,
        programType: updatedStudentObj.programType || 'internship',
        amountPaid: paidAmount,
        totalPaidAmount: updatedStudentObj.paidAmount,
        totalFee: updatedStudentObj.totalFee || 35400,
        baseFee: updatedStudentObj.baseFee || 30000,
        gstAmount: updatedStudentObj.gstAmount || 5400,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod,
        remainingBalance: updatedStudentObj.remainingBalance,
        installmentTitle,
        address: updatedStudentObj.address || 'Vilayil Veedu, Ellukala , Puthuppally P.O, Kottayam',
        phone: updatedStudentObj.phone || '+91 9383445417',
        academyName: settings.name,
        studentObj: updatedStudentObj
      };

      // Create email log
      const newLog = {
        id: `log-${Date.now()}`,
        studentId: updatedStudentObj.id,
        studentName: updatedStudentObj.name,
        email: updatedStudentObj.email,
        templateId: 'tpl-payment-receipt',
        subject: `Official Receipt #${transactionRef} - Payment Received`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'Delivered',
        trigger: `Auto-Trigger: Installment Paid (${installmentTitle})`
      };

      setEmailLogs((prev) => [newLog, ...prev]);

      addToast(`Payment of ${settings.currency}${paidAmount.toLocaleString()} recorded successfully! Remaining Due: ${settings.currency}${updatedStudentObj.remainingBalance.toLocaleString()}`, 'success');

      // Open receipt preview
      setActiveReceiptData(receiptData);
      setIsReceiptModalOpen(true);
    }
  };

  // Adjust Fees & Due Amount with automatic milestone re-balancing
  const adjustStudentFee = async (studentId, adjustmentDetails) => {
    const { 
      newTotalFee, 
      newRemainingBalance, 
      discountAmount = 0, 
      adjustmentReason = '', 
      adjustmentType = 'discount',
      installments = null 
    } = adjustmentDetails;

    let updatedTargetStudent = null;

    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;

        const previousTotal = student.totalFee;
        const previousDue = student.remainingBalance;
        const total = Number(newTotalFee);
        const due = Number(newRemainingBalance);
        const base = Math.round(total / 1.18);
        const gst = total - base;

        // Auto-rebalance installments if not manually provided
        let updatedInstallments = installments;
        if (!updatedInstallments) {
          const unpaid = student.installments.filter(i => i.status !== 'paid');
          const unpaidCount = unpaid.length || 1;
          const perInst = Math.round(due / unpaidCount);
          let runningDue = due;
          let unpaidProcessed = 0;

          updatedInstallments = student.installments.map((inst) => {
            if (inst.status === 'paid') return inst;
            unpaidProcessed += 1;
            const isLast = unpaidProcessed === unpaidCount;
            const instAmt = isLast ? runningDue : perInst;
            runningDue = Math.max(0, runningDue - instAmt);

            return {
              ...inst,
              amount: due === 0 ? 0 : instAmt,
              status: due === 0 ? 'paid' : 'pending'
            };
          });
        }

        const adjustmentRecord = {
          id: `adj-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: adjustmentType,
          amount: discountAmount,
          reason: adjustmentReason || 'Administrative Fee Adjustment',
          previousTotal,
          newTotal: total,
          previousDue,
          newDue: due,
          adjustedBy: currentUser?.fullName || currentUser?.username || 'Admin'
        };

        updatedTargetStudent = {
          ...student,
          totalFee: total,
          baseFee: base,
          gstAmount: gst,
          remainingBalance: due,
          feeAdjustment: adjustmentRecord,
          adjustmentHistory: [...(student.adjustmentHistory || []), adjustmentRecord],
          installments: updatedInstallments
        };

        return updatedTargetStudent;
      })
    );

    // Sync to backend API asynchronously
    try {
      await ConvosisApi.adjustFee(studentId, {
        total_fee: newTotalFee,
        remaining_balance: newRemainingBalance,
        installments: installments || []
      });
    } catch (err) {
      console.warn('Backend fee adjustment sync notice:', err);
    }

    addToast(
      `Fee adjusted for ${updatedTargetStudent?.name || studentId}: Total ${settings.currency}${Number(newTotalFee).toLocaleString()} • Due Amount ${settings.currency}${Number(newRemainingBalance).toLocaleString()}`,
      'success'
    );

    return updatedTargetStudent;
  };

  // Direct student update
  const updateStudent = (studentId, fieldsToUpdate) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...fieldsToUpdate } : s))
    );
  };

  // Add new student enrollment
  const addStudent = async (newStudentData) => {
    const studentId = `STU-${Math.floor(1008 + Math.random() * 8990)}`;
    const student = {
      id: studentId,
      ...newStudentData,
      avatar: newStudentData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newStudentData.name)}`,
      enrollmentDate: newStudentData.enrollmentDate || new Date().toISOString().split('T')[0],
      attendanceStats: {
        totalClasses: 0,
        attended: 0,
        percentage: 100
      },
      status: 'active'
    };

    setStudents((prev) => [student, ...prev]);

    // Send welcome email automation log
    const welcomeLog = {
      id: `log-${Date.now()}-wel`,
      studentId: student.id,
      studentName: student.name,
      email: student.email,
      templateId: 'tpl-welcome',
      subject: `Welcome to ${settings.name}: Your ${student.programTitle} Journey Starts Now!`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Delivered',
      trigger: 'Automated: New Enrollment'
    };
    setEmailLogs((prev) => [welcomeLog, ...prev]);

    // If initial payment was collected at admission, generate receipt record
    if (student.paidAmount > 0) {
      const initialTxn = student.installments?.find(i => i.transactionRef)?.transactionRef || `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
      const receiptLog = {
        id: `log-${Date.now()}-rec`,
        studentId: student.id,
        studentName: student.name,
        email: student.email,
        templateId: 'tpl-payment-receipt',
        subject: `Official Receipt #${initialTxn} - Admission Payment Received`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'Delivered',
        trigger: 'Automated: Admission Payment'
      };
      setEmailLogs((prev) => [receiptLog, ...prev]);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}
    }

    // Sync to Django backend API asynchronously
    try {
      await ConvosisApi.createStudent({
        student_id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone || '',
        avatar: student.avatar || '',
        program_title: student.programTitle || '',
        program_type: student.programType || 'course',
        enrollment_date: student.enrollmentDate,
        payment_mode: student.paymentMode || 'installment',
        total_fee: student.totalFee,
        paid_amount: student.paidAmount,
        remaining_balance: student.remainingBalance,
        installments: student.installments || []
      });
    } catch (err) {
      console.warn('Backend student creation sync notice:', err);
    }

    addToast(`Candidate ${student.name} admitted successfully! Welcome kit & records initialized.`, 'success');
    return student;
  };

  // Delete candidate admission record
  const deleteStudent = async (studentId) => {
    const student = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setAttendanceRecords((prev) => prev.filter((r) => r.studentId !== studentId));
    setEmailLogs((prev) => prev.filter((l) => l.studentId !== studentId));

    try {
      await ConvosisApi.deleteStudent(studentId);
    } catch (err) {
      console.warn('Backend student deletion sync notice:', err);
    }

    addToast(`Candidate record ${student?.name || studentId} was removed successfully.`, 'info');
  };

  // Create new program (Course, Internship, or Course + Internship Dual Track)
  // Standard Tuition:
  // - Course: ₹15,000 Base Fee + 18% GST (₹2,700) = ₹17,700 Total (3x ₹5,900 / mo)
  // - Internship: ₹15,000 Base Fee + 18% GST (₹2,700) = ₹17,700 Total (3x ₹5,900 / mo)
  // - Dual Track: ₹30,000 Base Fee + 18% GST (₹5,400) = ₹35,400 Total (3x ₹11,800 / mo)
  const createProgram = async (programData) => {
    if (!checkAdminPrivilege()) {
      addToast('Authorization required: Only Super Admin or Admin can create programs.', 'error');
      return null;
    }

    const isDual = programData.type === 'dual' || programData.type === 'course_internship';
    const isIntern = programData.type === 'internship';
    const prefix = isDual ? 'combo' : (isIntern ? 'intern' : 'course');
    const id = programData.id || `${prefix}-${Date.now()}`;
    const defaultBase = isDual ? 30000 : 15000;
    const baseFee = Number(programData.baseFee) || Number(programData.feeStructure?.baseFee) || defaultBase;
    const gstPercent = Number(programData.gstPercent) || Number(programData.feeStructure?.gstPercent) || 18;
    const gstAmount = Math.round(baseFee * (gstPercent / 100));
    const fullAmount = Number(programData.fullAmount) || (baseFee + gstAmount);
    const installmentMonths = Number(programData.installmentMonths) || 3;
    const monthlyInstallment = Math.round(fullAmount / installmentMonths);

    const newProg = {
      ...programData,
      id,
      type: isDual ? 'dual' : (isIntern ? 'internship' : 'course'),
      baseFee,
      gstPercent,
      gstAmount,
      fullAmount,
      installmentMonths,
      installmentAmount: monthlyInstallment,
      feeStructure: {
        baseFee,
        gstPercent,
        gstAmount,
        fullAmount,
        installmentMonths,
        monthlyInstallment,
        installmentBreakdown: Array.from({ length: installmentMonths }, (_, i) => ({
          month: i + 1,
          title: `Month ${i + 1} (Base ₹${Math.round(baseFee / installmentMonths).toLocaleString()} + ${gstPercent}% GST)`,
          amount: monthlyInstallment
        }))
      },
      rating: Number(programData.rating) || 4.9,
      enrolledCount: 0,
      badge: programData.badge || (isDual ? 'Dual Track' : 'Popular'),
      syllabus: programData.syllabus || [
        {
          id: `mod-${Date.now()}-1`,
          module: 'Module 1',
          title: isDual ? 'Phase 1: Advanced Coursework & Architecture' : 'Foundations & Architecture',
          weeks: 'Weeks 1-4',
          submodules: [
            {
              id: `sub-${Date.now()}-1`,
              title: 'Core Fundamentals & Engineering Setup',
              hours: '12 Hours',
              labs: 'Hands-on environment initialization'
            }
          ]
        }
      ]
    };

    if (isDual) {
      setDualPrograms((prev) => [newProg, ...prev]);
    } else if (isIntern) {
      setInternships((prev) => [newProg, ...prev]);
    } else {
      setCourses((prev) => [newProg, ...prev]);
    }

    try {
      await ConvosisApi.createProgram({
        id: newProg.id,
        title: newProg.title,
        type: newProg.type,
        category: newProg.category || 'Technology',
        duration: newProg.duration || (isDual ? '6 Months' : '4 Months'),
        total_hours: newProg.totalHours || (isDual ? '400+ Hours' : '200+ Hours'),
        base_fee: baseFee,
        gst_percent: gstPercent,
        gst_amount: gstAmount,
        full_amount: fullAmount,
        installment_months: installmentMonths,
        installment_amount: monthlyInstallment,
        instructor_name: newProg.instructor?.name || newProg.instructorName || 'Convosis Faculty Team',
        description: newProg.description || ''
      });
    } catch (err) {
      console.warn('Backend program creation sync notice:', err);
    }

    const typeLabel = isDual ? 'Course + Internship (Dual Track)' : (isIntern ? 'Internship' : 'Course');
    addToast(`${typeLabel} "${newProg.title}" created (₹${baseFee.toLocaleString()} + ${gstPercent}% GST = ₹${fullAmount.toLocaleString()})!`, 'success');
    return newProg;
  };

  // Delete program (Course, Internship, or Dual Track)
  const deleteProgram = async (programId) => {
    if (!checkAdminPrivilege()) {
      addToast('Authorization required: Only Super Admin or Admin can delete programs.', 'error');
      return;
    }
    setCourses((prev) => prev.filter((c) => c.id !== programId));
    setInternships((prev) => prev.filter((i) => i.id !== programId));
    setDualPrograms((prev) => prev.filter((d) => d.id !== programId));

    try {
      await ConvosisApi.deleteProgram(programId);
    } catch (err) {
      console.warn('Backend program deletion sync notice:', err);
    }

    addToast('Program deleted successfully from catalog.', 'info');
  };

  // Mark attendance for a student on a specific date
  const markAttendance = (date, studentId, programId, status) => {
    setAttendanceRecords((prev) => {
      // remove any existing record for this date and student
      const filtered = prev.filter((r) => !(r.date === date && r.studentId === studentId));
      return [...filtered, { date, studentId, programId, status }];
    });

    // Update student's calculated attendance %
    setTimeout(() => recalculateStudentAttendance(studentId), 50);
  };

  // Bulk mark all students in a batch as present
  const bulkMarkBatchAttendance = (date, programId, status = 'present') => {
    const batchStudents = students.filter((s) => s.programId === programId);
    setAttendanceRecords((prev) => {
      const studentIds = new Set(batchStudents.map((s) => s.id));
      const filtered = prev.filter((r) => !(r.date === date && studentIds.has(r.studentId)));
      const newBatch = batchStudents.map((s) => ({
        date,
        studentId: s.id,
        programId: s.programId,
        status
      }));
      return [...filtered, ...newBatch];
    });

    batchStudents.forEach((s) => recalculateStudentAttendance(s.id));
    addToast(`Marked ${batchStudents.length} students as ${status} for ${date}`, 'success');
  };

  // Recalculate attendance stats for a student
  const recalculateStudentAttendance = (studentId) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;
        const studentRecords = attendanceRecords.filter((r) => r.studentId === studentId);
        const total = studentRecords.length;
        if (total === 0) return student;

        const attended = studentRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
        const percentage = Number(((attended / total) * 100).toFixed(1));

        return {
          ...student,
          attendanceStats: {
            totalClasses: total,
            attended,
            percentage
          }
        };
      })
    );
  };

  // Dispatch an automated email (single or batch)
  const sendAutomatedEmail = ({ student, template, customSubject, customBody, triggerSource = 'Manual Trigger' }) => {
    let replacedSubject = customSubject || template.subject;
    let replacedBody = customBody || template.body;

    const replacements = {
      '{{student_name}}': student.name,
      '{{student_id}}': student.id,
      '{{course_name}}': student.programTitle,
      '{{amount_due}}': student.remainingBalance,
      '{{due_date}}': student.installments?.find((i) => i.status !== 'paid')?.dueDate || 'Immediately',
      '{{installment_month}}': student.installments?.find((i) => i.status !== 'paid')?.month || '2',
      '{{remaining_balance}}': student.remainingBalance,
      '{{payment_plan}}': student.paymentMode === 'full' ? 'Full Tuition' : '3-Month Installments',
      '{{attendance_percentage}}': student.attendanceStats.percentage,
      '{{total_classes}}': student.attendanceStats.totalClasses,
      '{{attended_classes}}': student.attendanceStats.attended,
      '{{academy_name}}': settings.name
    };

    Object.entries(replacements).forEach(([key, val]) => {
      replacedSubject = replacedSubject.replaceAll(key, String(val ?? ''));
      replacedBody = replacedBody.replaceAll(key, String(val ?? ''));
    });

    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: student.id,
      studentName: student.name,
      email: student.email,
      templateId: template?.id || 'custom',
      subject: replacedSubject,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Delivered',
      trigger: triggerSource
    };

    setEmailLogs((prev) => [newLog, ...prev]);
    addToast(`Email "${replacedSubject.substring(0, 40)}..." sent to ${student.name}`, 'success');
  };

  // Bulk send fee reminders to all students with overdue or pending installments
  const bulkSendDueReminders = () => {
    const overdueOrPending = students.filter(
      (s) => s.paymentMode === 'installment' && s.installments.some((i) => i.status === 'overdue' || i.status === 'pending')
    );

    if (overdueOrPending.length === 0) {
      addToast('No students with pending or overdue installments found.', 'info');
      return;
    }

    const reminderTemplate = emailTemplates.find((t) => t.type === 'fee_reminder') || emailTemplates[1];

    overdueOrPending.forEach((student) => {
      sendAutomatedEmail({
        student,
        template: reminderTemplate,
        triggerSource: 'Bulk Automation: Due Reminder Queue'
      });
    });

    addToast(`Automated reminders dispatched to ${overdueOrPending.length} students.`, 'success');
  };

  // Bulk send attendance warnings to students < 75%
  const bulkSendAttendanceWarnings = () => {
    const lowAttendanceStudents = students.filter((s) => s.attendanceStats.percentage < 75);

    if (lowAttendanceStudents.length === 0) {
      addToast('All students currently have >= 75% attendance! No warnings needed.', 'info');
      return;
    }

    const warningTemplate = emailTemplates.find((t) => t.type === 'attendance_alert') || emailTemplates[4];

    lowAttendanceStudents.forEach((student) => {
      sendAutomatedEmail({
        student,
        template: warningTemplate,
        triggerSource: 'Automated Threshold: Attendance < 75%'
      });
    });

    addToast(`Dispatched low-attendance warning alerts to ${lowAttendanceStudents.length} students.`, 'warning');
  };

  // Full Curriculum Management: Programs, Modules, and Sub-modules
  const checkAdminPrivilege = () => {
    if (!currentUser) return false;
    return (
      currentUser.role === 'Super Admin' ||
      currentUser.role === 'Admin' ||
      currentUser.is_superuser === true ||
      (currentUser.role && currentUser.role.toLowerCase().includes('admin'))
    );
  };

  const loadOfficialConvosisTemplates = () => {
    if (!checkAdminPrivilege()) {
      addToast('Restricted: Only Super Admin or Admin can load official templates.', 'error');
      return;
    }
    const coursesTemplates = OFFICIAL_CONVOSIS_PROGRAM_TEMPLATES.filter((p) => p.type === 'course');
    const internshipsTemplates = OFFICIAL_CONVOSIS_PROGRAM_TEMPLATES.filter((p) => p.type === 'internship');
    const dualTemplates = OFFICIAL_CONVOSIS_PROGRAM_TEMPLATES.filter((p) => p.type === 'dual');
    setCourses(coursesTemplates);
    setInternships(internshipsTemplates);
    setDualPrograms(dualTemplates);
    addToast('Initialized 3 Courses (₹15k+18%), 4 Internships (₹15k+18%), & 3 Course+Internship Dual Tracks (₹30k+18%)', 'success');
  };

  const clearAllPrograms = () => {
    if (!checkAdminPrivilege()) {
      addToast('Restricted: Only Super Admin or Admin can clear programs.', 'error');
      return;
    }
    setCourses([]);
    setInternships([]);
    setDualPrograms([]);
    localStorage.removeItem('nexus_courses');
    localStorage.removeItem('nexus_internships');
    localStorage.removeItem('nexus_dual_programs');
    addToast('All courses, internships, and dual tracks removed. Clean zero-data state active.', 'info');
  };

  const updateProgramFees = (programId, { baseFee, gstPercent, installmentMonths }) => {
    if (!checkAdminPrivilege()) {
      addToast('Restricted: Only Super Admin or Admin can modify program fees and GST.', 'error');
      return;
    }
    const bFee = Number(baseFee) || 15000;
    const gPct = Number(gstPercent) || 18;
    const gAmt = Math.round(bFee * (gPct / 100));
    const total = bFee + gAmt;
    const months = Number(installmentMonths) || 3;
    const monthly = Math.round(total / months);

    const updater = (list) =>
      list.map((item) => {
        if (item.id === programId) {
          return {
            ...item,
            baseFee: bFee,
            gstPercent: gPct,
            gstAmount: gAmt,
            fullAmount: total,
            installmentMonths: months,
            installmentAmount: monthly,
            feeStructure: {
              baseFee: bFee,
              gstPercent: gPct,
              gstAmount: gAmt,
              fullAmount: total,
              installmentMonths: months,
              monthlyInstallment: monthly,
              installmentBreakdown: Array.from({ length: months }, (_, i) => ({
                month: i + 1,
                title: `Month ${i + 1} (Base ₹${Math.round(bFee / months).toLocaleString()} + ${gPct}% GST)`,
                amount: monthly
              }))
            }
          };
        }
        return item;
      });

    setCourses(updater);
    setInternships(updater);
    setDualPrograms(updater);
    addToast(`Program fee updated: ₹${bFee.toLocaleString()} + ${gPct}% GST = ₹${total.toLocaleString()}`, 'success');
  };

  const updateProgram = (programId, updatedData) => {
    if (!checkAdminPrivilege()) {
      addToast('Restricted: Only Super Admin or Admin can modify program specifications.', 'error');
      return;
    }
    setCourses((prev) => prev.map((c) => (c.id === programId ? { ...c, ...updatedData } : c)));
    setInternships((prev) => prev.map((i) => (i.id === programId ? { ...i, ...updatedData } : i)));
    setDualPrograms((prev) => prev.map((d) => (d.id === programId ? { ...d, ...updatedData } : d)));
    addToast('Program details updated successfully!', 'success');
  };

  const addModuleToProgram = (programId, newModule) => {
    if (!checkAdminPrivilege()) {
      addToast('Restricted: Only Super Admin or Admin can add modules.', 'error');
      return;
    }
    const updater = (list) =>
      list.map((item) => {
        if (item.id === programId) {
          const currentSyllabus = item.syllabus || [];
          return {
            ...item,
            syllabus: [...currentSyllabus, { ...newModule, submodules: newModule.submodules || [] }]
          };
        }
        return item;
      });
    setCourses(updater);
    setInternships(updater);
    setDualPrograms(updater);
    addToast(`Added module "${newModule.title}" to curriculum!`, 'success');
  };

  const updateModuleInProgram = (programId, moduleIndex, updatedModule) => {
    if (!checkAdminPrivilege()) {
      addToast('Restricted: Only Super Admin or Admin can update modules.', 'error');
      return;
    }
    const updater = (list) =>
      list.map((item) => {
        if (item.id === programId) {
          const currentSyllabus = [...(item.syllabus || [])];
          currentSyllabus[moduleIndex] = { ...currentSyllabus[moduleIndex], ...updatedModule };
          return { ...item, syllabus: currentSyllabus };
        }
        return item;
      });
    setCourses(updater);
    setInternships(updater);
    setDualPrograms(updater);
    addToast('Module updated successfully!', 'success');
  };

  const deleteModuleFromProgram = (programId, moduleIndex) => {
    if (!checkAdminPrivilege()) {
      addToast('Restricted: Only Super Admin or Admin can delete modules.', 'error');
      return;
    }
    const updater = (list) =>
      list.map((item) => {
        if (item.id === programId) {
          const currentSyllabus = (item.syllabus || []).filter((_, idx) => idx !== moduleIndex);
          return { ...item, syllabus: currentSyllabus };
        }
        return item;
      });
    setCourses(updater);
    setInternships(updater);
    setDualPrograms(updater);
    addToast('Module removed from curriculum.', 'info');
  };

  const addSubmoduleToModule = (programId, moduleIndex, newSubmodule) => {
    if (!checkAdminPrivilege()) {
      addToast('Restricted: Only Super Admin or Admin can add sub-modules.', 'error');
      return;
    }
    const updater = (list) =>
      list.map((item) => {
        if (item.id === programId) {
          const currentSyllabus = [...(item.syllabus || [])];
          const targetModule = currentSyllabus[moduleIndex];
          const currentSubmodules = targetModule.submodules || [];
          currentSyllabus[moduleIndex] = {
            ...targetModule,
            submodules: [...currentSubmodules, newSubmodule]
          };
          return { ...item, syllabus: currentSyllabus };
        }
        return item;
      });
    setCourses(updater);
    setInternships(updater);
    setDualPrograms(updater);
    addToast(`Sub-module topic "${newSubmodule.title}" added!`, 'success');
  };

  const updateSubmoduleInModule = (programId, moduleIndex, submoduleIndex, updatedSubmodule) => {
    if (!checkAdminPrivilege()) {
      addToast('Restricted: Only Super Admin or Admin can edit sub-modules.', 'error');
      return;
    }
    const updater = (list) =>
      list.map((item) => {
        if (item.id === programId) {
          const currentSyllabus = [...(item.syllabus || [])];
          const targetModule = currentSyllabus[moduleIndex];
          const currentSubmodules = [...(targetModule.submodules || [])];
          currentSubmodules[submoduleIndex] = {
            ...currentSubmodules[submoduleIndex],
            ...updatedSubmodule
          };
          currentSyllabus[moduleIndex] = {
            ...targetModule,
            submodules: currentSubmodules
          };
          return { ...item, syllabus: currentSyllabus };
        }
        return item;
      });
    setCourses(updater);
    setInternships(updater);
    setDualPrograms(updater);
    addToast('Sub-module topic updated!', 'success');
  };

  const deleteSubmoduleFromModule = (programId, moduleIndex, submoduleIndex) => {
    if (!checkAdminPrivilege()) {
      addToast('Restricted: Only Super Admin or Admin can delete sub-modules.', 'error');
      return;
    }
    const updater = (list) =>
      list.map((item) => {
        if (item.id === programId) {
          const currentSyllabus = [...(item.syllabus || [])];
          const targetModule = currentSyllabus[moduleIndex];
          const currentSubmodules = (targetModule.submodules || []).filter((_, sIdx) => sIdx !== submoduleIndex);
          currentSyllabus[moduleIndex] = {
            ...targetModule,
            submodules: currentSubmodules
          };
          return { ...item, syllabus: currentSyllabus };
        }
        return item;
      });
    setCourses(updater);
    setInternships(updater);
    setDualPrograms(updater);
    addToast('Sub-module topic removed.', 'info');
  };

  return (
    <AcademyContext.Provider
      value={{
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        searchTerm,
        setSearchTerm,
        courses,
        internships,
        dualPrograms,
        allPrograms: [...courses, ...internships, ...dualPrograms],
        students,
        setStudents,
        emailTemplates,
        setEmailTemplates,
        emailLogs,
        attendanceRecords,
        settings,
        setSettings,
        recordPayment,
        addStudent,
        deleteStudent,
        createProgram,
        deleteProgram,
        deleteUserAccount,
        markAttendance,
        bulkMarkBatchAttendance,
        recalculateStudentAttendance,
        sendAutomatedEmail,
        bulkSendDueReminders,
        bulkSendAttendanceWarnings,
        // Curriculum & Module customization
        updateProgram,
        addModuleToProgram,
        updateModuleInProgram,
        deleteModuleFromProgram,
        addSubmoduleToModule,
        updateSubmoduleInModule,
        deleteSubmoduleFromModule,
        loadOfficialConvosisTemplates,
        clearAllPrograms,
        updateProgramFees,
        isAdminOrSuperAdmin: checkAdminPrivilege(),
        checkAdminPrivilege,
        // Organization & Multi-User State
        organization,
        setOrganization,
        activeSessions,
        switchAccount,
        logoutAccount,
        logoutAll,
        // Auth & Admin
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        login,
        register,
        logout,
        usersList,
        refreshUsers,
        // Modals
        isAdmissionModalOpen,
        setIsAdmissionModalOpen,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        selectedStudentForPayment,
        setSelectedStudentForPayment,
        selectedInstallmentIndex,
        setSelectedInstallmentIndex,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        activeReceiptData,
        setActiveReceiptData,
        // Invoice & Retainer Modal
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        activeInvoiceData,
        setActiveInvoiceData,
        openInvoice,
        // Company Authorised Signature & Seal
        companySignature,
        updateCompanySignature,
        removeCompanySignature,
        // Fee Adjustment & Due Amount Management
        isFeeAdjustmentModalOpen,
        setIsFeeAdjustmentModalOpen,
        selectedStudentForAdjustment,
        setSelectedStudentForAdjustment,
        openFeeAdjustment,
        closeFeeAdjustment,
        adjustStudentFee,
        updateStudent,
        isComposeEmailOpen,
        setIsComposeEmailOpen,
        composeEmailProps,
        setComposeEmailProps,
        toasts,
        addToast
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
}

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademy must be used within an AcademyProvider');
  }
  return context;
};

