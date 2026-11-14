import React, { useState, useEffect, useMemo } from 'react';
import { ApiClient, type HistoricalOverviewData } from '../services/apiClient';
import { Header } from '../components/wildfire-analytics/Header';
import { FilterBar } from '../components/wildfire-analytics/FilterBar';
import { MetricCards } from '../components/wildfire-analytics/MetricCards';
import { YearlyBarChart } from '../components/wildfire-analytics/YearlyBarChart';
import { SeasonalPatternChart } from '../components/wildfire-analytics/SeasonalPatternChart';
import { HeatmapChart } from '../components/wildfire-analytics/HeatmapChart';
import { YearComparisonTable } from '../components/wildfire-analytics/YearComparisonTable';
import { DetailsDrawer } from '../components/wildfire-analytics/DetailsDrawer';
import { ReportModal } from '../components/wildfire-analytics/ReportModal';
import { CaptureModal } from '../components/wildfire-analytics/CaptureModal';
import { SettingsModal } from '../components/wildfire-analytics/SettingsModal';
import { MetricCardData } from '../components/wildfire-analytics/types';
import {
  METRIC_CARDS_DATA,
  YEARLY_BARS_DATA,
  SEASONAL_PATTERN_DATA,
  HEATMAP_ROWS,
  HEATMAP_HEADER_YEARS,
  HEATMAP_MONTHS,
  YEAR_COMPARISON_DATA,
} from '../components/wildfire-analytics/fireData';

interface AnalysisDashboardPageProps {
  onBack?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToFireDetection?: () => void;
  lang?: 'en' | 'ar';
  embedded?: boolean;
}

// Fallback data when API is initializing or offline
const DEFAULT_METRICS: MetricCardData[] = [
  {
    title: 'Total Detections',
    value: '2,819',
    icon: 'flame',
    titleColor: 'text-slate-400',
    valueColor: 'text-white',
    iconColor: 'text-red-500',
    subtext: '5 years satellite archive',
  },
  {
    title: 'Burned Area',
    value: '321K ha',
    icon: 'tree',
    titleColor: 'text-[#de5246]',
    valueColor: 'text-[#ea580c]',
    iconColor: 'text-[#ea580c]',
    subtext: 'FRP Radiative Area Estimate',
  },
  {
    title: 'Peak Season',
    value: 'Jul - Aug',
    icon: 'calendar',
    titleColor: 'text-slate-400',
    valueColor: 'text-white',
    iconColor: 'text-sky-400',
    subtext: 'Highest thermal concentration',
  },
  {
    title: 'Avg. Annual',
    value: '564',
    icon: 'flame-orange',
    titleColor: 'text-slate-400',
    valueColor: 'text-white',
    iconColor: 'text-amber-500',
    subtext: 'Mean detections / year',
  },
  {
    title: 'Change',
    value: '+98%',
    icon: 'trending-up',
    titleColor: 'text-slate-400',
    valueColor: 'text-[#ea580c]',
    iconColor: 'text-[#ea580c]',
    subtext: '2024 vs Historical Baseline',
  },
];

