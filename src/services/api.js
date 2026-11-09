// Dynamic API base URL: Uses VITE_API_URL in production (Render) or localhost in development
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '');

/**
 * Convosis Django REST API Client
 */
export const ConvosisApi = {
  // Check backend server status
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/programs/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return { connected: response.ok, status: response.status };
    } catch (err) {
      return { connected: false, error: err.message };
    }
  },

  // Organization Management (Unique Org Number)
  async getOrganization() {
    const res = await fetch(`${API_BASE_URL}/organizations/current/`);
    if (!res.ok) throw new Error('Failed to fetch organization');
    return res.json();
  },

  async verifyOrgNumber(number) {
    const res = await fetch(`${API_BASE_URL}/organizations/verify_number/?number=${encodeURIComponent(number)}`);
    if (!res.ok) throw new Error('Failed to verify organization number');
    return res.json();
  },

  async updateOrganization(orgId, orgData) {
    const res = await fetch(`${API_BASE_URL}/organizations/${orgId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orgData)
    });
    return res.json();
  },

  // Authentication & Multi-User Support
  async login(username, password, orgNumber = '') {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, org_number: orgNumber })
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.non_field_errors?.[0] || data.detail || 'Login failed. Invalid credentials.';
      throw new Error(msg);
    }
    return data;
  },

  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.username?.[0] || data.email?.[0] || data.org_number?.[0] || data.password?.[0] || 'Registration failed.';
      throw new Error(msg);
    }
    return data;
  },

  async getUsers() {
    const res = await fetch(`${API_BASE_URL}/users/`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async deleteUser(userId) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete user');
    }
    return true;
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats/`);
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  // Programs (Courses & Internships)
  async getPrograms() {
    const res = await fetch(`${API_BASE_URL}/programs/`);
    if (!res.ok) throw new Error('Failed to fetch programs');
    return res.json();
  },

  async createProgram(programData) {
    const res = await fetch(`${API_BASE_URL}/programs/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(programData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create program');
    }
    return res.json();
  },

  async deleteProgram(programId) {
    const res = await fetch(`${API_BASE_URL}/programs/${programId}/`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error('Failed to delete program');
    }
    return true;
  },

  async createModule(programId, moduleData) {
    const res = await fetch(`${API_BASE_URL}/modules/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program: programId, ...moduleData })
    });
    return res.json();
  },

  async deleteModule(moduleId) {
    const res = await fetch(`${API_BASE_URL}/modules/${moduleId}/`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  async createSubmodule(moduleId, subData) {
    const res = await fetch(`${API_BASE_URL}/submodules/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: moduleId, ...subData })
    });
    return res.json();
  },

  async deleteSubmodule(submoduleId) {
    const res = await fetch(`${API_BASE_URL}/submodules/${submoduleId}/`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  // Students & Admissions
  async getStudents() {
    const res = await fetch(`${API_BASE_URL}/students/`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async createStudent(studentData) {
    const res = await fetch(`${API_BASE_URL}/students/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    return res.json();
  },

  async deleteStudent(studentId) {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}/`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error('Failed to delete candidate record');
    }
    return true;
  },

  // Fees & Installments
  async recordPayment(studentId, payload) {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}/record_payment/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Attendance
  async recordAttendanceBulk(payload) {
    const res = await fetch(`${API_BASE_URL}/attendance/bulk_mark/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Email Reminders
  async triggerDueReminders() {
    const res = await fetch(`${API_BASE_URL}/trigger-due-reminders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  }
};
