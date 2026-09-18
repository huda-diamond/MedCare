import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Search, Heart, Star, Calendar, Clock, ClipboardList, RefreshCw, X, PlusCircle, Trash, Check, AlertCircle } from 'lucide-react';

const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'General Medicine'];

const PatientDashboard = () => {
  const { user, updateProfile } = useContext(AuthContext);
  
  // States
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  
  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  
  // Health records profile edits
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(user?.age || '');
  const [newSymptomTag, setNewSymptomTag] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  // Initial Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const doctorsRes = await api.get('/api/doctors');
      setDoctors(doctorsRes.data);
      setFilteredDoctors(doctorsRes.data);

      const appointmentsRes = await api.get('/api/appointments/my');
      setAppointments(appointmentsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to retrieve patient dashboard datasets.', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Doctors on search/specialty changes
  useEffect(() => {
    let result = doctors;
    if (selectedSpecialty !== 'All') {
      result = result.filter(doc => doc.doctorProfile?.specialization === selectedSpecialty);
    }
    if (searchQuery.trim() !== '') {
      result = result.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.doctorProfile?.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredDoctors(result);
  }, [searchQuery, selectedSpecialty, doctors]);

  // Handle Bookings Submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg({ text: '', type: '' });
    setActionLoading(true);

    if (!bookingDate || !bookingSlot || !symptoms) {
      setAlertMsg({ text: 'Please specify the consultation date, desired hour slot, and describe symptoms.', type: 'error' });
      setActionLoading(false);
      return;
    }

    try {
      await api.post('/api/appointments', {
        doctor: selectedDoctor._id,
        date: bookingDate,
        slot: bookingSlot,
        symptoms,
        notes: bookingNotes
      });

      setAlertMsg({ text: 'Congratulations! Your medical consultation has been successfully requested.', type: 'success' });
      
      // Reset Modal & Reload
      setTimeout(() => {
        setBookingModalOpen(false);
        setSelectedDoctor(null);
        setBookingDate('');
        setBookingSlot('');
        setSymptoms('');
        setBookingNotes('');
        setAlertMsg({ text: '', type: '' });
        fetchData();
      }, 2000);

    } catch (err) {
      const errMsg = err.response?.data?.message || 'Double booking error: This slot is occupied.';
      setAlertMsg({ text: errMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancellation
  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to cancel this scheduled consultation?')) return;
    try {
      await api.put(`/api/appointments/${id}/status`, { status: 'cancelled' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  // Update Profile Info
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await updateProfile({
        phone,
        age: parseInt(age)
      });
      alert('Your patient coordinates have been updated successfully.');
      setActionLoading(false);
    } catch (error) {
      alert('Failed to update contact info');
      setActionLoading(false);
    }
  };

  // Add Health History Tag
  const handleAddHistoryTag = async () => {
    if (!newSymptomTag.trim()) return;
    const updatedHistory = [...(user.medicalHistory || []), newSymptomTag.trim()];
    try {
      await updateProfile({ medicalHistory: updatedHistory });
      setNewSymptomTag('');
    } catch (error) {
      alert('Failed to add allergy tag');
    }
  };

  // Remove Health History Tag
  const handleRemoveHistoryTag = async (tagToRemove) => {
    const updatedHistory = (user.medicalHistory || []).filter(t => t !== tagToRemove);
    try {
      await updateProfile({ medicalHistory: updatedHistory });
    } catch (error) {
      alert('Failed to remove tag');
    }
  };

  // Status Badge Colors
  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200/50',
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
      completed: 'bg-blue-50 text-blue-700 border-blue-200/50',
      cancelled: 'bg-red-50 text-red-700 border-red-200/50'
    };
    return `text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${badges[status]}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 min-h-screen">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-brand-300 font-extrabold text-xs uppercase tracking-wider">Patient Dashboard Portal</span>
            <h1 className="text-2xl sm:text-4xl font-black">Welcome Back, {user?.name}!</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Here you can discover certified clinical specialists, book online slots, update your medical allergies, and manage consultation history.
            </p>
          </div>
          
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl self-start md:self-center transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload Datasets
          </button>
        </div>
      </div>

      {/* Grid of basic Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Bookings', val: appointments.filter(a => a.status === 'pending').length, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Confirmed Consults', val: appointments.filter(a => a.status === 'confirmed').length, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Completed Consults', val: appointments.filter(a => a.status === 'completed').length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Scheduled', val: appointments.length, color: 'text-brand-600 bg-brand-50' }
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
            <span className={`mt-3 text-3xl font-black w-fit px-3 py-1 rounded-2xl ${s.color}`}>
              {s.val}
            </span>
          </div>
        ))}
      </div>

      {/* Main Core Layout: Browse Doctors on Left, Appointments/Profile on Right */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Doctor Search Panel (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Search className="h-5 w-5 text-brand-600" />
              <span>Discover & Book Specialists</span>
            </h2>

            {/* Keyword Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search specialty description, doctor name, bio..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Specialty category selectors */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {specialties.map(spec => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedSpecialty === spec
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/10'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* List of filtered Doctors */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(n => (
                <div key={n} className="bg-white rounded-3xl p-6 h-48 shimmer" />
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 text-slate-400 space-y-3">
              <AlertCircle className="h-10 w-10 mx-auto text-slate-300" />
              <p className="font-bold">No certified specialists match your queries.</p>
              <button onClick={() => { setSearchQuery(''); setSelectedSpecialty('All'); }} className="text-brand-600 text-xs font-bold hover:underline">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {(filteredDoctors || []).map(doc => (
                <div key={doc._id} className="bg-white rounded-3xl p-5 border border-slate-100 hover:border-brand-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover-card-trigger">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <img
                        src={doc.doctorProfile?.imageUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80'}
                        alt={doc.name}
                        className="h-16 w-16 rounded-2xl object-cover border border-slate-100 bg-slate-50"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 border border-brand-100">
                          {doc.doctorProfile?.specialization}
                        </span>
                        <h3 className="font-bold text-slate-800 mt-1.5">{doc.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{doc.doctorProfile?.experience} Yrs Experience</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                      <span className="text-xs font-bold text-slate-700">{doc.doctorProfile?.rating}</span>
                      <span className="text-xs text-slate-400">({doc.doctorProfile?.reviewsCount || 10} consults)</span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {doc.doctorProfile?.bio}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fee</p>
                      <p className="text-lg font-black text-slate-800">${doc.doctorProfile?.fee}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setBookingModalOpen(true);
                      }}
                      className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-colors"
                    >
                      Book Consult
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: My Appointments List & Health Profiles (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Appointments */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-brand-600" />
              <span>My Consultation History</span>
            </h2>

            {loading ? (
              <div className="h-32 bg-slate-100 rounded-2xl shimmer" />
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                You have not booked any medical consultations yet. Choose a specialist to get started!
              </div>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {(appointments || []).map(appt => (
                  <div key={appt._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{appt.doctor?.name}</h4>
                        <p className="text-[10px] text-brand-600 font-semibold">{appt.doctor?.doctorProfile?.specialization}</p>
                      </div>
                      <span className={getStatusBadge(appt.status)}>
                        {appt.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Date: {appt.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Time: {appt.slot}</span>
                      </div>
                    </div>

                    <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-600 block text-[10px] uppercase">Symptoms:</span>
                      <p className="text-slate-500 mt-0.5 leading-relaxed">{appt.symptoms}</p>
                    </div>

                    {appt.notes && (
                      <div className="text-xs bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 text-emerald-800">
                        <span className="font-bold block text-[10px] uppercase">Doctor's Feedback:</span>
                        <p className="mt-0.5 leading-relaxed">{appt.notes}</p>
                      </div>
                    )}

                    {/* Cancellation Action */}
                    {appt.status === 'pending' && (
                      <button
                        onClick={() => handleCancelAppointment(appt._id)}
                        className="w-full py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-xs font-bold rounded-xl transition-all"
                      >
                        Cancel Consultation Slot
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Health Profile / Contact updates */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Heart className="h-5 w-5 text-brand-600" />
              <span>Allergies & Demographics</span>
            </h2>

            {/* Allergies / Medical Tags */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 block">Current Allergy / Disease Tags</label>
              
              <div className="flex flex-wrap gap-1.5">
                {(user?.medicalHistory || []).map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                    {tag}
                    <X onClick={() => handleRemoveHistoryTag(tag)} className="h-3 w-3 text-slate-400 hover:text-red-500 cursor-pointer" />
                  </span>
                ))}
                {(user?.medicalHistory || []).length === 0 && (
                  <p className="text-xs text-slate-400 italic">No allergy tags listed.</p>
                )}
              </div>

              {/* Tag Adder */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Allergy to Penicillin"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                  value={newSymptomTag}
                  onChange={(e) => setNewSymptomTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddHistoryTag(); }}
                />
                <button
                  type="button"
                  onClick={handleAddHistoryTag}
                  className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl"
                >
                  <PlusCircle className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Demographics update Form */}
            <form onSubmit={handleProfileUpdate} className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Age</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                {actionLoading ? 'Saving...' : 'Update Demographics'}
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Booking Calendar Dialog Modal */}
      {bookingModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-brand-600 font-extrabold text-[10px] uppercase tracking-wider">Appointment Scheduler</span>
                <h3 className="text-xl font-bold text-slate-800 mt-1">Book Consultation Slot</h3>
              </div>
              <button
                onClick={() => { setBookingModalOpen(false); setSelectedDoctor(null); }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            {/* Alert Display */}
            {alertMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-bold flex gap-2 border ${
                alertMsg.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {alertMsg.type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{alertMsg.text}</span>
              </div>
            )}

            {/* Doctor Card Brief */}
            <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <img
                src={selectedDoctor.doctorProfile?.imageUrl}
                alt={selectedDoctor.name}
                className="h-12 w-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{selectedDoctor.name}</h4>
                <p className="text-xs text-brand-600 font-semibold">{selectedDoctor.doctorProfile?.specialization}</p>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">Consultation Fee: ${selectedDoctor.doctorProfile?.fee}</span>
              </div>
            </div>

            {/* Scheduler Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              
              {/* Grid: Date & Slot hour */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Select Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800 cursor-pointer"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Select Hour Slot</label>
                  <select
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800 cursor-pointer disabled:opacity-60"
                    value={bookingSlot}
                    onChange={(e) => setBookingSlot(e.target.value)}
                    disabled={!(selectedDoctor.doctorProfile?.availability?.slots?.length > 0)}
                  >
                    {selectedDoctor.doctorProfile?.availability?.slots?.length > 0 ? (
                      <>
                        <option value="">Choose slot...</option>
                        {(selectedDoctor.doctorProfile?.availability?.slots || []).map(sl => (
                          <option key={sl} value={sl}>{sl}</option>
                        ))}
                      </>
                    ) : (
                      <option value="">No slots configured by doctor</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Symptoms / Reason for Visit</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Mild chest pain, congestion, annual checkup..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800 transition-all"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              {/* Extra notes */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Additional Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Allergy to certain pain relievers"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800 transition-all"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                />
              </div>

              {/* Action submission buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => { setBookingModalOpen(false); setSelectedDoctor(null); }}
                  className="flex-1 py-3 text-center border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 text-center bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  {actionLoading ? 'Booking Slot...' : 'Confirm Consultation Booking'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDashboard;
