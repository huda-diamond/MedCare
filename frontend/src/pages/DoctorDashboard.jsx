import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Clock, CheckCircle2, XCircle, Stethoscope, User, Save, RefreshCw, Star, HelpCircle, FileText } from 'lucide-react';

const dayList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const slotList = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

const DoctorDashboard = () => {
  const { user, updateProfile } = useContext(AuthContext);

  // States
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Availability state
  const [selectedDays, setSelectedDays] = useState(user?.doctorProfile?.availability?.days || []);
  const [selectedSlots, setSelectedSlots] = useState(user?.doctorProfile?.availability?.slots || []);

  // Completion modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/appointments/my');
      setAppointments(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to pull doctor appointments.', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Accept/Decline action
  const handleUpdateStatus = async (id, status) => {
    try {
      setActionLoading(true);
      await api.put(`/api/appointments/${id}/status`, { status });
      fetchData();
      setActionLoading(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
      setActionLoading(false);
    }
  };

  // Complete consultation with prescription/notes
  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!prescriptionNotes.trim()) {
      alert('Please write down medical findings or prescriptions.');
      return;
    }
    try {
      setActionLoading(true);
      await api.put(`/api/appointments/${selectedAppt._id}/status`, {
        status: 'completed',
        notes: prescriptionNotes
      });
      
      setCompleteModalOpen(false);
      setSelectedAppt(null);
      setPrescriptionNotes('');
      fetchData();
      setActionLoading(false);
    } catch (error) {
      alert('Failed to complete consultation');
      setActionLoading(false);
    }
  };

  // Toggle Day
  const handleToggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Toggle Slot
  const handleToggleSlot = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  // Save Availability Settings
  const handleSaveAvailability = async () => {
    try {
      setActionLoading(true);
      await api.put('/api/doctors/availability', {
        days: selectedDays,
        slots: selectedSlots
      });
      alert('Your clinical calendar settings have been updated successfully.');
      
      // Update global context profile
      await updateProfile({
        doctorProfile: {
          ...user.doctorProfile,
          availability: {
            days: selectedDays,
            slots: selectedSlots
          }
        }
      });
      
      setActionLoading(false);
    } catch (error) {
      alert('Failed to save slot settings');
      setActionLoading(false);
    }
  };

  // Status Colors
  const getBadgeClass = (status) => {
    const classes = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200/50',
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
      completed: 'bg-blue-50 text-blue-700 border-blue-200/50',
      cancelled: 'bg-red-50 text-red-700 border-red-200/50'
    };
    return `text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${classes[status]}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 min-h-screen">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-brand-300 font-extrabold text-xs uppercase tracking-wider">Clinical Workspace Portal</span>
            <h1 className="text-2xl sm:text-4xl font-black">Welcome Back, {user?.name}!</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Manage patient consultation pipelines, toggle your hours of operation, review client allergy files, and add diagnostic comments.
            </p>
          </div>
          
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl self-start md:self-center transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Consultation List
          </button>
        </div>
      </div>

      {/* Grid of basic Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Consults", val: appointments.filter(a => a.status === 'confirmed').length, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Pending Approvals', val: appointments.filter(a => a.status === 'pending').length, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Completed History', val: appointments.filter(a => a.status === 'completed').length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Consultative Earnings', val: `$${appointments.filter(a => a.status === 'completed').length * (user?.doctorProfile?.fee || 100)}`, color: 'text-brand-600 bg-brand-50' }
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
            <span className={`mt-3 text-2xl font-extrabold w-fit px-3 py-1 rounded-2xl ${s.color}`}>
              {s.val}
            </span>
          </div>
        ))}
      </div>

      {/* Main Core Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Appointment Pipelines (7 Columns) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-brand-600" />
            <span>Consultation Pipeline</span>
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(n => <div key={n} className="h-28 bg-slate-100 rounded-2xl shimmer" />)}
            </div>
          ) : appointments.length === 0 ? (
            <p className="p-8 text-center text-slate-400 text-xs">
              No appointments scheduled under your clinical name.
            </p>
          ) : (
            <div className="space-y-4">
              {(appointments || []).map(appt => (
                <div key={appt._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                  {/* Row 1: Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">{appt.patient?.name}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        Gender: {appt.patient?.gender} • Age: {appt.patient?.age} • Phone: {appt.patient?.phone}
                      </p>
                    </div>
                    <span className={getBadgeClass(appt.status)}>
                      {appt.status}
                    </span>
                  </div>

                  {/* Row 2: Allergy / History Warning tags (Clinical touch) */}
                  {appt.patient?.medicalHistory?.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase mr-1">Allergies:</span>
                      {(appt.patient?.medicalHistory || []).map(hist => (
                        <span key={hist} className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded border border-red-100">
                          {hist}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Row 3: Timings */}
                  <div className="flex gap-4 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>Date: {appt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>Hour Slot: {appt.slot}</span>
                    </div>
                  </div>

                  {/* Row 4: Reason Description */}
                  <div className="p-3 bg-white border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Reason for Consult:</span>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{appt.symptoms}</p>
                  </div>

                  {appt.notes && (
                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-800 text-xs">
                      <span className="text-[10px] font-bold block uppercase">Diagnostic Findings:</span>
                      <p className="mt-1 leading-relaxed">{appt.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {appt.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleUpdateStatus(appt._id, 'confirmed')}
                        disabled={actionLoading}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Accept Request</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                        disabled={actionLoading}
                        className="flex-1 py-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-100 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject Slot</span>
                      </button>
                    </div>
                  )}

                  {appt.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        setSelectedAppt(appt);
                        setCompleteModalOpen(true);
                      }}
                      className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Complete Consult & Prescribe</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Slot availability Settings (5 Columns) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-600" />
            <span>Manage Hours of Operation</span>
          </h2>
          
          <p className="text-xs text-slate-500 leading-relaxed">
            Configure the days of the week and specific hour slots you are active inside the hospital so patients can schedule consults.
          </p>

          {/* Days selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 block uppercase">Working Days</label>
            <div className="flex flex-wrap gap-1.5">
              {dayList.map(day => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-brand-50 border-brand-300 text-brand-700'
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots selector */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-500 block uppercase">Available Hour Slots</label>
            <div className="grid grid-cols-3 gap-2">
              {slotList.map(slot => {
                const active = selectedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => handleToggleSlot(slot)}
                    className={`py-2 rounded-xl text-[11px] font-semibold border transition-all ${
                      active
                        ? 'bg-brand-50 border-brand-300 text-brand-700'
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Availability Button */}
          <button
            onClick={handleSaveAvailability}
            disabled={actionLoading}
            className="w-full mt-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow"
          >
            <Save className="h-4 w-4" />
            <span>{actionLoading ? 'Saving...' : 'Save Operations Settings'}</span>
          </button>
        </div>

      </div>

      {/* Completion Modal prescription input */}
      {completeModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-6">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-brand-600 font-extrabold text-[10px] uppercase tracking-wider">Clinical Diagnostics</span>
                <h3 className="text-xl font-bold text-slate-800 mt-1">Complete Consultation & Prescribe</h3>
              </div>
              <button
                onClick={() => { setCompleteModalOpen(false); setSelectedAppt(null); }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <HelpCircle className="h-5.5 w-5.5" />
              </button>
            </div>

            {/* Patient brief */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider leading-none">Consulting Patient</p>
              <h4 className="font-extrabold text-slate-800 text-sm mt-1">{selectedAppt.patient?.name}</h4>
              <p className="text-xs text-slate-500">Gender: {selectedAppt.patient?.gender} • Age: {selectedAppt.patient?.age} • Symptoms: {selectedAppt.symptoms}</p>
            </div>

            <form onSubmit={handleCompleteConsultation} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Diagnostic Findings & Prescription</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Prescribe medications, dosage, rest periods, follow-up times..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800 transition-all"
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => { setCompleteModalOpen(false); setSelectedAppt(null); }}
                  className="flex-1 py-3 text-center border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 text-center bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {actionLoading ? 'Saving File...' : 'Complete Consultation'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
