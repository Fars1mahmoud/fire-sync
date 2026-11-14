import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShieldCheck, 
  Radio, 
  MapPin, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  Globe2,
  FileCheck2,
  Image as ImageIcon
} from 'lucide-react';
import { SubmitReportPanel } from './ground-truth/SubmitReportPanel';
import { GroundTruthMapView } from './ground-truth/GroundTruthMapView';
import { RecentReportsFeed } from './ground-truth/RecentReportsFeed';
import { GroundTruthPhotoModal } from './ground-truth/GroundTruthPhotoModal';
import { 
  FireReport, 
  NetworkNode, 
  NetworkEdge, 
  ReportFilter, 
  GROUND_TRUTH_SECTORS,
  INITIAL_GROUND_TRUTH_REPORTS,
  INITIAL_NETWORK_NODES,
  INITIAL_NETWORK_EDGES
} from './ground-truth/groundTruthTypes';
import { GroundTruthApiService } from './ground-truth/groundTruthApiService';
import './ground-truth/GroundTruthView.css';

interface GroundTruthViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
  onOpenReportModal?: () => void;
}

export const GroundTruthView: React.FC<GroundTruthViewProps> = ({
  lang,
  selectedRegion,
  onOpenReportModal,
}) => {
  const isAr = lang === 'ar';

  // Sector selection: map platform selectedRegion or default to amazon/brazil
  const defaultSectorId = useMemo(() => {
    const r = selectedRegion.toLowerCase();
    if (r.includes('canada')) return 'canada';
    if (r.includes('egypt')) return 'egypt';
    return 'basin-central';
  }, [selectedRegion]);

  const [activeSectorId, setActiveSectorId] = useState<string>(defaultSectorId);
  const activeSector = GROUND_TRUTH_SECTORS[activeSectorId] || GROUND_TRUTH_SECTORS['basin-central'];

  // Core reports state
  const [reports, setReports] = useState<FireReport[]>(() => {
    const persisted = GroundTruthApiService.loadPersistedReports();
    return persisted.length > 0 ? [...persisted, ...INITIAL_GROUND_TRUTH_REPORTS] : INITIAL_GROUND_TRUTH_REPORTS;
  });

  const [selectedReport, setSelectedReport] = useState<FireReport | null>(INITIAL_GROUND_TRUTH_REPORTS[0]);
  const [activeFilter, setActiveFilter] = useState<ReportFilter>('all');
  const [nodes, setNodes] = useState<NetworkNode[]>(INITIAL_NETWORK_NODES);
  const [edges, setEdges] = useState<NetworkEdge[]>(INITIAL_NETWORK_EDGES);

  // Photo Lightbox modal state
  const [photoModalReport, setPhotoModalReport] = useState<FireReport | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);

  // Map coordinate picking state
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedCoordinates, setPickedCoordinates] = useState<string>(
    activeSector.presetCoordinates[0]?.coords || '30 - 3.0216 327 - 65.4595'
  );
  const [pickedGps, setPickedGps] = useState<{ lat: number; lng: number }>(
    activeSector.presetCoordinates[0]
      ? { lat: activeSector.presetCoordinates[0].lat, lng: activeSector.presetCoordinates[0].lng }
      : { lat: activeSector.center.lat, lng: activeSector.center.lng }
  );
  const [pickedMapPosition, setPickedMapPosition] = useState<{ x: number; y: number } | undefined>(undefined);

  // Backend connection status
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState<boolean>(false);

  // Check backend health & fetch satellite detections on mount or sector change
  useEffect(() => {
    let isMounted = true;
    const syncBackendData = async () => {
      setIsLoadingBackend(true);
      const isAlive = await GroundTruthApiService.checkHealth();
      if (!isMounted) return;
      setBackendOnline(isAlive);

      if (isAlive) {
        const backendClusters = await GroundTruthApiService.fetchBackendClusters(activeSectorId);
        if (isMounted && backendClusters.length > 0) {
          // Merge unique backend clusters into reports
          setReports((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            const newClusters = backendClusters.filter((c) => !existingIds.has(c.id));
            return [...newClusters, ...prev];
          });

          // Generate network nodes with real GPS for backend clusters
          const newNodes: NetworkNode[] = backendClusters.map((cluster, i) => ({
            id: `node-${cluster.id}`,
            lat: cluster.coordsGps.lat,
            lng: cluster.coordsGps.lng,
            x: cluster.mapPosition.x,
            y: cluster.mapPosition.y,
            color: cluster.type === 'confirmed' ? 'red' : 'orange',
            label: `Sat-${i + 1}`,
            type: cluster.type === 'confirmed' ? 'fire' : 'warning',
            reportId: cluster.id,
            hasPulse: cluster.type === 'confirmed',
          }));

          setNodes((prev) => {
            const existingNodeIds = new Set(prev.map((n) => n.id));
            const freshNodes = newNodes.filter((n) => !existingNodeIds.has(n.id));
            return [...prev, ...freshNodes];
          });

          // Default select the first real high-intensity fire
          if (backendClusters[0]) {
            setSelectedReport(backendClusters[0]);
          }
        }
      }
      setIsLoadingBackend(false);
    };

    syncBackendData();
    return () => {
      isMounted = false;
    };
  }, [activeSectorId]);

  // Handle new report submission from SubmitReportPanel
  const handleCreateReport = (newReportData: Omit<FireReport, 'id' | 'timestamp' | 'timeAgo'>) => {
    const newId = `report-${Date.now()}`;
    const newReport: FireReport = {
      ...newReportData,
      id: newId,
      timestamp: Date.now(),
      timeAgo: isAr ? 'الآن' : 'Just now',
      timeAgoAr: 'الآن',
      coordsGps: pickedGps,
    };

    // Save to localStorage for offline persistence
    GroundTruthApiService.saveReport(newReport);

    // Add to reports list at top
    setReports((prev) => [newReport, ...prev]);

    // Add as a new node on the map
    const nodeColor =
      newReport.type === 'confirmed' ? 'red' :
      newReport.type === 'false' ? 'yellow' : 'orange';

    const newNode: NetworkNode = {
      id: `node-${newId}`,
      lat: pickedGps.lat,
      lng: pickedGps.lng,
      x: newReport.mapPosition.x,
      y: newReport.mapPosition.y,
      color: nodeColor,
      label: `Field-${reports.length + 1}`,
      type: newReport.type === 'confirmed' ? 'fire' : 'warning',
      reportId: newId,
      hasPulse: true,
    };

    setNodes((prev) => [...prev, newNode]);

    // Connect edge to nearest sensor node for visual network graph
    const sensorNode = nodes.find((n) => n.type === 'sensor') || nodes[0];
    if (sensorNode) {
      setEdges((prev) => [
        ...prev,
        {
          id: `edge-${newId}`,
          from: sensorNode.id,
          to: newNode.id,
          color: nodeColor === 'red' ? '#ef4444' : '#38bdf8',
          width: 1.5,
        },
      ]);
    }

    // Open detail card for newly submitted report
    setSelectedReport(newReport);
    setIsPickingLocation(false);
  };

  const handleLocationPicked = (
    coordsText: string, 
    mapCoords: { x: number; y: number },
    gps: { lat: number; lng: number }
  ) => {
    setPickedCoordinates(coordsText);
    setPickedGps(gps);
    setPickedMapPosition(mapCoords);
    setIsPickingLocation(false);
  };

  const handleOpenPhotoModal = useCallback((report: FireReport) => {
    setPhotoModalReport(report);
    setIsPhotoModalOpen(true);
  }, []);

  const handleFlyToMapLocation = useCallback((lat: number, lng: number) => {
    if (selectedReport) {
      setSelectedReport({
        ...selectedReport,
        coordsGps: { lat, lng },
      });
    }
  }, [selectedReport]);

  // Filter reports according to activeFilter
  const displayedReports = useMemo(() => {
    if (activeFilter === 'all') return reports;
    if (activeFilter === 'pending') {
      return reports.filter((r) => r.status === 'pending' || r.type === 'review');
    }
    if (activeFilter === 'confirmed') {
      return reports.filter((r) => r.type === 'confirmed' || r.status === 'confirmed');
    }
    if (activeFilter === 'false') {
      return reports.filter((r) => r.type === 'false' || r.status === 'false');
    }
    return reports;
  }, [reports, activeFilter]);

  // Dynamic counts for filter tabs
  const counts = useMemo(() => {
    const confirmed = reports.filter((r) => r.type === 'confirmed' || r.status === 'confirmed').length;
    const pending = reports.filter((r) => r.status === 'pending' || r.type === 'review').length;
    const falseDetections = reports.filter((r) => r.type === 'false' || r.status === 'false').length;
    return {
      all: reports.length,
      pending,
      confirmed,
      false: falseDetections,
    };
  }, [reports]);

  return (
    <div className="ground-truth-container select-none">
      {/* Top Tactical HUD Header Bar */}
      <div className="gt-header-bar">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(0,112,243,0.3)]">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-white text-base sm:text-lg font-bold tracking-tight">
                {isAr ? 'مركز التحقق الميداني الأرضي' : 'Ground Truth Verification Center'}
              </h1>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'مطابقة بيانات الأقمار الصناعية (MODIS/VIIRS) مع بلاغات الحراس والمستشعرات الميدانية'
                  : 'Multi-source satellite correlation with field patrols and IoT sensor networks'}
              </p>
            </div>
          </div>
        </div>

        {/* Sector Selector & Live Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sector Selector */}
          <div className="relative">
            <select
              value={activeSectorId}
              onChange={(e) => {
                const newSector = e.target.value;
                setActiveSectorId(newSector);
                const s = GROUND_TRUTH_SECTORS[newSector];
                if (s && s.presetCoordinates[0]) {
                  setPickedCoordinates(s.presetCoordinates[0].coords);
                  setPickedGps({ lat: s.presetCoordinates[0].lat, lng: s.presetCoordinates[0].lng });
                }
              }}
              className="gt-sector-select"
            >
              {Object.values(GROUND_TRUTH_SECTORS).map((sector) => (
                <option key={sector.id} value={sector.id} className="bg-[#091524] text-white">
                  {isAr ? sector.nameAr : sector.name}
                </option>
              ))}
            </select>
          </div>

          {/* Backend Status Badge */}
          <div className="gt-stat-badge">
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

          {/* Verification Ratio Chip */}
          <div className="gt-stat-badge hidden sm:flex">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-semibold">
              {counts.all > 0 ? Math.round((counts.confirmed / counts.all) * 100) : 0}%
            </span>
            <span className="text-slate-400 text-[11px]">{isAr ? 'نسبة التأكيد' : 'Verified'}</span>
          </div>
        </div>
      </div>

      {/* 3-Column Tactical Cockpit Layout */}
      <main className="gt-layout-grid">
        {/* Left Column: Submit Report Panel */}
        <SubmitReportPanel
          onSubmitReport={handleCreateReport}
          isMapPickingLocation={isPickingLocation}
          onStartMapLocationPick={() => setIsPickingLocation(true)}
          selectedLocationCoordinates={pickedCoordinates}
          selectedMapCoords={pickedMapPosition}
          language={lang}
          presetLocations={activeSector.presetCoordinates}
        />

        {/* Center Column: Real Satellite Map with Leaflet & Real GIS Hotspots */}
        <GroundTruthMapView
          reports={reports}
          selectedReport={selectedReport}
          onSelectReport={setSelectedReport}
          onOpenPhotoModal={handleOpenPhotoModal}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          networkNodes={nodes}
          networkEdges={edges}
          isPickingLocation={isPickingLocation}
          onLocationPicked={handleLocationPicked}
          language={lang}
          counts={counts}
          centerCoords={activeSector.center}
          defaultZoom={activeSector.defaultZoom}
        />

        {/* Right Column: Recent Reports Feed */}
        <RecentReportsFeed
          reports={displayedReports}
          selectedReportId={selectedReport?.id}
          onSelectReport={(rep) => setSelectedReport(rep)}
          onOpenPhotoModal={handleOpenPhotoModal}
          onNavigateBack={() => setSelectedReport(reports[0] || null)}
          onOptionsClick={() => {
            if (reports.length > 0) {
              const nextIndex = (reports.findIndex((r) => r.id === selectedReport?.id) + 1) % reports.length;
              setSelectedReport(reports[nextIndex]);
            }
          }}
          language={lang}
        />
      </main>

      {/* Dedicated High-Resolution Photo & Telemetry Lightbox Modal */}
      <GroundTruthPhotoModal
        report={photoModalReport}
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onFlyToMapLocation={handleFlyToMapLocation}
        language={lang}
      />
    </div>
  );
};
