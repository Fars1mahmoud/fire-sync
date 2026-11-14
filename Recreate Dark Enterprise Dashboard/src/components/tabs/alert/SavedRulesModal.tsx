import React from 'react';
import { X, Trash2, Bell, ShieldCheck, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { AlertRule } from './alertTypes';

interface SavedRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: AlertRule[];
  onDeleteRule: (id: string) => void;
  language: 'en' | 'ar';
}

export const SavedRulesModal: React.FC<SavedRulesModalProps> = ({
  isOpen,
  onClose,
  rules,
  onDeleteRule,
  language,
}) => {
  if (!isOpen) return null;
  const isAr = language === 'ar';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#091629] border border-[#1b3e6b] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-100"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#142d4f] flex items-center justify-between bg-[#0b1b33]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {isAr ? `قواعد التنبيه النشطة (${rules.length})` : `Active Alert Rules (${rules.length})`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#12243d] hover:bg-[#1a3356] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#1f3c64]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 max-h-[440px] overflow-y-auto space-y-3 scrollbar-thin">
          {rules.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">
              {isAr
                ? 'لا توجد قواعد تنبيه مخصصة حالياً. استخدم لوحة إنشاء القواعد لإضافة مشغلات جديدة.'
                : 'No custom alert rules configured yet. Use the Create Alert Rule panel to add triggers.'}
            </p>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-[#0c1c33] border border-[#183a66] rounded-2xl p-4 flex items-start justify-between gap-4 transition-all hover:border-blue-500/50"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-white">
                      {isAr && rule.triggerTypeAr ? rule.triggerTypeAr : rule.triggerType}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rule.riskLevel === 'Critical'
                          ? 'bg-red-600 text-white'
                          : rule.riskLevel === 'High'
                          ? 'bg-orange-600 text-white'
                          : 'bg-yellow-500 text-slate-950 font-bold'
                      }`}
                    >
                      {rule.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {isAr ? 'المنطقة:' : 'Region:'}{' '}
                    <strong className="text-slate-100 font-medium">
                      {isAr && rule.regionAr ? rule.regionAr : rule.region}
                    </strong>
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-blue-400" /> Email: {rule.channels.email ? '✓' : '✕'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-cyan-400" /> SMS: {rule.channels.sms ? '✓' : '✕'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-emerald-400" /> In-App: {rule.channels.inApp ? '✓' : '✕'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteRule(rule.id)}
                  className="text-slate-500 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
                  title={isAr ? 'حذف القاعدة' : 'Delete rule'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#071222] border-t border-[#142d4f] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

