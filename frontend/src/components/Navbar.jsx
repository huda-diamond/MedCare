import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon, Calendar, Briefcase, Users, LayoutDashboard, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
    ${isActive(path) 
      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
  `;

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'patient') return '/patient-dashboard';
    if (user.role === 'doctor') return '/doctor-dashboard';
    if (user.role === 'admin') return '/admin-dashboard';
    return '/';
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2.5 bg-gradient-to-tr from-brand-600 to-cyan-500 rounded-xl text-white shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-all duration-300">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-700 via-brand-600 to-accent-600 bg-clip-text text-transparent">
                MedCare
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-2">
              <Link to={getDashboardPath()} className={linkClass(getDashboardPath())}>
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              {user.role === 'patient' && (
                <Link to="/patient-dashboard" className={linkClass('/patient-dashboard')}>
                  <Calendar className="h-4 w-4" />
                  <span>Book Appointment</span>
                </Link>
              )}

              {user.role === 'doctor' && (
                <Link to="/doctor-dashboard" className={linkClass('/doctor-dashboard')}>
                  <Briefcase className="h-4 w-4" />
                  <span>Schedules</span>
                </Link>
              )}

              {user.role === 'admin' && (
                <Link to="/admin-dashboard" className={linkClass('/admin-dashboard')}>
                  <Users className="h-4 w-4" />
                  <span>Manage</span>
                </Link>
              )}
            </div>
          )}

          {/* Right Profile Actions / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 leading-none">{user.name}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 inline-block rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                    {user.role}
                  </span>
                </div>
                
                {/* Profile Bubble */}
                <div className="relative group">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-100 to-brand-50 border border-brand-200/50 flex items-center justify-center text-brand-700 font-bold uppercase cursor-pointer hover:border-brand-400 transition-all">
                    {user.name.charAt(0)}
                  </div>
                  
                  {/* Dropdown on Hover */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 origin-top-right scale-95 group-hover:scale-100">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-semibold text-slate-700 truncate">{user.email}</p>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-brand-700 hover:text-brand-800 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?signup=true"
                  className="px-4.5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 rounded-xl shadow-md shadow-brand-600/10 hover:shadow-lg transition-all duration-200 active:scale-95"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-200 bg-white/95 px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top-4 duration-200">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-3 border-b border-slate-100 mb-2">
                <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                <p className="text-xs text-slate-500 mt-1 truncate">{user.email}</p>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 mt-2 inline-block rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                  {user.role}
                </span>
              </div>

              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-400" />
                Dashboard
              </Link>

              {user.role === 'patient' && (
                <Link
                  to="/patient-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Book Appointment
                </Link>
              )}

              {user.role === 'doctor' && (
                <Link
                  to="/doctor-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  Schedules
                </Link>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Users className="h-4 w-4 text-slate-400" />
                  Manage
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-center text-sm font-bold text-brand-700 hover:bg-slate-50 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/login?signup=true"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-center text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
