import React from 'react';
import { useAcademy } from './context/AcademyContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CoursesInternships from './components/CoursesInternships';
import StudentsDirectory from './components/StudentsDirectory';
import FeesManagement from './components/FeesManagement';
import InvoicesManager from './components/InvoicesManager';
import AttendanceTracker from './components/AttendanceTracker';
import EmailAutomation from './components/EmailAutomation';
import AdminPanel from './components/AdminPanel';
import SettingsManager from './components/SettingsManager';
import NewAdmissionModal from './components/NewAdmissionModal';
import PaymentModal from './components/PaymentModal';
import ReceiptModal from './components/ReceiptModal';
import RetainerInvoiceModal from './components/RetainerInvoiceModal';
import FeeAdjustmentModal from './components/FeeAdjustmentModal';
import ComposeEmailModal from './components/ComposeEmailModal';
import AuthModal from './components/AuthModal';
import LoginPage from './components/LoginPage';
import ToastContainer from './components/ToastContainer';

export default function App() {
  const { activeTab, currentUser } = useAcademy();

  const isAdminOrSuperAdmin = 
    currentUser?.role === 'Super Admin' || 
    currentUser?.role === 'Admin' || 
    currentUser?.is_superuser === true ||
    (currentUser?.role && currentUser.role.toLowerCase().includes('admin'));

  // First Login Gate: User must log in first before adding data
  if (!currentUser) {
    return (
      <div className="relative min-h-screen bg-slate-50/50">
        <LoginPage />
        <ToastContainer />
      </div>
    );
  }

  // Once authenticated: full application and admin data entry
  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50/50">
      
      {/* Subtle Minimal Light Ambient Cyan/Sky Orbs */}
      <div className="orb bg-gradient-to-tr from-cyan-200/25 to-teal-100/30 top-[-80px] left-[-80px] w-[450px] h-[450px]" />
      <div className="orb bg-gradient-to-br from-sky-200/25 to-cyan-100/35 bottom-[5%] right-[-80px] w-[500px] h-[500px]" />
      <div className="orb bg-gradient-to-r from-blue-100/25 to-teal-100/25 top-[35%] left-[25%] w-[350px] h-[350px]" />

      {/* Top Glass Header */}
      <Header />

      {/* Compact Dock Navigation */}
      <div className="sticky top-13 sm:top-14 z-30 pointer-events-auto">
        <Navigation />
      </div>

      {/* Main Content Area - Fit Screen Optimized */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-4 relative z-10">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'courses' && <CoursesInternships />}
        {activeTab === 'students' && <StudentsDirectory />}
        {activeTab === 'fees' && <FeesManagement />}
        {activeTab === 'invoices' && <InvoicesManager />}
        {activeTab === 'attendance' && <AttendanceTracker />}
        {activeTab === 'email_automation' && <EmailAutomation />}
        {activeTab === 'admin_panel' && (isAdminOrSuperAdmin ? <AdminPanel /> : <Dashboard />)}
        {activeTab === 'settings' && <SettingsManager />}
      </main>

      {/* Footer - Slim */}
      <footer className="relative z-10 py-3 text-center text-xs text-slate-500 border-t border-slate-200/80 mt-6 bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span className="font-medium">&copy; {new Date().getFullYear()} Convosis Technologies Private Limited • IT Academy & Skill Training</span>
          <span className="text-[11px] text-cyan-800 font-semibold">Minimal Light Edition</span>
        </div>
      </footer>

      {/* Interactive Global Modals */}
      <NewAdmissionModal />
      <PaymentModal />
      <ReceiptModal />
      <RetainerInvoiceModal />
      <FeeAdjustmentModal />
      <ComposeEmailModal />
      <AuthModal />
      <ToastContainer />

    </div>
  );
}
