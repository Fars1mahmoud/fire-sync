import React, { useState, useEffect } from 'react';
import './AuthModal.css';

export interface UserProfile {
  name?: string;
  phone: string;
  email: string;
  workplaceId?: string;
  role: 'admin' | 'user';
}

export const detectRoleFromInput = (input: string): 'admin' | 'user' => {
  const clean = (input || '').trim().toUpperCase();
  if (clean.includes('ADM') || clean.includes('NASA') || clean.includes('ID') || clean.includes('EMP')) {
    return 'admin';
  }
  return 'user';
};

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  lang?: 'en' | 'ar';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user' | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(null);
      setIsActivating(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectRole = (role: 'admin' | 'user') => {
    setSelectedRole(role);
    setIsActivating(true);

    const user: UserProfile = {
      name: role === 'admin' 
        ? (isAr ? 'مسؤول المنظومة' : 'System Admin')
        : (isAr ? 'مستخدم المنظومة' : 'Civilian User'),
      phone: role === 'admin' ? 'NASA-ADMIN-01' : '+1 (555) 019-2834',
      email: role === 'admin' ? 'admin@nasa-firesync.gov' : 'user@firesync-citizen.org',
      workplaceId: role === 'admin' ? 'NASA-HQ-01' : undefined,
      role,
    };

    try {
      localStorage.setItem('fire_intel_user', JSON.stringify(user));
      sessionStorage.setItem('fire_intel_user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('fire_intel_auth_change', { detail: user }));
    } catch (e) {
      console.warn('Storage write failed', e);
    }

    setTimeout(() => {
      onSuccess(user);
      onClose();
    }, 450);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="auth-modal-card" 
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
        style={{ maxWidth: '520px', padding: '32px 28px' }}
      >
        {/* Close Button */}
        <button 
          className="auth-modal-close" 
          onClick={onClose}
          aria-label="Close Modal"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Modal Header */}
        <div className="auth-modal-header" style={{ marginBottom: '24px' }}>
          <div className="auth-modal-logo">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <path 
                d="M16 2C16 2 24 9.5 24 18C24 22.4183 20.4183 26 16 26C11.5817 26 8 22.4183 8 18C8 13.5 12 7.5 16 2Z" 
                fill="url(#authFlameGrad)" 
              />
              <path 
                d="M16 11C16 11 20 15.5 20 20C20 22.2091 18.2091 24 16 24C13.7909 24 12 22.2091 12 20C12 17 14 13.5 16 11Z" 
                fill="#ffd166" 
              />
              <defs>
                <linearGradient id="authFlameGrad" x1="8" y1="2" x2="24" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ff4d4d" />
                  <stop offset="0.6" stopColor="#ff7700" />
                  <stop offset="1" stopColor="#ff9e00" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="auth-modal-title" style={{ fontSize: '22px' }}>
            {isAr ? 'هل أنت مسؤول إدارة أم مستخدم؟' : 'Are you an Admin or a User?'}
          </h2>
          <p className="auth-modal-subtitle" style={{ fontSize: '13px', marginTop: '6px', color: '#94a3b8' }}>
            {isAr 
              ? 'اختر دورك للدخول المباشر إلى المنظومة بدون الحاجة لأي تسجيل أو كلمات مرور:' 
              : 'Select your role to access the platform instantly with zero sign-up friction:'}
          </p>
        </div>

        {/* Two Big Role Selection Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* 1. Admin Option Card */}
          <div
            onClick={() => handleSelectRole('admin')}
            style={{
              padding: '18px 20px',
              borderRadius: '14px',
              border: selectedRole === 'admin' 
                ? '2px solid #00e5ff' 
                : '1px solid rgba(0, 229, 255, 0.35)',
              background: selectedRole === 'admin'
                ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.22) 0%, rgba(2, 132, 199, 0.32) 100%)'
                : 'linear-gradient(135deg, rgba(9, 28, 48, 0.8) 0%, rgba(6, 18, 32, 0.95) 100%)',
              cursor: isActivating ? 'default' : 'pointer',
              transition: 'all 0.22s ease',
              boxShadow: selectedRole === 'admin' 
                ? '0 0 25px rgba(0, 229, 255, 0.35)' 
                : '0 4px 18px rgba(0, 0, 0, 0.4)',
              transform: selectedRole === 'admin' ? 'scale(1.015)' : 'none',
            }}
            className="role-card-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🛡️</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
                    {isAr ? 'مسؤول إدارة (Admin Dashboard)' : 'Admin Dashboard'}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600' }}>
                    {isAr ? 'صلاحيات قيادة كاملة وإشراف لحظي' : 'Full Command & Analytics Access'}
                  </span>
                </div>
              </div>
              <span style={{ 
                background: 'rgba(0, 229, 255, 0.15)', 
                color: '#00e5ff', 
                border: '1px solid rgba(0, 229, 255, 0.35)', 
                borderRadius: '6px', 
                padding: '3px 8px', 
                fontSize: '11px', 
                fontWeight: '700' 
              }}>
                ADMIN
              </span>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
              {isAr 
                ? 'لوحة التحكم المركزية، رصد أقمار ناسا الصناعية (VIIRS & MODIS)، إدارة ممرات الإخلاء وتوجيه قوافل الإغاثة، وتحليل البنية التحتية.' 
                : 'Central enterprise dashboard, NASA FIRMS thermal telemetry, evacuation corridor management, convoy dispatch, and exposure analysis.'}
            </p>
            <button
              type="button"
              disabled={isActivating}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #00e5ff',
                background: 'linear-gradient(90deg, #0284c7 0%, #00b4d8 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 12px rgba(2, 132, 199, 0.4)',
              }}
            >
              <span>{isAr ? 'دخول كمسؤول إدارة (Admin)' : 'Continue as Admin'}</span>
              <span>→</span>
            </button>
          </div>

          {/* 2. Civilian User Option Card */}
          <div
            onClick={() => handleSelectRole('user')}
            style={{
              padding: '18px 20px',
              borderRadius: '14px',
              border: selectedRole === 'user' 
                ? '2px solid #ff7700' 
                : '1px solid rgba(255, 119, 0, 0.35)',
              background: selectedRole === 'user'
                ? 'linear-gradient(135deg, rgba(255, 119, 0, 0.22) 0%, rgba(217, 83, 79, 0.32) 100%)'
                : 'linear-gradient(135deg, rgba(38, 20, 8, 0.7) 0%, rgba(18, 11, 5, 0.95) 100%)',
              cursor: isActivating ? 'default' : 'pointer',
              transition: 'all 0.22s ease',
              boxShadow: selectedRole === 'user' 
                ? '0 0 25px rgba(255, 119, 0, 0.35)' 
                : '0 4px 18px rgba(0, 0, 0, 0.4)',
              transform: selectedRole === 'user' ? 'scale(1.015)' : 'none',
            }}
            className="role-card-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>👤</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
                    {isAr ? 'مستخدم عادي (Civilian User)' : 'Civilian User Portal'}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#fb923c', fontWeight: '600' }}>
                    {isAr ? 'واجهة السلامة والمواطنين' : 'Citizen Safety & Alerts'}
                  </span>
                </div>
              </div>
              <span style={{ 
                background: 'rgba(255, 119, 0, 0.15)', 
                color: '#ff9e00', 
                border: '1px solid rgba(255, 119, 0, 0.35)', 
                borderRadius: '6px', 
                padding: '3px 8px', 
                fontSize: '11px', 
                fontWeight: '700' 
              }}>
                USER
              </span>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
              {isAr 
                ? 'واجهة المواطن والسلامة: استعراض الحرائق القريبة، ممرات وملاجئ الإخلاء الآمنة، إرسال البلاغات الميدانية، ومتابعة جودة الهواء.' 
                : 'Citizen and safety portal: Nearby fire alerts, safe evacuation corridors, shelter capacity, air quality indices, and field reports.'}
            </p>
            <button
              type="button"
              disabled={isActivating}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #ff7700',
                background: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 12px rgba(234, 88, 12, 0.4)',
              }}
            >
              <span>{isAr ? 'دخول كمستخدم عادي (User)' : 'Continue as User'}</span>
              <span>→</span>
            </button>
          </div>

        </div>

        {isActivating && (
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(56, 189, 248, 0.3)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            <span>{isAr ? 'جاري فتح لوحة التحكم المحددة...' : 'Loading selected interface...'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
