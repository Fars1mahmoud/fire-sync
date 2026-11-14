import React from 'react';
import { Users, ShieldCheck, AlertOctagon, Truck, Flame, Radio } from 'lucide-react';
import { EvacuationSummaryData } from './evacuationTypes';

interface EvacuationSummaryHUDProps {
  summary: EvacuationSummaryData;
  lang: 'en' | 'ar';
}

export const EvacuationSummaryHUD: React.FC<EvacuationSummaryHUDProps> = ({ summary, lang }) => {
  const isAr = lang === 'ar';

  const cards = [
    {
      id: 'evacuees',
      label: isAr ? 'إجمالي المحتشدين للإخلاء' : 'Total Evacuees Staged',
      value: summary.totalEvacueesStaged.toLocaleString(),
      subtext: isAr ? 'في مراكز التجمع الآمنة' : 'In Designated Staging Hubs',
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/40',
      borderColor: 'border-cyan-500/30',
    },
    {
      id: 'corridors',
      label: isAr ? 'الممرات الآمنة المفتوحة' : 'Open Safe Corridors',
      value: `${summary.safeCorridorsActive} / 3`,
      subtext: isAr ? 'طرق مؤمنة ومراقبة بالأقمار' : 'Satellite Monitored Active',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500/30',
    },
    {
      id: 'blocked',
      label: isAr ? 'قطاعات الطرق المغلقة' : 'Blocked Road Segments',
      value: summary.blockedRoadSegments,
      subtext: isAr ? 'بسبب الأدخنة وجبهات اللهب' : 'Smoke Hazard & Fallen Debris',
      icon: AlertOctagon,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/40',
      borderColor: 'border-rose-500/30',
    },
    {
      id: 'convoys',
      label: isAr ? 'قوافل المرافقة المتحركة' : 'Active Escort Convoys',
      value: summary.activeConvoys,
      subtext: isAr ? 'مستعدة للتأمين الميداني' : 'Armed / Medical Pilot Escorts',
      icon: Truck,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/40',
      borderColor: 'border-blue-500/30',
    },
    {
      id: 'fire-proximity',
      label: isAr ? 'أقرب جبهة نيران للمسارات' : 'Closest Fire Proximity',
      value: `${summary.closestFireKm} km`,
      subtext: `Max FRP: ${summary.highestFRP} MW (NASA FIRMS)`,
      icon: Flame,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`rounded-xl border ${card.borderColor} ${card.bgColor} p-3.5 shadow-[0_4px_18px_rgba(2,8,20,0.35)] backdrop-blur-sm transition-transform hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-medium text-slate-300 truncate">
                {card.label}
              </span>
              <IconComponent className={`w-4 h-4 ${card.color} shrink-0`} />
            </div>
            <div className="text-[20px] font-bold text-white font-mono tracking-tight">
              {card.value}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
