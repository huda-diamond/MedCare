import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, Heart, Shield, Star, Stethoscope, Clock, CheckCircle2, User, ChevronRight } from 'lucide-react';

const specialtiesList = [
  { name: 'General Medicine', icon: Stethoscope, desc: 'Primary physical exams, prescription management, family health care.', color: 'from-teal-500 to-teal-600' },
  { name: 'Cardiology', icon: Heart, desc: 'Advanced heart conditions treatment, blood pressure care, prevention.', color: 'from-rose-500 to-rose-600' },
  { name: 'Neurology', icon: Shield, desc: 'Stroke rehabilitation, neuropathic pain management, cognitive exams.', color: 'from-indigo-500 to-indigo-600' },
  { name: 'Pediatrics', icon: Star, desc: 'Compassionate medical care for toddlers, children, and infants.', color: 'from-amber-500 to-amber-600' },
  { name: 'Orthopedics', icon: CheckCircle2, desc: 'Joint surgeries, fractures recovery plans, sports medicine support.', color: 'from-blue-500 to-blue-600' },
  { name: 'Dermatology', icon: User, desc: 'Chronic skin infections, acne treatments, skin cancer checkups.', color: 'from-emerald-500 to-emerald-600' }
];

const Home = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await api.get('/api/doctors');
        setDoctors(data.slice(0, 3)); // show top 3 on landing page
        setLoading(false);
      } catch (error) {
        console.error('Failed to load doctors list', error);
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Redirect to login if user clicks book, or redirect directly to dashboard
    const token = localStorage.getItem('medcare_token');
    if (token) {
      navigate(`/patient-dashboard?search=${searchQuery}&specialty=${selectedSpecialty}`);
    } else {
      navigate(`/login?search=${searchQuery}&specialty=${selectedSpecialty}`);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-950 to-indigo-950 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        {/* Abstract Background Accents */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-300 bg-brand-500/10 border border-brand-500/20 rounded-full">
              <Clock className="h-3 w-3" /> Zero waiting lines. 100% Digital.
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Connect With the Best <br />
              <span className="bg-gradient-to-r from-brand-400 to-cyan-300 bg-clip-text text-transparent">
                Medical Professionals
              </span>
            </h1>
            
            <p className="text-slate-300 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Book real-time consults with specialized doctors, manage medical files seamlessly, and experience premium digital health coordination from your home.
            </p>

            {/* Quick Search Card */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto lg:mx-0 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl flex flex-col sm:flex-row gap-2 mt-8">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                <Search className="h-5 w-5 text-slate-300 shrink-0" />
                <input
                  type="text"
                  placeholder="Search doctor names or bios..."
                  className="bg-transparent border-0 text-white placeholder-slate-400 focus:ring-0 w-full text-sm outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                <Stethoscope className="h-5 w-5 text-slate-300 shrink-0" />
                <select
                  className="bg-transparent border-0 text-white focus:ring-0 w-full text-sm outline-none cursor-pointer"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  <option className="text-slate-900" value="">All Specialities</option>
                  {specialtiesList.map(spec => (
                    <option key={spec.name} className="text-slate-900" value={spec.name}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-brand-600/20 active:scale-95 text-sm"
              >
                Find Doctor
              </button>
            </form>
            
            {/* Quick metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-md mx-auto lg:mx-0 border-t border-white/10 mt-8">
              <div>
                <p className="text-2xl font-extrabold text-brand-400">12+</p>
                <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Top Doctors</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-400">6+</p>
                <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Specialties</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-400">99.8%</p>
                <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Satisfied Users</p>
              </div>
            </div>
          </div>

          {/* Graphical Illustration Cards Right Side */}
          <div className="lg:col-span-5 hidden lg:block relative">
            <div className="relative mx-auto w-80 h-96 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-3xl p-1 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&h=600&q=80"
                alt="MedCare Doctor"
                className="w-full h-full object-cover rounded-3xl"
              />
              
              {/* Overlay Glass Floating Cards */}
              <div className="absolute -left-10 top-10 glass-panel p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/40 max-w-xs animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="p-2.5 bg-brand-100 rounded-xl text-brand-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 leading-none">Response Time</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">Within 10 Mins</p>
                </div>
              </div>

              <div className="absolute -right-10 bottom-10 glass-panel p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/40 max-w-xs animate-bounce" style={{ animationDuration: '6s' }}>
                <div className="p-2.5 bg-rose-100 rounded-xl text-rose-600">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 leading-none">Emergency Line</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">24/7 Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specialties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-brand-600 font-bold text-sm tracking-wider uppercase">Medical Specialities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Consult With Our Trusted Experts
          </h2>
          <p className="text-slate-500">
            Select a department to explore doctor reviews, available schedules, and book direct slots online.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specialtiesList.map((spec) => {
            const Icon = spec.icon;
            return (
              <div
                key={spec.name}
                onClick={() => {
                  const token = localStorage.getItem('medcare_token');
                  if (token) navigate(`/patient-dashboard?specialty=${spec.name}`);
                  else navigate(`/login?specialty=${spec.name}`);
                }}
                className="group p-8 bg-white rounded-2xl border border-slate-100 hover:border-brand-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1.5"
              >
                <div>
                  <div className={`p-4 bg-gradient-to-tr ${spec.color} w-fit rounded-2xl text-white shadow-lg group-hover:scale-105 transition-all duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-6 group-hover:text-brand-600 transition-colors">
                    {spec.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                    {spec.desc}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-brand-600 transition-colors">
                  <span>Explore Specialists</span>
                  <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Doctors Section */}
      <div className="bg-slate-100/60 py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 text-center md:text-left">
            <div>
              <span className="text-brand-600 font-bold text-sm tracking-wider uppercase">Our Specialists</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Meet Our Certified Medical Team</h2>
            </div>
            <Link
              to="/login"
              className="mt-4 md:mt-0 flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 font-bold px-5 py-2.5 rounded-xl border border-slate-200 transition-colors text-sm shadow-sm"
            >
              <span>View All Doctors</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl h-96 p-6 space-y-4">
                  <div className="h-40 bg-slate-200 rounded-2xl shimmer" />
                  <div className="h-6 w-2/3 bg-slate-200 rounded shimmer" />
                  <div className="h-4 w-1/3 bg-slate-200 rounded shimmer" />
                  <div className="h-10 bg-slate-200 rounded-xl shimmer mt-6" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(doctors || []).map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-brand-200 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover-card-trigger"
                >
                  <div>
                    {/* Image and basic info */}
                    <div className="relative rounded-2xl overflow-hidden h-48 bg-slate-100">
                      <img
                        src={doc.doctorProfile?.imageUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=512&q=80'}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-brand-800 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg border border-brand-100">
                        {doc.doctorProfile?.specialization}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-5">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{doc.doctorProfile?.rating || 4.9}</span>
                      <span className="text-xs text-slate-400">({doc.doctorProfile?.reviewsCount || 20} reviews)</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mt-2">{doc.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 uppercase mt-0.5">{doc.doctorProfile?.experience} Years Experience</p>
                    <p className="text-sm text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                      {doc.doctorProfile?.bio}
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consultation Fee</p>
                      <p className="text-xl font-black text-slate-800">${doc.doctorProfile?.fee}</p>
                    </div>
                    
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-brand-600/10 transition-colors"
                    >
                      Book Consult
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-gradient-to-br from-brand-900 to-indigo-950 text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Digitize Your Appointments?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-sm leading-relaxed sm:text-base">
            Create your account today as a Patient to book instant doctor appointments, or register as a Medical Specialist to begin hosting slots!
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/login?signup=true"
              className="bg-white text-brand-900 hover:bg-slate-100 font-extrabold px-8 py-3.5 rounded-xl shadow-lg transition-all active:scale-95 text-sm"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold px-8 py-3.5 rounded-xl transition-all text-sm"
            >
              Access Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
