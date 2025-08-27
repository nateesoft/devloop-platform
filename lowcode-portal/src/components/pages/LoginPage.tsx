import React, { useState } from 'react';
import { UserRole } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useKeycloakSafe } from '@/hooks/useKeycloakSafe';
import { useKeycloakSync } from '@/hooks/useKeycloakSync';
import { useRouter } from 'next/navigation';
import KeycloakStatus from '@/components/debug/KeycloakStatus';
import { extractErrorMessage } from '@/utils/errorUtils';

interface LoginPageProps {
  setIsAuthenticated: (authenticated: boolean) => void;
  setUserRole: (role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  setIsAuthenticated,
  setUserRole,
}) => {
  const { login, register } = useAuth();
  const keycloakAuth = useKeycloakSafe();
  const { isSyncing, syncError, isKeycloakAuthenticated, isLocalAuthenticated } = useKeycloakSync();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Form submission started:', { isLogin, formData: { ...formData, password: '***' } });

    try {
      if (isLogin) {
        console.log('Attempting login...');
        // Use AuthContext login which handles both API call and state management
        await login(formData.email, formData.password);
        console.log('Login successful');
        // Set legacy state for any components that still depend on it
        setIsAuthenticated(true);
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        if (!formData.firstName || !formData.lastName) {
          console.log('Registration validation failed: missing fields');
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        console.log('Attempting registration...');
        // Use AuthContext register which handles both API call and state management
        await register(formData.email, formData.password, formData.firstName, formData.lastName);
        console.log('Registration successful');
        // Set legacy state for any components that still depend on it
        setIsAuthenticated(true);
        setUserRole('user'); // Default role for new users
        // Redirect to dashboard
        router.push('/dashboard');
      }
      
    } catch (err: any) {
      console.error('Login/Register error:', err);
      console.error('Error details:', { 
        message: err.message, 
        response: err.response?.data, 
        status: err.response?.status 
      });
      
      // Use our new error utility to extract user-friendly message with login context
      const errorMessage = extractErrorMessage(err, 'login');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}></div>
        </div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-1/4 left-1/4 w-20 h-20 border-2 border-blue-400/30 dark:border-blue-300/20 rotate-45 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-16 h-16 border-2 border-purple-400/30 dark:border-purple-300/20 animate-spin" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-12 h-12 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-gradient-to-br from-purple-400/30 to-blue-400/30 rotate-45 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Flowing Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="line1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="line2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path
            d="M0,300 Q400,100 800,300 T1600,300"
            stroke="url(#line1)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
          <path
            d="M0,500 Q400,700 800,500 T1600,500"
            stroke="url(#line2)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </svg>
        
        {/* Particle Effect */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/60 rounded-full animate-ping"></div>
        <div className="absolute top-20 right-32 w-1 h-1 bg-purple-400/60 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 left-20 w-1.5 h-1.5 bg-blue-300/60 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-300/60 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        
        {/* Aurora Borealis Effect */}
        <div className="absolute inset-0 overflow-hidden opacity-60 dark:opacity-40">
          <div className="absolute -top-1/2 left-0 w-full h-full">
            <div 
              className="absolute inset-0 aurora-wave-1"
              style={{
                background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3))',
                filter: 'blur(50px)',
                borderRadius: '50%',
                animation: 'aurora1 8s ease-in-out infinite alternate'
              }}
            ></div>
            <div 
              className="absolute inset-0 aurora-wave-2"
              style={{
                background: 'linear-gradient(-45deg, rgba(59, 130, 246, 0.4), rgba(168, 85, 247, 0.4), rgba(34, 197, 94, 0.3), rgba(245, 158, 11, 0.3))',
                filter: 'blur(60px)',
                borderRadius: '50%',
                animation: 'aurora2 10s ease-in-out infinite alternate-reverse'
              }}
            ></div>
            <div 
              className="absolute inset-0 aurora-wave-3"
              style={{
                background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.4), rgba(34, 197, 94, 0.3))',
                filter: 'blur(40px)',
                borderRadius: '50%',
                animation: 'aurora3 12s ease-in-out infinite alternate'
              }}
            ></div>
          </div>
        </div>

        {/* Shooting Stars */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="shooting-star shooting-star-1"></div>
          <div className="shooting-star shooting-star-2"></div>
          <div className="shooting-star shooting-star-3"></div>
          <div className="shooting-star shooting-star-4"></div>
          <div className="shooting-star shooting-star-5"></div>
        </div>

        {/* Floating Tech Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Computer/Laptop */}
          <div className="floating-tech tech-element-1">
            <svg width="59" height="52" viewBox="0 0 100 80" className="tech-svg">
              {/* Screen */}
              <rect x="15" y="10" width="70" height="45" rx="3" fill="#1f2937" stroke="#3b82f6" strokeWidth="2"/>
              <rect x="18" y="13" width="64" height="39" rx="2" fill="#0f172a"/>
              {/* Code lines */}
              <line x1="22" y1="18" x2="45" y2="18" stroke="#22c55e" strokeWidth="1"/>
              <line x1="22" y1="23" x2="60" y2="23" stroke="#3b82f6" strokeWidth="1"/>
              <line x1="22" y1="28" x2="35" y2="28" stroke="#f59e0b" strokeWidth="1"/>
              <line x1="22" y1="33" x2="55" y2="33" stroke="#ef4444" strokeWidth="1"/>
              {/* Base */}
              <rect x="40" y="55" width="20" height="8" rx="2" fill="#374151"/>
              <rect x="20" y="63" width="60" height="4" rx="2" fill="#6b7280"/>
              {/* Glow effect */}
              <rect x="15" y="10" width="70" height="45" rx="3" fill="none" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1" className="tech-glow"/>
            </svg>
          </div>

          {/* Server */}
          <div className="floating-tech tech-element-2">
            <svg width="46" height="65" viewBox="0 0 80 100" className="tech-svg">
              {/* Server body */}
              <rect x="15" y="20" width="50" height="60" rx="4" fill="#374151" stroke="#10b981" strokeWidth="2"/>
              {/* Server slots */}
              <rect x="20" y="25" width="40" height="8" rx="2" fill="#1f2937"/>
              <rect x="20" y="38" width="40" height="8" rx="2" fill="#1f2937"/>
              <rect x="20" y="51" width="40" height="8" rx="2" fill="#1f2937"/>
              <rect x="20" y="64" width="40" height="8" rx="2" fill="#1f2937"/>
              {/* LED indicators */}
              <circle cx="55" cy="29" r="2" fill="#22c55e" className="led-blink"/>
              <circle cx="55" cy="42" r="2" fill="#3b82f6" className="led-blink" style={{animationDelay: '0.5s'}}/>
              <circle cx="55" cy="55" r="2" fill="#f59e0b" className="led-blink" style={{animationDelay: '1s'}}/>
              <circle cx="55" cy="68" r="2" fill="#ef4444" className="led-blink" style={{animationDelay: '1.5s'}}/>
              {/* Base */}
              <rect x="10" y="80" width="60" height="6" rx="3" fill="#6b7280"/>
              {/* Glow effect */}
              <rect x="15" y="20" width="50" height="60" rx="4" fill="none" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1" className="tech-glow"/>
            </svg>
          </div>

          {/* Database */}
          <div className="floating-tech tech-element-3">
            <svg width="52" height="65" viewBox="0 0 80 100" className="tech-svg">
              {/* Database cylinders */}
              <ellipse cx="40" cy="25" rx="25" ry="8" fill="#7c3aed" stroke="#8b5cf6" strokeWidth="2"/>
              <rect x="15" y="25" width="50" height="15" fill="#7c3aed"/>
              <ellipse cx="40" cy="40" rx="25" ry="8" fill="#7c3aed" stroke="#8b5cf6" strokeWidth="2"/>
              <rect x="15" y="40" width="50" height="15" fill="#7c3aed"/>
              <ellipse cx="40" cy="55" rx="25" ry="8" fill="#7c3aed" stroke="#8b5cf6" strokeWidth="2"/>
              <rect x="15" y="55" width="50" height="15" fill="#7c3aed"/>
              <ellipse cx="40" cy="70" rx="25" ry="8" fill="#7c3aed" stroke="#8b5cf6" strokeWidth="2"/>
              {/* Data indicators */}
              <rect x="20" y="30" width="15" height="2" fill="#a855f7"/>
              <rect x="20" y="45" width="20" height="2" fill="#a855f7"/>
              <rect x="20" y="60" width="18" height="2" fill="#a855f7"/>
              {/* Glow effect */}
              <ellipse cx="40" cy="47" rx="28" ry="30" fill="none" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1" className="tech-glow"/>
            </svg>
          </div>

          {/* Flowchart */}
          <div className="floating-tech tech-element-4">
            <svg width="65" height="59" viewBox="0 0 100 90" className="tech-svg">
              {/* Start node */}
              <circle cx="20" cy="20" r="8" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2"/>
              {/* Process nodes */}
              <rect x="35" y="12" width="16" height="16" rx="2" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2"/>
              <rect x="60" y="35" width="16" height="16" rx="2" fill="#10b981" stroke="#34d399" strokeWidth="2"/>
              <rect x="35" y="58" width="16" height="16" rx="2" fill="#ef4444" stroke="#f87171" strokeWidth="2"/>
              {/* Decision diamond */}
              <polygon points="20,65 30,55 20,45 10,55" fill="#8b5cf6" stroke="#a78bfa" strokeWidth="2"/>
              {/* Arrows */}
              <line x1="28" y1="20" x2="35" y2="20" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <line x1="51" y1="20" x2="68" y2="35" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <line x1="68" y1="51" x2="51" y2="58" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <line x1="35" y1="66" x2="30" y2="60" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              {/* Arrow marker */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280"/>
                </marker>
              </defs>
              {/* Glow effect */}
              <rect x="5" y="5" width="90" height="80" rx="5" fill="none" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="1" className="tech-glow"/>
            </svg>
          </div>
        </div>

        {/* Hexagon Pattern */}
        <div className="absolute top-16 right-16 opacity-20 dark:opacity-10">
          <svg width="60" height="60" viewBox="0 0 60 60" className="animate-spin" style={{ animationDuration: '15s' }}>
            <polygon
              points="30,5 50,17.5 50,42.5 30,55 10,42.5 10,17.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-blue-400 dark:text-blue-300"
            />
          </svg>
        </div>
        <div className="absolute bottom-16 left-16 opacity-20 dark:opacity-10">
          <svg width="40" height="40" viewBox="0 0 60 60" className="animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
            <polygon
              points="30,5 50,17.5 50,42.5 30,55 10,42.5 10,17.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-purple-400 dark:text-purple-300"
            />
          </svg>
        </div>
      </div>
      
      {/* Add custom styles */}
      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(50px) translateY(50px); }
        }
        
        @keyframes aurora1 {
          0% { transform: translateX(-100%) translateY(-50%) rotate(0deg) scale(0.8); }
          50% { transform: translateX(0%) translateY(-30%) rotate(180deg) scale(1.2); }
          100% { transform: translateX(100%) translateY(-70%) rotate(360deg) scale(0.9); }
        }
        
        @keyframes aurora2 {
          0% { transform: translateX(100%) translateY(-30%) rotate(0deg) scale(1.1); }
          50% { transform: translateX(-50%) translateY(-60%) rotate(-180deg) scale(0.8); }
          100% { transform: translateX(-100%) translateY(-40%) rotate(-360deg) scale(1.3); }
        }
        
        @keyframes aurora3 {
          0% { transform: translateX(-50%) translateY(-80%) rotate(90deg) scale(0.7); }
          50% { transform: translateX(50%) translateY(-20%) rotate(-90deg) scale(1.1); }
          100% { transform: translateX(-30%) translateY(-60%) rotate(270deg) scale(0.9); }
        }
        
        @keyframes shooting {
          0% {
            opacity: 0;
            transform: translateX(-100px) translateY(100px);
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(100vw) translateY(-100px);
          }
        }
        
        .shooting-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: linear-gradient(45deg, #fff, #a855f7, #3b82f6);
          border-radius: 50%;
          box-shadow: 
            0 0 6px #fff,
            0 0 12px #a855f7,
            0 0 18px #3b82f6;
        }
        
        .shooting-star::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100px;
          height: 2px;
          background: linear-gradient(to right, rgba(255,255,255,0.8), transparent);
          transform: translateX(-100px) rotate(-45deg);
          border-radius: 2px;
        }
        
        .shooting-star-1 {
          top: 20%;
          left: 10%;
          animation: shooting 3s linear infinite;
          animation-delay: 0s;
        }
        
        .shooting-star-2 {
          top: 40%;
          left: 20%;
          animation: shooting 4s linear infinite;
          animation-delay: 1s;
        }
        
        .shooting-star-3 {
          top: 60%;
          left: 5%;
          animation: shooting 5s linear infinite;
          animation-delay: 2s;
        }
        
        .shooting-star-4 {
          top: 30%;
          left: 15%;
          animation: shooting 3.5s linear infinite;
          animation-delay: 3s;
        }
        
        .shooting-star-5 {
          top: 70%;
          left: 25%;
          animation: shooting 4.5s linear infinite;
          animation-delay: 4s;
        }
        
        @keyframes float-drift {
          0% {
            transform: translateX(-100px) translateY(0px) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          25% {
            transform: translateX(25vw) translateY(-30px) rotate(5deg) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateX(50vw) translateY(20px) rotate(-3deg) scale(1.1);
            opacity: 1;
          }
          75% {
            transform: translateX(75vw) translateY(-10px) rotate(2deg) scale(0.9);
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(15px) rotate(0deg) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes tech-glow {
          0%, 100% { 
            opacity: 0.3; 
            filter: drop-shadow(0 0 5px currentColor);
          }
          50% { 
            opacity: 0.7; 
            filter: drop-shadow(0 0 15px currentColor);
          }
        }
        
        @keyframes led-blink {
          0%, 70% { opacity: 1; }
          85%, 100% { opacity: 0.3; }
        }
        
        @keyframes code-flicker {
          0%, 90% { opacity: 1; }
          95%, 100% { opacity: 0.7; }
        }
        
        .floating-tech {
          position: absolute;
          z-index: 5;
        }
        
        .tech-element-1 {
          top: 20%;
          animation: float-drift 12s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .tech-element-2 {
          top: 45%;
          animation: float-drift 15s ease-in-out infinite;
          animation-delay: 4s;
        }
        
        .tech-element-3 {
          top: 65%;
          animation: float-drift 18s ease-in-out infinite;
          animation-delay: 8s;
        }
        
        .tech-element-4 {
          top: 30%;
          animation: float-drift 14s ease-in-out infinite;
          animation-delay: 12s;
        }
        
        .tech-glow {
          animation: tech-glow 2s ease-in-out infinite;
        }
        
        .led-blink {
          animation: led-blink 1.5s ease-in-out infinite;
        }
        
        .tech-svg {
          filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));
        }
        
        .tech-element-1 .tech-svg line {
          animation: code-flicker 3s ease-in-out infinite;
        }
      `}</style>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/landing')}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-2"
            title="Back to Home"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-16 w-auto object-contain"
          />
          <div className="w-10"></div>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-8">
          <button
            onClick={() => handleModeChange(true)}
            className={`flex-1 py-2 rounded-md transition ${isLogin ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => handleModeChange(false)}
            className={`flex-1 py-2 rounded-md transition ${!isLogin ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {syncError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
              Keycloak Sync Error: {syncError}
            </div>
          )}

          {isSyncing && (
            <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Syncing Keycloak user data...
            </div>
          )}

          {isKeycloakAuthenticated && isLocalAuthenticated && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm">
              ✅ Successfully authenticated with Keycloak and synced to local database
            </div>
          )}

          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  required={!isLogin}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  required={!isLogin}
                />
              </div>
            </>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-slate-500 dark:text-slate-400">or continue with</span>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => keycloakAuth.loginWithGoogle()}
            disabled={!keycloakAuth.isKeycloakReady}
            className="w-full py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button 
            onClick={() => keycloakAuth.login()}
            disabled={!keycloakAuth.isKeycloakReady}
            className="w-full py-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Login with Keycloak
          </button>
        </div>
      </div>
      <KeycloakStatus />
    </div>
  );
};

export default LoginPage;