import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, Users, Stethoscope, Calendar, PlusCircle, Trash, RefreshCw, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  // Stats
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0
  });

  // Data Lists
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // New Doctor Form Fields
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPassword, setDocPassword] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docGender, setDocGender] = useState('Male');
  const [docAge, setDocAge] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('General Medicine');
  const [docExperience, setDocExperience] = useState('');
  const [docFee, setDocFee] = useState('');
  const [docBio, setDocBio] = useState('');
  
  const [onboardAlert, setOnboardAlert] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get('/api/admin/stats');
      setStats(statsRes.data);

      const usersRes = await api.get('/api/admin/users');
      setUsers(usersRes.data);

      const apptsRes = await api.get('/api/appointments/my'); // When user is Admin, returns all
      setAppointments(apptsRes.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load administrative datasets.', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Onboard Doctor Action
  const handleOnboardDoctor = async (e) => {
    e.preventDefault();
    setOnboardAlert({ text: '', type: '' });
    setActionLoading(true);

    if (!docName || !docEmail || !docPassword || !docPhone || !docAge || !docExperience || !docFee || !docBio) {
      setOnboardAlert({ text: 'Please fill in all doctor details, bio, and operational fee.', type: 'error' });
      setActionLoading(false);
      return;
    }

    try {
      await api.post('/api/admin/doctors', {
        name: docName,
        email: docEmail,
        password: docPassword,
        phone: docPhone,
        gender: docGender,
        age: parseInt(docAge),
        specialization: docSpecialty,
        experience: parseInt(docExperience),
        fee: parseFloat(docFee),
        bio: docBio
      });

      setOnboardAlert({ text: `Successfully onboarded and created login credentials for ${docName}!`, type: 'success' });
      
      // Reset Form & Refresh
      setTimeout(() => {
        setDocName('');
        setDocEmail('');
        setDocPassword('');
        setDocPhone('');
        setDocAge('');
        setDocExperience('');
        setDocFee('');
        setDocBio('');
        setOnboardAlert({ text: '', type: '' });
        fetchData();
      }, 2000);

    } catch (err) {
      const errMsg = err.response?.data?.message || 'Email already exists. Failed to onboard doctor.';
      setOnboardAlert({ text: errMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete User Action
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`WARNING: Deleting account for '${name}' will permanently purge their profile and cancel all their scheduled appointments. Proceed?`)) return;
    try {
      setActionLoading(true);
      await api.delete(`/api/admin/users/${id}`);
      fetchData();
      setActionLoading(false);
    } catch (error) {
      alert('Failed to delete user.');
      setActionLoading(false);
    }
  };

  // Cancel Appointment override Action
  const handleCancelAppointmentOverride = async (id) => {
    if (!window.confirm('Override and cancel this appointment system-wide?')) return;
    try {
      setActionLoading(true);
      await api.put(`/api/appointments/${id}/status`, { status: 'cancelled', notes: 'Cancelled by Administrator override' });
      fetchData();
      setActionLoading(false);
    } catch (error) {
      alert('Failed to override status.');
      setActionLoading(false);
    }
  };

  // Status Badge Colors
  const getBadgeClass = (status) => {
    const badges = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200/50',
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
      completed: 'bg-blue-50 text-blue-700 border-blue-200/50',
      cancelled: 'bg-red-50 text-red-700 border-red-200/50'
    };
    return `text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badges[status]}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 min-h-screen">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-brand-300 font-extrabold text-xs uppercase tracking-wider">Hospital Administration Command</span>
            <h1 className="text-2xl sm:text-4xl font-black">MedCare Command Center</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Oversee system logs, onboard new certified clinical specialists, monitor global appointments pipelines, and manage accounts.
            </p>
          </div>
          
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl self-start md:self-center transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Global Stats
          </button>
        </div>
      </div>

      {/* Grid of basic Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Registered Patients', val: stats.totalPatients, icon: Users, color: 'text-brand-600 bg-brand-50' },
          { label: 'Clinical Specialists', val: stats.totalDoctors, icon: Stethoscope, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Total Consultations', val: stats.totalAppointments, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pending Pipelines', val: stats.pendingAppointments, icon: BarChart3, color: 'text-yellow-600 bg-yellow-50' }
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
                <p className="mt-2 text-3xl font-black text-slate-800">{s.val}</p>
              </div>
              <div className={`p-3 rounded-2xl ${s.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Three Panel Grid: Onboard Doctor (Left 5 cols), Accounts & Appointments (Right 7 cols) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Onboard Doctor Form (5 Columns) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-brand-600" />
              <span>Onboard New Specialist</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Register a certified doctor with active scheduling credentials.</p>
          </div>

          {/* Form alert */}
          {onboardAlert.text && (
            <div className={`p-3 rounded-xl text-xs font-bold flex gap-2 border ${
              onboardAlert.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {onboardAlert.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{onboardAlert.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleOnboardDoctor} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Emily Watson"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="watson@medcare.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                  value={docEmail}
                  onChange={(e) => setDocEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Onboarding Password</label>
                <input
                  type="password"
                  required
                  placeholder="doctor123"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                  value={docPassword}
                  onChange={(e) => setDocPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+1 (555) 014-9823"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                  value={docPhone}
                  onChange={(e) => setDocPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Gender</label>
                <select
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                  value={docGender}
                  onChange={(e) => setDocGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Age</label>
                <input
                  type="number"
                  required
                  placeholder="36"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                  value={docAge}
                  onChange={(e) => setDocAge(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Exp (Years)</label>
                <input
                  type="number"
                  required
                  placeholder="9"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                  value={docExperience}
                  onChange={(e) => setDocExperience(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Specialization</label>
                <select
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                  value={docSpecialty}
                  onChange={(e) => setDocSpecialty(e.target.value)}
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Dermatology">Dermatology</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Consult Fee ($)</label>
                <input
                  type="number"
                  required
                  placeholder="90"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                  value={docFee}
                  onChange={(e) => setDocFee(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Professional Medical Bio</label>
              <textarea
                required
                rows="3"
                placeholder="Describe credentials, degrees, fellowships, publications, and clinic details..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                value={docBio}
                onChange={(e) => setDocBio(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full mt-4 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow"
            >
              {actionLoading ? 'Creating Profile...' : 'Complete Specialist Onboarding'}
            </button>
          </form>
        </div>

        {/* Right Side: Accounts Management & Global Appointments Overview (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* User accounts list */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-600" />
              <span>User Accounts Management</span>
            </h2>

            {loading ? (
              <div className="h-40 bg-slate-100 rounded-2xl shimmer" />
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Email / Contact</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {(users || []).map(u => (
                      <tr key={u._id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-bold text-slate-700">{u.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'doctor' ? 'bg-indigo-50 text-indigo-700' : 'bg-brand-50 text-brand-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-800">{u.email}</p>
                          <p className="text-slate-400 text-[10px] mt-0.5">{u.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={actionLoading}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg transition-colors"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-6 text-slate-400">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Global appointments monitoring logs */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-600" />
              <span>Global Appointments Overview</span>
            </h2>

            {loading ? (
              <div className="h-40 bg-slate-100 rounded-2xl shimmer" />
            ) : appointments.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs">No active consultations inside the system.</p>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {(appointments || []).map(appt => (
                  <div key={appt._id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-2 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-extrabold text-slate-800">Patient: {appt.patient?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Doctor: {appt.doctor?.name} ({appt.doctor?.doctorProfile?.specialization})</p>
                      </div>
                      <span className={getBadgeClass(appt.status)}>{appt.status}</span>
                    </div>

                    <div className="flex gap-4 text-[10px] text-slate-400 font-semibold uppercase">
                      <span>Date: {appt.date}</span>
                      <span>Slot: {appt.slot}</span>
                    </div>

                    <p className="text-slate-500 bg-white p-2 border border-slate-100 rounded-xl leading-relaxed text-[11px]"><span className="font-bold text-[9px] uppercase text-slate-400 block mb-0.5">Symptoms:</span>{appt.symptoms}</p>

                    {/* Admin Override Cancellation */}
                    {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                      <button
                        onClick={() => handleCancelAppointmentOverride(appt._id)}
                        disabled={actionLoading}
                        className="w-full mt-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold rounded-xl transition-all"
                      >
                        Force Cancel Appointment
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