export const AnalysisDashboardPage: React.FC<AnalysisDashboardPageProps> = ({
  onBack,
  onNavigateToHome,
  onNavigateToFireDetection,
  lang = 'en',
  embedded = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>('thermal-activity');
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions (Global Archive)');
  const [selectedInterval, setSelectedInterval] = useState<string>('Annual');
  const [selectedParameter, setSelectedParameter] = useState<string>('MODIS Thermal Anomaly');
  const [filterConfidence, setFilterConfidence] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Modals state
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [captureModalOpen, setCaptureModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // Live Backend Data
  const [overviewData, setOverviewData] = useState<HistoricalOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Map Region Label to Country Code
  const countryCode = useMemo(() => {
    const r = selectedRegion.toLowerCase();
    if (r.includes('brazil') || r.includes('amazon')) return 'BRA';
    if (r.includes('canada') || r.includes('boreal') || r.includes('alberta')) return 'CAN';
    if (r.includes('egypt') || r.includes('delta')) return 'EGY';
    if (r.includes('mediterranean') || r.includes('greece') || r.includes('balkan')) return 'GRC';
    if (r.includes('california') || r.includes('united states')) return 'USA';
    return 'ALL';
  }, [selectedRegion]);

  // Fetch real data from FastAPI backend
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const isHighConf = filterConfidence.includes('High');
    ApiClient.fetchHistoricalOverview({
      country: countryCode,
      confidence: isHighConf ? 'high' : undefined,
    })
      .then((data) => {
        if (isMounted) {
          if (data) {
            setOverviewData(data);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [countryCode, filterConfidence]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRegion('All Regions (Global Archive)');
    setSelectedInterval('Annual');
    setSelectedParameter('MODIS Thermal Anomaly');
    setFilterConfidence('All');
    setSelectedYear(null);
  };

  const handleSelectYear = (year: number) => {
    if (selectedYear === year) {
      setSelectedYear(null);
    } else {
      setSelectedYear(year);
      setShowDetails(true);
    }
  };

  // Switch tabs if user clicks Fire Detection or Overview
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'dashboard' && onBack) {
      onBack();
    } else if (tabId === 'fire-detection' && onNavigateToFireDetection) {
      onNavigateToFireDetection();
    } else if (tabId === 'overview' && onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const activeMetrics = overviewData?.metrics || METRIC_CARDS_DATA;

  return (
    <div
      className={embedded ? "w-full text-slate-100 flex flex-col font-sans select-none" : "min-h-screen bg-[#070d19] text-slate-100 flex flex-col font-sans antialiased select-none"}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top Navigation Bar with FireBoard branding & Back to Tactical Map */}
      {!embedded && (
        <Header
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          onOpenReport={() => setReportModalOpen(true)}
          onOpenCapture={() => setCaptureModalOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onBack={onBack}
          lang={lang}
        />
      )}

      {/* Filter and Parameter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedInterval={selectedInterval}
        setSelectedInterval={setSelectedInterval}
        selectedParameter={selectedParameter}
        setSelectedParameter={setSelectedParameter}
        filterConfidence={filterConfidence}
        setFilterConfidence={setFilterConfidence}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 p-2 sm:p-3 flex flex-col gap-2.5 max-w-[1720px] w-full mx-auto">
        {/* KPI Metrics Row (5 Cards) */}
        <section aria-label="Key Fire Metrics">
          <MetricCards
            metrics={activeMetrics}
            isLoading={isLoading}
            onSelectMetric={() => setShowDetails(true)}
          />
        </section>

        {/* 2x2 Analytics Grid */}
        <section
          aria-label="Fire Analytics Grid"
          className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 flex-1 min-h-[520px]"
        >
          {/* Top-Left: Yearly Fire Activity */}
          <div className="min-h-[260px] h-[300px] sm:h-[320px]">
            <YearlyBarChart
              data={overviewData?.yearly_bars || YEARLY_BARS_DATA}
              onSelectYear={handleSelectYear}
              selectedYear={selectedYear}
            />
          </div>

          {/* Top-Right: Seasonal Pattern (Monthly Average) */}
          <div className="min-h-[260px] h-[300px] sm:h-[320px]">
            <SeasonalPatternChart
              data={overviewData?.seasonal_pattern || SEASONAL_PATTERN_DATA}
              highlightYear={selectedYear}
            />
          </div>

          {/* Bottom-Left: Fire Activity Heatmap */}
          <div className="min-h-[260px] h-[300px] sm:h-[320px]">
            <HeatmapChart
              rows={overviewData?.heatmap_rows || HEATMAP_ROWS}
              years={overviewData?.heatmap_years || HEATMAP_HEADER_YEARS}
              months={overviewData?.heatmap_months || HEATMAP_MONTHS}
            />
          </div>

          {/* Bottom-Right: Year Comparison Table */}
          <div className="min-h-[260px] h-[300px] sm:h-[320px]">
            <YearComparisonTable
              data={overviewData?.year_comparison || YEAR_COMPARISON_DATA}
              onSelectYear={handleSelectYear}
              selectedYear={selectedYear}
            />
          </div>
        </section>
      </main>

      {/* Details Slide-out Drawer */}
      <DetailsDrawer
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        selectedRegion={overviewData?.region || selectedRegion}
        selectedYear={selectedYear}
      />

      {/* Action Modals */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        selectedRegion={overviewData?.region || selectedRegion}
        totalDetections={overviewData?.metrics[0]?.value}
        burnedArea={overviewData?.metrics[1]?.value}
      />

      <CaptureModal
        isOpen={captureModalOpen}
        onClose={() => setCaptureModalOpen(false)}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
};
