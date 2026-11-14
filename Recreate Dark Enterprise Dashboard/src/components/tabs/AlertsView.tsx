import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  Radio, 
  RefreshCw, 
  CheckCircle2, 
  Flame, 
  X, 
  PlusCircle, 
  Sparkles,
  Layers,
  Send
} from 'lucide-react';
import { AlertFiltersPanel } from './alert/AlertFiltersPanel';
import { AlertFeedPanel } from './alert/AlertFeedPanel';
import { CreateRulePanel } from './alert/CreateRulePanel';
import { AlertDetailModal } from './alert/AlertDetailModal';
import { SavedRulesModal } from './alert/SavedRulesModal';
import { 
  AlertItem, 
  AlertRule, 
  SeverityLevel, 
  AlertStatus, 
  INITIAL_ALERTS, 
  INITIAL_RULES 
} from './alert/alertTypes';
import { AlertApiService } from './alert/alertApiService';
import './alert/AlertView.css';

interface AlertsViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ lang, selectedRegion }) => {
  const isAr = lang === 'ar';

  // Core alerts state
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const overrides = AlertApiService.loadStatusOverrides();
    return INITIAL_ALERTS.map((a) => (overrides[a.id] ? { ...a, status: overrides[a.id] } : a));
  });

  // Core rules state
  const [rules, setRules] = useState<AlertRule[]>(() => {
    const saved = AlertApiService.loadSavedRules();
    return saved.length > 0 ? [...saved, ...INITIAL_RULES] : INITIAL_RULES;
  });

  // Filters state
  const [selectedSeverities, setSelectedSeverities] = useState<SeverityLevel[]>([
    'Critical',
    'High',
    'Moderate',
    'Low',
  ]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'custom'>('all');
  const [selectedStatuses, setSelectedStatuses] = useState<AlertStatus[]>([
    'Unresolved',
    'Acknowledged',
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [timeFormat, setTimeFormat] = useState<'arabic' | 'english'>(isAr ? 'arabic' : 'english');

  // Selection & Modal states
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [selectedAlertIds, setSelectedAlertIds] = useState<string[]>([]);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Backend connection status
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync backend data on mount or region change
  useEffect(() => {
    let isMounted = true;
    const syncBackend = async () => {
      setIsLoadingBackend(true);
      const isAlive = await AlertApiService.checkHealth();
      if (!isMounted) return;
      setBackendOnline(isAlive);

      if (isAlive) {
        const liveBackendAlerts = await AlertApiService.fetchBackendAlerts(selectedRegion);
        if (isMounted && liveBackendAlerts.length > 0) {
          setAlerts((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const fresh = liveBackendAlerts.filter((a) => !existingIds.has(a.id));
            return [...fresh, ...prev];
          });
        }
      }
      setIsLoadingBackend(false);
    };

    syncBackend();
    return () => {
      isMounted = false;
    };
  }, [selectedRegion]);

  // Severity counts
  const severityCounts = useMemo(() => {
    const counts: Record<SeverityLevel, number> = {
      Critical: 0,
      High: 0,
      Moderate: 0,
      Low: 0,
    };
    alerts.forEach((alt) => {
      if (counts[alt.severity] !== undefined) {
        counts[alt.severity]++;
      }
    });
    return counts;
  }, [alerts]);

  // Toggle severity
  const handleToggleSeverity = (sev: SeverityLevel) => {
    if (selectedSeverities.includes(sev)) {
      if (selectedSeverities.length > 1) {
        setSelectedSeverities(selectedSeverities.filter((s) => s !== sev));
      } else {
        setSelectedSeverities(['Critical', 'High', 'Moderate', 'Low']);
      }
    } else {
      setSelectedSeverities([...selectedSeverities, sev]);
    }
  };

  // Status handlers
  const handleSelectAllStatuses = () => {
    setStatusFilter('all');
    setSelectedStatuses(['Unresolved', 'Acknowledged', 'Resolved']);
  };

  const handleToggleStatus = (st: AlertStatus) => {
    setStatusFilter('custom');
    if (selectedStatuses.includes(st)) {
      if (selectedStatuses.length > 1) {
        setSelectedStatuses(selectedStatuses.filter((s) => s !== st));
      } else {
        setSelectedStatuses(['Unresolved', 'Acknowledged']);
      }
    } else {
      setSelectedStatuses([...selectedStatuses, st]);
    }
  };

  // Filtered and sorted alerts
  const filteredAlerts = useMemo(() => {
    return alerts
      .filter((alert) => {
        // Severity filter
        if (!selectedSeverities.includes(alert.severity)) return false;

        // Status filter
        if (statusFilter === 'custom' && !selectedStatuses.includes(alert.status)) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = alert.title.toLowerCase().includes(q) || (alert.titleAr && alert.titleAr.includes(q));
          const matchSub = alert.subtitle.toLowerCase().includes(q) || (alert.subtitleAr && alert.subtitleAr.includes(q));
          const matchRegion = alert.region.toLowerCase().includes(q) || (alert.regionAr && alert.regionAr.includes(q));
          if (!matchTitle && !matchSub && !matchRegion) return false;
        }

        return true;
      })
      .sort((a, b) => {
        return sortOrder === 'desc'
          ? b.timestamp - a.timestamp
          : a.timestamp - b.timestamp;
      });
  }, [alerts, selectedSeverities, statusFilter, selectedStatuses, searchQuery, sortOrder]);

  // Selection handlers
  const handleToggleSelectAlert = (id: string) => {
    if (selectedAlertIds.includes(id)) {
      setSelectedAlertIds(selectedAlertIds.filter((item) => item !== id));
    } else {
      setSelectedAlertIds([...selectedAlertIds, id]);
    }
  };

  const handleSelectAllAlerts = () => {
    if (selectedAlertIds.length === filteredAlerts.length) {
      setSelectedAlertIds([]);
    } else {
      setSelectedAlertIds(filteredAlerts.map((a) => a.id));
    }
  };

  // Rule creation
  const handleSaveRule = (ruleData: Omit<AlertRule, 'id' | 'createdAt'>) => {
    const newRule: AlertRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      createdAt: Date.now(),
    };
    AlertApiService.saveRule(newRule);
    setRules((prev) => [newRule, ...prev]);
    showToast(
      isAr
        ? `تم تفعيل وحفظ قاعدة التنبيه: "${newRule.triggerType}" بنجاح!`
        : `Alert rule "${newRule.triggerType}" saved! Active for ${newRule.region}.`
    );
  };

  const handleDeleteRule = (id: string) => {
    AlertApiService.deleteRule(id);
    setRules((prev) => prev.filter((r) => r.id !== id));
    showToast(isAr ? 'تم حذف قاعدة التنبيه.' : 'Alert rule deleted.');
  };

  // Update alert status
  const handleUpdateAlertStatus = (id: string, newStatus: AlertStatus) => {
    AlertApiService.saveStatusOverride(id, newStatus);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    showToast(
      isAr
        ? `تم تحديث حالة الإنذار إلى: ${newStatus === 'Acknowledged' ? 'تم الاستلام' : 'تمت المعالجة'}`
        : `Alert marked as ${newStatus}.`
    );
  };

  // Simulate new detection from space
  const handleSimulateAlert = () => {
    const simulatedSeverities: SeverityLevel[] = ['Critical', 'High', 'Moderate'];
    const randomSev = simulatedSeverities[Math.floor(Math.random() * simulatedSeverities.length)];

    const sampleAlerts = [
      {
        title: 'Thermal Spike Anomaly',
        titleAr: 'قفزة مفاجئة في البصمة الحرارية',
        subtitle: 'High Infrared Signature Detected in Forest Canopy',
        subtitleAr: 'بصمة حرارية مرتفعة جداً تحت المظلة الشجرية',
        region: 'Brazil (Acre Frontier)',
        regionAr: 'البرازيل (حدود إقليم آكري)',
        frpMw: 710,
        coordinates: { lat: -9.0238, lng: -70.812 },
      },
      {
        title: 'Perimeter Breach Detected',
        titleAr: 'اختراق خط حماية المحمية الطبيعية',
        subtitle: 'Fire Rapidly Moving Toward Reserve Boundary',
        subtitleAr: 'ألسنة اللهب تتقدم بسرعة نحو حدود المحمية',
        region: 'Bolivia (San Ignacio)',
        regionAr: 'بوليفيا (سان إغناسيو)',
        frpMw: 490,
        coordinates: { lat: -16.372, lng: -60.954 },
      },
      {
        title: 'Dense Smoke Plume',
        titleAr: 'عمود دخان كثيف سام',
        subtitle: 'Air Quality Index Approaching Hazardous Level',
        subtitleAr: 'مؤشر جودة الهواء يقترب من المستويات الخطرة',
        region: 'Brazil (Manaus Perimeter)',
        regionAr: 'البرازيل (محيط ماناوس)',
        frpMw: 230,
        coordinates: { lat: -3.119, lng: -60.0217 },
      },
    ];

    const pick = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];

    const newAlert: AlertItem = {
      id: `alt-${Date.now()}`,
      title: pick.title,
      titleAr: pick.titleAr,
      subtitle: pick.subtitle,
      subtitleAr: pick.subtitleAr,
      severity: randomSev,
      status: 'Unresolved',
      timeArabic: 'الآن',
      timeEnglish: 'Just now',
      timestamp: Date.now(),
      region: pick.region,
      regionAr: pick.regionAr,
      coordinates: pick.coordinates,
      frpMw: pick.frpMw,
      confidence: 97,
      windSpeed: '26 km/h ENE',
      windSpeedAr: '26 كم/ساعة شمال شرق',
      humidity: '18% RH',
      satellite: 'VIIRS / NOAA-20 Suomi-NPP',
    };

    setAlerts((prev) => [newAlert, ...prev]);
    showToast(
      isAr
        ? `🚨 تم رصد إنذار طارئ جديد: "${newAlert.titleAr}" [${newAlert.severity}]`
        : `🚨 New Alert Received: "${newAlert.title}" [${newAlert.severity}]`
    );
  };

  return (
    <div className="alerts-tab-container select-none">
      {/* Top Tactical HUD Bar */}
      <div className="alerts-top-hud">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-white text-base sm:text-lg font-bold tracking-tight">
                {isAr ? 'منظومة الإنذار المبكر والتنبيهات' : 'Emergency Alert & Dispatch Command'}
              </h1>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'مراقبة فورية لأشعة الأقمار الصناعية (VIIRS/MODIS) وإرسال تنبيهات طارئة وقواعد مخصصة'
                  : 'Real-time orbital radiometry surveillance with multi-channel automated triggers'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls & Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Simulate Alert Button */}
          <button
            type="button"
            onClick={handleSimulateAlert}
            className="px-3.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-600/60 text-red-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-red-950/40"
            title={isAr ? 'محاكاة وصول إنذار حراري من الفضاء' : 'Simulate satellite alert event'}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'محاكاة إنذار طارئ' : 'Simulate Alert'}</span>
          </button>

          {/* Backend Status Badge */}
          <div className="alerts-stat-badge">
            <div
              className={`w-2 h-2 rounded-full ${
                backendOnline === true
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : backendOnline === false
                  ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                  : 'bg-blue-400 animate-pulse'
              }`}
            />
            <span className="text-slate-300">
              {backendOnline === true
                ? isAr ? 'الباك إند متصل' : 'Backend Live'
                : backendOnline === false
                ? isAr ? 'وضع محلي مستقل' : 'Edge Local'
                : isAr ? 'جارِ الاتصال...' : 'Connecting...'}
            </span>
            {isLoadingBackend && <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin ml-1" />}
          </div>

          {/* Critical Count Chip */}
          <div className="alerts-stat-badge hidden sm:flex border-red-500/40 bg-red-950/40 text-red-300">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span className="font-bold">{severityCounts.Critical}</span>
            <span className="text-slate-400 text-[11px]">{isAr ? 'إنذار حرج' : 'Critical'}</span>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0c1f38] border border-blue-500/80 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3-Column Cockpit Layout matching user design */}
      <main className="alerts-layout-grid">
        {/* Left Column: Alert Filters & Status (~240px) */}
        <aside className="w-full lg:w-[240px] shrink-0">
          <AlertFiltersPanel
            selectedSeverities={selectedSeverities}
            onToggleSeverity={handleToggleSeverity}
            statusFilter={statusFilter}
            selectedStatuses={selectedStatuses}
            onSelectAllStatuses={handleSelectAllStatuses}
            onToggleStatus={handleToggleStatus}
            severityCounts={severityCounts}
            language={lang}
          />
        </aside>

        {/* Middle Column: Alert Feed (Flex-1) */}
        <section className="flex-1 min-w-0">
          <AlertFeedPanel
            alerts={filteredAlerts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOrder={sortOrder}
            onToggleSort={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            onSelectAlert={(a) => setSelectedAlert(a)}
            selectedAlertIds={selectedAlertIds}
            onToggleSelectAlert={handleToggleSelectAlert}
            onSelectAllAlerts={handleSelectAllAlerts}
            isAllSelected={
              filteredAlerts.length > 0 &&
              selectedAlertIds.length === filteredAlerts.length
            }
            timeFormat={timeFormat}
            onToggleTimeFormat={() =>
              setTimeFormat(timeFormat === 'arabic' ? 'english' : 'arabic')
            }
            language={lang}
          />
        </section>

        {/* Right Column: Create Alert Rule (~280px) */}
        <aside className="w-full lg:w-[280px] shrink-0">
          <CreateRulePanel
            onSaveRule={handleSaveRule}
            savedRulesCount={rules.length}
            onOpenRulesModal={() => setIsRulesModalOpen(true)}
            language={lang}
          />
        </aside>
      </main>

      {/* Detailed Alert Inspector Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onUpdateStatus={handleUpdateAlertStatus}
        language={lang}
      />

      {/* Saved Rules Modal */}
      <SavedRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={rules}
        onDeleteRule={handleDeleteRule}
        language={lang}
      />
    </div>
  );
};
