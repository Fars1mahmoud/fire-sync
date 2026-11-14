import React from 'react';
import { EvacuationRoute, RouteId, RiskLevel } from './evacuationTypes';

interface RouteOptionsCardProps {
  routes: EvacuationRoute[];
  selectedRouteId: RouteId;
  lang: 'en' | 'ar';
  onSelectRoute: (routeId: RouteId) => void;
}

export function getRiskBadgeClasses(risk: RiskLevel): string {
  switch (risk) {
    case 'Low':
      return 'bg-[#0b382c] text-[#34d399] border border-[#10b981]/40';
    case 'Moderate':
      return 'bg-[#3d2e0b] text-[#fbbf24] border border-[#f59e0b]/40';
    case 'High':
      return 'bg-[#421319] text-[#f87171] border border-[#ef4444]/40';
  }
}

export const RouteOptionsCard: React.FC<RouteOptionsCardProps> = ({
  routes,
  selectedRouteId,
  lang,
  onSelectRoute,
}) => {
  const isAr = lang === 'ar';

  return (
    <section
      aria-labelledby="route-options-heading"
      className="rounded-xl border border-[#1d3b66]/80 bg-[#091526]/95 shadow-[0_8px_28px_rgba(2,8,20,0.45)] overflow-hidden flex-1 flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1d3b66]/70">
        <h2
          id="route-options-heading"
          className="text-[16px] font-semibold text-white tracking-tight"
        >
          {isAr ? 'خيارات الممرات المتاحة' : 'Route Options'}
        </h2>
        <span className="text-[12px] font-medium text-slate-400 tabular-nums">
          {routes.length} {isAr ? 'ممرات' : 'corridors'}
        </span>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1d3b66]/60 text-[12px] font-medium text-slate-400">
              <th scope="col" className="py-2.5 pl-4 pr-2 font-medium">
                {isAr ? 'المسار' : 'Route'}
              </th>
              <th scope="col" className="py-2.5 px-2 font-medium">
                {isAr ? 'المسافة' : 'Distance'}
              </th>
              <th scope="col" className="py-2.5 px-2 font-medium">
                {isAr ? 'الوقت' : 'Time'}
              </th>
              <th scope="col" className="py-2.5 pl-2 pr-4 font-medium text-center">
                {isAr ? 'مستوى الخطر' : 'Risk'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#183052]/70 text-[13px]">
            {routes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              return (
                <tr
                  key={route.id}
                  onClick={() => onSelectRoute(route.id)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#122e52]/90 border-l-4 border-l-blue-400'
                      : 'hover:bg-[#0f233d]/60'
                  }`}
                >
                  <td className="py-3.5 pl-4 pr-2 font-medium text-slate-100 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRoute(route.id);
                      }}
                      aria-pressed={isSelected}
                      className={`text-left font-semibold focus-visible:outline-none focus-visible:underline cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'text-blue-300'
                          : 'text-slate-100 hover:text-blue-300'
                      }`}
                    >
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: route.color }}
                      />
                      <span>{route.name}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-2 text-slate-200 tabular-nums whitespace-nowrap font-mono text-[12px]">
                    {route.distanceLabel}
                  </td>
                  <td className="py-3.5 px-2 text-slate-200 tabular-nums whitespace-nowrap font-mono text-[12px]">
                    {route.estTimeLabel}
                  </td>
                  <td className="py-3.5 pl-2 pr-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block min-w-[78px] rounded-md px-2.5 py-0.5 text-[12px] font-semibold text-center ${getRiskBadgeClasses(
                        route.riskLevel
                      )}`}
                    >
                      {route.riskLevel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
