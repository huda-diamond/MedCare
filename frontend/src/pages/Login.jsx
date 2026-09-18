import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, User, ShieldAlert, KeyRound, Mail, Phone, Heart, Calendar, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, register, isAuthenticated, user, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Set tab modes based on query params (e.g. ?signup=true)
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
  const [activeRole, setActiveRole] = useState('patient'); // patient, doctor, admin
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  
  // Doctor form fields
  const [specialization, setSpecialization] = useState('General Medicine');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [fee, setFee] = useState('');
  
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'patient') navigate('/patient-dashboard');
      else if (user.role === 'doctor') navigate('/doctor-dashboard');
      else if (user.role === 'admin') navigate('/admin-dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Sync isSignUp tab mode when URL search parameters change (e.g. from navbar links)
  useEffect(() => {
    setIsSignUp(searchParams.get('signup') === 'true');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setLoading(true);

    if (!email || !password) {
      setValidationError('Please fill in all core credentials.');
      setLoading(false);
      return;
    }

    if (isSignUp) {
      if (!name || !phone || !age) {
        setValidationError('Please provide name, phone, and age to register.');
        setLoading(false);
        return;
      }

      if (activeRole === 'doctor') {
        if (!specialization || !experience || !bio || !fee) {
          setValidationError('Doctor profiles require specialization, experience, bio, and consultation fee.');
          setLoading(false);
          return;
        }
      }
    }

    try {
      if (isSignUp) {
        const registerData = {
          name,
          email,
          password,
          role: activeRole,
          phone,
          gender,
          age: parseInt(age)
        };

        if (activeRole === 'doctor') {
          registerData.specialization = specialization;
          registerData.experience = parseInt(experience);
          registerData.bio = bio;
          registerData.fee = parseFloat(fee);
        }

        await register(registerData);
      } else {
        // General login (role verified on backend)
        await login(email, password);
      }
    } catch (err) {
      console.error('Auth action failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-slate-100 to-brand-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Visual background rings */}
      <div className="absolute -top-30 -left-30 w-80 h-80 bg-brand-200/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-30 -right-30 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl" />

      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl relative z-10 transition-all duration-300">
        
        {/* Upper Header Brand */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-tr from-brand-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">
            {isSignUp ? 'Join MedCare' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-xs text-slate-400 font-semibold tracking-wide uppercase">
            {isSignUp ? `Register a ${activeRole} Account` : 'Portal Access & Management'}
          </p>
        </div>

        {/* Tab Controls for Roles (Always shown in both Login and SignUp) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
          {['patient', 'doctor', 'admin'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setActiveRole(role);
                setValidationError('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                activeRole === role
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Core Auth Forms */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Error alerts */}
          {(validationError || authError) && (
            <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-red-600 text-xs font-bold flex gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{validationError || authError}</span>
            </div>
          )}

          {isSignUp && (
            <div className="space-y-4">
              {/* Full name */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={activeRole === 'doctor' ? 'Dr. Emily Watson' : 'Huda Dimond'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+252 (61) 555-1234"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Grid for Gender & Age */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Gender</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all cursor-pointer"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
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
                    min="1"
                    placeholder="23"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>

              {/* Doctor-Specific Fields */}
              {activeRole === 'doctor' && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Specialist Clinical Credentials</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Specialization</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all cursor-pointer"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
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
                      <label className="text-xs font-bold text-slate-500 block mb-1">Exp (Years)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="8"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Consult Fee ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="75"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Professional Medical Bio</label>
                    <textarea
                      required
                      rows="3"
                      placeholder="Describe credentials, degrees, fellowships, and clinic details..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder={
                    activeRole === 'patient' 
                      ? 'patient@medcare.com' 
                      : activeRole === 'doctor' 
                        ? 'cardio@medcare.com' 
                        : 'admin@medcare.com'
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-500 block">Password</label>
                {!isSignUp && (
                  <span className="text-[10px] font-bold text-brand-600 cursor-help hover:underline">
                    Hint: password123
                  </span>
                )}
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 rounded-xl shadow-lg shadow-brand-600/20 active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>{isSignUp ? 'Complete Registration' : 'Authenticate Login'}</span>
              )}
            </button>
          </form>

        {/* Footer toggles */}
        <div className="text-center mt-6 pt-5 border-t border-slate-100">
          {isSignUp ? (
            <p className="text-xs text-slate-500">
              Already have a MedCare account?{' '}
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setValidationError('');
                }}
                className="font-bold text-brand-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              New to MedCare?{' '}
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setValidationError('');
                }}
                className="font-bold text-brand-600 hover:underline"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
