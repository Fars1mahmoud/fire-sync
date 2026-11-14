import React, { useMemo } from 'react';
import { getAqiCategory, getGaugeAngle } from './smokeTypes';
import { Activity, MapPin, ShieldAlert, Sparkles } from 'lucide-react';

interface AirQualityGaugeProps {
  aqi: number;
  pm25?: number;
  city?: string;
  language: 'en' | 'ar';
  metric?: string;
  onFilterCategory?: (cat: string) => void;
}

export const AirQualityGauge: React.FC<AirQualityGaugeProps> = ({
  aqi,
  pm25 = 82.5,
  city = 'Manaus',
  language,
  metric = 'all',
  onFilterCategory,
}) => {
  const isAr = language === 'ar';
  const info = getAqiCategory(aqi, language);

  // Derive metric specific value and unit
  let displayValue: string | number = aqi;
  let metricUnit = isAr ? 'مؤشر جودة الهواء القياسي' : 'Air Quality Index';
  let metricLabel = isAr ? info.labelAr : info.label;

  if (metric === 'pm25') {
    displayValue = pm25;
    metricUnit = 'µg/m³ (PM2.5)';
    metricLabel = pm25 > 55 ? (isAr ? 'تركيز حرج' : 'Critical') : (isAr ? 'معتدل' : 'Moderate');
  } else if (metric === 'no2') {
    displayValue = (12.4 + (aqi / 20)).toFixed(1);
    metricUnit = '×10¹⁵ mol/cm² (NO₂)';
    metricLabel = isAr ? 'انبعاثات أكاسيد النيتروجين' : 'Tropospheric NO₂';
  } else if (metric === 'co') {
    displayValue = (3.2 + (aqi / 35)).toFixed(1);
    metricUnit = 'ppm (CO)';
    metricLabel = isAr ? 'أول أكسيد الكربون' : 'Carbon Monoxide';
  }

  // Refined SVG Dimensions
  const width = 290;
  const height = 168;
  const cx = 145;
  const cy = 142;
  const r = 98;
  const strokeWidth = 14;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, arcSweep, 0, end.x, end.y].join(' ');
  };

  // Clamped angle calculation (0 to 300+ AQI mapped onto 0 to 180 degrees)
  const clampedAqi = Math.max(0, Math.min(aqi, 300));
  const activeAngle = (clampedAqi / 300) * 180;
  const beadPoint = polarToCartesian(cx, cy, r, activeAngle);

  // Radial tick marks around arc
  const ticks = useMemo(() => {
    const majorValues = [
      { val: 0, label: '0' },
      { val: 50, label: '50' },
      { val: 100, label: '100' },
      { val: 150, label: '150' },
      { val: 200, label: '200' },
      { val: 300, label: '300+' },
    ];

    return majorValues.map((m) => {
      const angle = (m.val / 300) * 180;
      const inner = polarToCartesian(cx, cy, r - strokeWidth / 2 - 3, angle);
      const outer = polarToCartesian(cx, cy, r + strokeWidth / 2 + 5, angle);
      const textPos = polarToCartesian(cx, cy, r + strokeWidth / 2 + 15, angle);
      return { ...m, inner, outer, textPos };
    });
  }, [cx, cy, r, strokeWidth]);

  // Minor ticks for added precision
  const minorTicks = useMemo(() => {
    const list = [];
    for (let v = 25; v < 300; v += 25) {
      if (v % 50 === 0) continue;
      const angle = (v / 300) * 180;
      const inner = polarToCartesian(cx, cy, r + strokeWidth / 2 + 2, angle);
      const outer = polarToCartesian(cx, cy, r + strokeWidth / 2 + 6, angle);
      list.push({ val: v, inner, outer });
    }
    return list;
  }, [cx, cy, r, strokeWidth]);

  // 6 Tier Official Categories matching EPA Standard
  const tiers = [
    {
      id: 'good',
      labelEn: 'Good',
      labelAr: 'جيد',
      range: '0–50',
      color: '#10b981',
      active: aqi <= 50,
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
    },
    {
      id: 'moderate',
      labelEn: 'Moderate',
      labelAr: 'معتدل',
      range: '51–100',
      color: '#eab308',
      active: aqi > 50 && aqi <= 100,
      bg: 'rgba(234, 179, 8, 0.15)',
      border: 'rgba(234, 179, 8, 0.4)',
    },
    {
      id: 'sensitive',
      labelEn: 'Sensitive',
      labelAr: 'حساس',
      range: '101–150',
      color: '#f97316',
      active: aqi > 100 && aqi <= 150,
      bg: 'rgba(249, 115, 22, 0.15)',
      border: 'rgba(249, 115, 22, 0.4)',
    },
    {
      id: 'unhealthy',
      labelEn: 'Unhealthy',
      labelAr: 'غير صحي',
      range: '151–200',
      color: '#ef4444',
      active: aqi > 150 && aqi <= 200,
      bg: 'rgba(239, 68, 68, 0.18)',
      border: 'rgba(239, 68, 68, 0.5)',
    },
    {
      id: 'very-unhealthy',
      labelEn: 'Very Unhealthy',
      labelAr: 'حرج جداً',
      range: '201–300',
      color: '#a855f7',
      active: aqi > 200 && aqi <= 300,
      bg: 'rgba(168, 85, 247, 0.18)',
      border: 'rgba(168, 85, 247, 0.5)',
    },
    {
      id: 'hazardous',
      labelEn: 'Hazardous',
      labelAr: 'خطير طارئ',
      range: '301+',
      color: '#991b1b',
      active: aqi > 300,
      bg: 'rgba(153, 27, 27, 0.22)',
      border: 'rgba(153, 27, 27, 0.6)',
    },
  ];

  return (
    <div className="relative bg-gradient-to-b from-[#0c182c]/95 via-[#091325]/95 to-[#060e1b]/98 border border-[#1d3254] hover:border-cyan-500/40 rounded-2xl p-4 shadow-[0_12px_36px_rgba(0,0,0,0.5)] backdrop-blur-xl select-none flex flex-col justify-between transition-all duration-300 group">
      {/* Background Ambient Glow Tinted with Current Severity */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-25"
        style={{ backgroundColor: info.color }}
      />

      {/* Header with Live Telemetry Icon and City Beacon */}
      <div className="relative z-10 flex items-center justify-between mb-1 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-white font-extrabold text-sm sm:text-base tracking-wide flex items-center gap-1.5">
              <span>{isAr ? 'مؤشر جودة الهواء' : 'Air Quality Index'}</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-1.5 py-0.2 rounded font-normal">
                EPA AQI
              </span>
            </h2>
          </div>
        </div>

        {city && (
          <div className="flex items-center gap-1.5 bg-[#0b162a]/90 px-2.5 py-1 rounded-full border border-slate-700/70 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span className="text-[11px] font-semibold text-slate-200 font-mono">
              {city}
            </span>
          </div>
        )}
      </div>

      {/* High-Precision Instrument Speedometer SVG */}
      <div className="relative z-10 flex flex-col items-center justify-center my-0.5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[270px] overflow-visible drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* Multi-stop smooth neon gradient */}
            <linearGradient id="tacticalGaugeGradient" x1="0%" y1="100%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="25%" stopColor="#eab308" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="72%" stopColor="#ef4444" />
              <stop offset="88%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            {/* Glowing neon filters */}
            <filter id="arcBloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="pipGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Recessed Background Track with subtle rim glow */}
          <path
            d={describeArc(cx, cy, r, 0, 180)}
            fill="none"
            stroke="#0b172a"
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
          />
          <path
            d={describeArc(cx, cy, r, 0, 180)}
            fill="none"
            stroke="#13233c"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Subtle Minor Ticks */}
          {minorTicks.map((t, idx) => (
            <line
              key={`minor-${idx}`}
              x1={t.inner.x}
              y1={t.inner.y}
              x2={t.outer.x}
              y2={t.outer.y}
              stroke="#334155"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.6"
            />
          ))}

          {/* Major Radial Calibration Ticks & Numbers */}
          {ticks.map((t, idx) => (
            <g key={`major-${idx}`}>
              <line
                x1={t.inner.x}
                y1={t.inner.y}
                x2={t.outer.x}
                y2={t.outer.y}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <text
                x={t.textPos.x}
                y={t.textPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="8.5"
                fontWeight="600"
                fill="#94a3b8"
                fontFamily="ui-monospace, monospace"
              >
                {t.label}
              </text>
            </g>
          ))}

          {/* Active Glowing Filled Arc (Progressive from 0 to current AQI) */}
          {activeAngle > 0.5 && (
            <>
              {/* Outer soft glow blur */}
              <path
                d={describeArc(cx, cy, r, 0, activeAngle)}
                fill="none"
                stroke="url(#tacticalGaugeGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                filter="url(#arcBloom)"
                opacity="0.65"
              />
              {/* Crisp top arc */}
              <path
                d={describeArc(cx, cy, r, 0, activeAngle)}
                fill="none"
                stroke="url(#tacticalGaugeGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </>
          )}

          {/* Precision Radiant Indicator Bead Pip */}
          <g className="transition-all duration-700 ease-out">
            {/* Outer halo */}
            <circle
              cx={beadPoint.x}
              cy={beadPoint.y}
              r="11"
              fill={info.color}
              opacity="0.3"
              filter="url(#pipGlow)"
            />
            {/* Middle metallic rim */}
            <circle
              cx={beadPoint.x}
              cy={beadPoint.y}
              r="7"
              fill="#08101e"
              stroke="#ffffff"
              strokeWidth="2.2"
              filter="url(#pipGlow)"
            />
            {/* Inner radiant pearl */}
            <circle
              cx={beadPoint.x}
              cy={beadPoint.y}
              r="3.5"
              fill={info.color}
            />
          </g>
        </svg>

        {/* Center Tactical HUD Readout Display */}
        <div className="absolute top-[48px] flex flex-col items-center justify-center pointer-events-none">
          <div className="flex items-baseline gap-1">
            <span
              className="text-4xl sm:text-[44px] font-black tracking-tight leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] font-mono text-white"
            >
              {displayValue}
            </span>
          </div>

          <span className="text-[10px] text-slate-400 font-mono mt-1 font-medium tracking-wider uppercase">
            {metricUnit}
          </span>

          {/* Pill Badge with Status Tint and Pulse Dot */}
          <div
            className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold border shadow-lg backdrop-blur-md transition-all duration-300"
            style={{
              backgroundColor: `${info.color}22`,
              borderColor: `${info.color}66`,
              color: info.color,
              boxShadow: `0 0 14px ${info.color}33`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{ backgroundColor: info.color }}
            />
            <span className="tracking-wide">
              {metricLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Modern 6-Tier Segmented Scale Matrix (Replaces loose dots) */}
      <div className="relative z-10 mt-2 pt-2.5 border-t border-slate-800/80 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-0.5 mb-0.5">
          <span>{isAr ? 'نطاقات معيار EPA الأمريكي' : 'EPA Health Threat Matrix'}</span>
          <span className="text-cyan-400 font-semibold">{isAr ? '0–500 مقياس' : '0–500 Scale'}</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {tiers.map((tier) => {
            const isCurrent = tier.active;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onFilterCategory?.(tier.id)}
                className={`relative flex items-center justify-between px-2 py-1.5 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'border-2 shadow-[0_0_12px_rgba(0,0,0,0.4)] scale-[1.02] z-10'
                    : 'border-slate-800/70 hover:border-slate-700 bg-[#091222]/60 hover:bg-[#0c182c]'
                }`}
                style={{
                  backgroundColor: isCurrent ? tier.bg : undefined,
                  borderColor: isCurrent ? tier.color : undefined,
                  boxShadow: isCurrent ? `0 0 14px ${tier.color}33` : undefined,
                }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${isCurrent ? 'animate-pulse ring-2 ring-white/50' : ''}`}
                    style={{ backgroundColor: tier.color }}
                  />
                  <span
                    className={`text-[11px] truncate ${
                      isCurrent ? 'font-bold text-white' : 'font-medium text-slate-300'
                    }`}
                  >
                    {isAr ? tier.labelAr : tier.labelEn}
                  </span>
                </div>

                <span
                  className={`text-[9.5px] font-mono ml-1 ${
                    isCurrent ? 'text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  {tier.range}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
