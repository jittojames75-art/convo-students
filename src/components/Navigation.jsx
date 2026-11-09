import React from 'react';
import { useAcademy } from '../context/AcademyContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  CreditCard, 
  CalendarCheck, 
  Mail, 
  Settings,
  ShieldCheck
} from 'lucide-react';

export default function Navigation() {
  const { activeTab, setActiveTab, students, currentUser } = useAcademy();

  const overdueCount = students.filter(
    (s) => s.paymentMode === 'installment' && s.installments.some((i) => i.status === 'overdue')
  ).length;

  const lowAttendanceCount = students.filter((s) => s.attendanceStats.percentage < 75).length;

  // Strict RBAC: Only Super Admin or Admin can see the Admin Panel
  const isAdminOrSuperAdmin = 
    currentUser?.role === 'Super Admin' || 
    currentUser?.role === 'Admin' || 
    currentUser?.is_superuser === true ||
    (currentUser?.role && currentUser.role.toLowerCase().includes('admin'));

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses & Internships', icon: BookOpen },
    { id: 'students', label: 'Candidates Directory', icon: Users, badge: students.length },
    { id: 'fees', label: 'Fees & 3-Mo Installments', icon: CreditCard, alert: overdueCount > 0 ? overdueCount : null },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, alert: lowAttendanceCount > 0 ? lowAttendanceCount : null },
    { id: 'email_automation', label: 'Email Automation', icon: Mail },
  ];

  // Append Admin Panel only for Super Admin or Admin
  if (isAdminOrSuperAdmin) {
    NAV_ITEMS.push({ id: 'admin_panel', label: 'Admin Panel', icon: ShieldCheck, badge: 'Root' });
  }

  NAV_ITEMS.push({ id: 'settings', label: 'Settings', icon: Settings });

  return (
    <div className="w-full flex justify-center py-2 px-3">
      {/* Streamlined, compact minimal dock */}
      <nav className="glass-card rounded-xl p-1 flex items-center gap-1 shadow-sm border max-w-full overflow-x-auto scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-cyan-600'}`} />
              <span>{item.label}</span>

              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}

              {item.alert && (
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
