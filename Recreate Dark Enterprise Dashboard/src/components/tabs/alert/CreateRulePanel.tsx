import React, { useState } from 'react';
import { RotateCw, ChevronDown, Check, ShieldCheck, Bell, Send } from 'lucide-react';
import { SeverityLevel, AlertRule } from './alertTypes';

interface CreateRulePanelProps {
  onSaveRule: (rule: Omit<AlertRule, 'id' | 'createdAt'>) => void;
  savedRulesCount: number;
  onOpenRulesModal: () => void;
  language: 'en' | 'ar';
}

export const CreateRulePanel: React.FC<CreateRulePanelProps> = ({
  onSaveRule,
  savedRulesCount,
  onOpenRulesModal,
  language,
}) => {
  const isAr = language === 'ar';

  const [triggerType, setTriggerType] = useState('New Fire Detection');
  const [riskLevel, setRiskLevel] = useState<SeverityLevel>('High');
  const [region, setRegion] = useState('Brazil (Amazon)');
  const [channels, setChannels] = useState({
    email: true,
    sms: true,
    inApp: true,
  });

  // Dropdown open states
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [isRiskOpen, setIsRiskOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const triggerOptions = [
    { en: 'New Fire Detection', ar: 'رصد اشتعال حريق جديد' },
    { en: 'Thermal Anomaly Spike', ar: 'قفزة مفاجئة في البصمة الحرارية' },
    { en: 'Rapid Perimeter Expansion', ar: 'توسع سريع في محيط النيران' },
    { en: 'Smoke Plume Incursion', ar: 'توغل عمود الدخان نحو المدن' },
    { en: 'Weather Fire-Risk Warning', ar: 'تحذير طقس حرج لنشوب حرائق' },
  ];

  const riskOptions: SeverityLevel[] = ['Critical', 'High', 'Moderate', 'Low'];

  const regionOptions = [
    { en: 'Brazil (Amazon)', ar: 'البرازيل (حوض الأمازون)' },
    { en: 'Brazil (Cerrado)', ar: 'البرازيل (إقليم السيرادو)' },
    { en: 'Canada (Boreal Belt)', ar: 'كندا (الحزام الشمالي)' },
    { en: 'Egypt & Mediterranean', ar: 'مصر وحوض المتوسط' },
    { en: 'Bolivia (Chiquitania)', ar: 'بوليفيا (تشيكيتانيا)' },
    { en: 'United States (California)', ar: 'الولايات المتحدة (كاليفورنيا)' },
    { en: 'Australia (Northern Territory)', ar: 'أستراليا (الإقليم الشمالي)' },
  ];

  const handleReset = () => {
    setIsSpinning(true);
    setTriggerType('New Fire Detection');
    setRiskLevel('High');
    setRegion('Brazil (Amazon)');
    setChannels({ email: true, sms: true, inApp: true });
    setTimeout(() => setIsSpinning(false), 500);
  };

  const handleSave = () => {
    onSaveRule({
      triggerType,
      riskLevel,
      region,
      channels,
    });
  };

  return (
    <div className="bg-[#091526]/95 border border-[#142d4f] rounded-2xl p-5 shadow-xl shadow-black/40 flex flex-col justify-between h-full min-h-[580px] select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{isAr ? 'إنشاء قاعدة تنبيه' : 'Create Alert Rule'}</span>
          </h2>
          <button
            type="button"
            onClick={handleReset}
            title={isAr ? 'إعادة ضبط النموذج' : 'Reset rule form'}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Trigger Type */}
          <div className="relative">
            <label className="block text-xs font-medium text-[#7d93b2] mb-1.5">
              {isAr ? 'نوع الحدث المشغل (Trigger Type)' : 'Trigger Type'}
            </label>
            <button
              type="button"
              onClick={() => {
                setIsTriggerOpen(!isTriggerOpen);
                setIsRiskOpen(false);
                setIsRegionOpen(false);
              }}
              className="w-full bg-[#0c1c33] border border-[#1a385f] hover:border-blue-500/70 rounded-xl px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-slate-100 flex items-center justify-between transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <span className="truncate">
                {isAr
                  ? triggerOptions.find((t) => t.en === triggerType)?.ar || triggerType
                  : triggerType}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2 ${
                  isTriggerOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isTriggerOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#09172c] border border-[#1c3e6b] rounded-xl shadow-2xl py-1 z-30 backdrop-blur-md">
                {triggerOptions.map((opt) => (
                  <button
                    key={opt.en}
                    type="button"
                    onClick={() => {
                      setTriggerType(opt.en);
                      setIsTriggerOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-blue-600/20 hover:text-white cursor-pointer ${
                      triggerType === opt.en ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'
                    }`}
                  >
                    {isAr ? opt.ar : opt.en}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Risk Level */}
          <div className="relative">
            <label className="block text-xs font-medium text-[#7d93b2] mb-1.5">
              {isAr ? 'مستوى الخطورة (Risk Level)' : 'Risk Level'}
            </label>
            <button
              type="button"
              onClick={() => {
                setIsRiskOpen(!isRiskOpen);
                setIsTriggerOpen(false);
                setIsRegionOpen(false);
              }}
              className="w-full bg-[#0c1c33] border border-[#1a385f] hover:border-blue-500/70 rounded-xl px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-slate-100 flex items-center justify-between transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <span className="truncate">{riskLevel}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2 ${
                  isRiskOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isRiskOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#09172c] border border-[#1c3e6b] rounded-xl shadow-2xl py-1 z-30 backdrop-blur-md">
                {riskOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setRiskLevel(opt);
                      setIsRiskOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-blue-600/20 hover:text-white cursor-pointer ${
                      riskLevel === opt ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Region */}
          <div className="relative">
            <label className="block text-xs font-medium text-[#7d93b2] mb-1.5">
              {isAr ? 'المنطقة الجغرافية المستهدفة' : 'Target Region'}
            </label>
            <button
              type="button"
              onClick={() => {
                setIsRegionOpen(!isRegionOpen);
                setIsTriggerOpen(false);
                setIsRiskOpen(false);
              }}
              className="w-full bg-[#0c1c33] border border-[#1a385f] hover:border-blue-500/70 rounded-xl px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-slate-100 flex items-center justify-between transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <span className="truncate">
                {isAr ? regionOptions.find((r) => r.en === region)?.ar || region : region}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2 ${
                  isRegionOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isRegionOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#09172c] border border-[#1c3e6b] rounded-xl shadow-2xl py-1 z-30 backdrop-blur-md max-h-48 overflow-y-auto scrollbar-thin">
                {regionOptions.map((opt) => (
                  <button
                    key={opt.en}
                    type="button"
                    onClick={() => {
                      setRegion(opt.en);
                      setIsRegionOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-blue-600/20 hover:text-white cursor-pointer ${
                      region === opt.en ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'
                    }`}
                  >
                    {isAr ? opt.ar : opt.en}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="block text-xs font-medium text-[#7d93b2] mb-2">
              {isAr ? 'قنوات الإشعار الفوري' : 'Notification Channels'}
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-200 hover:text-white">
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                  className="rounded border-[#1a385f] bg-[#0c1c33] text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>{isAr ? 'البريد الإلكتروني (Email Broadcast)' : 'Email Dispatch'}</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-200 hover:text-white">
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="rounded border-[#1a385f] bg-[#0c1c33] text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>{isAr ? 'رسائل SMS / البث الخلوي الطارئ' : 'Emergency SMS / Cell Broadcast'}</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-200 hover:text-white">
                <input
                  type="checkbox"
                  checked={channels.inApp}
                  onChange={(e) => setChannels({ ...channels, inApp: e.target.checked })}
                  className="rounded border-[#1a385f] bg-[#0c1c33] text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>{isAr ? 'إشعارات المنصة الحية (In-App Push)' : 'In-App Live Push HUD'}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-5 border-t border-[#142d4f] space-y-2.5">
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl bg-[#0070f3] hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-[0_2px_12px_rgba(0,112,243,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span>{isAr ? 'حفظ وتفعيل القاعدة' : 'Save & Activate Rule'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenRulesModal}
          className="w-full py-2 rounded-xl bg-[#0c1d34] hover:bg-[#122846] border border-[#1b3d68] text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {isAr ? `القواعد النشطة (${savedRulesCount})` : `Active Rules (${savedRulesCount})`}
          </span>
        </button>
      </div>
    </div>
  );
};

