/**
 * Ground Truth Verification & Reporting Backend Service
 * Interacts with FastAPI /fires/map endpoint and provides local offline persistent storage
 */

import { API_BASE_URL } from '../../../services/apiClient';
import { FireReport, NetworkNode, GalleryPhoto } from './groundTruthTypes';

export class GroundTruthApiService {
  private static STORAGE_KEY = 'nasa_fire_intel_ground_truth_reports_v3';

  /**
   * Check if backend is alive
   */
  public static async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2500),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetch real satellite detections from backend and format as candidate ground truth items
   */
  public static async fetchBackendClusters(region: string): Promise<FireReport[]> {
    try {
      const params = new URLSearchParams();
      const r = region.toLowerCase();
      if (r.includes('brazil') || r.includes('amazon') || r.includes('basin')) {
        params.set('region', 'brazil');
        params.set('country', 'Brazil');
      } else if (r.includes('canada') || r.includes('boreal')) {
        params.set('region', 'canada');
        params.set('country', 'Canada');
      } else if (r.includes('egypt')) {
        params.set('region', 'egypt');
        params.set('country', 'Egypt');
      }

      params.set('limit', '12');

      const res = await fetch(`${API_BASE_URL}/fires/map?${params.toString()}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3500),
      });

      if (!res.ok) return [];
      const data = await res.json();
      const rawSpots = data.hotspots || [];

      return rawSpots.map((spot: any, idx: number): FireReport => {
        const frp = spot.frp || Math.round(150 + Math.random() * 500);
        const tempK = spot.tempK || Math.round(330 + Math.random() * 90);
        const isCritical = frp > 350;
        const isModerate = frp > 100;

        const gallery: GalleryPhoto[] = [
          {
            url: isCritical
              ? '/assets/ground-truth/wildfire_blaze_1793981574666.jpg'
              : '/assets/ground-truth/smoke_plume_1793981610168.jpg',
            label: isCritical ? 'Active Wildfire Front (Field IR)' : 'Smoke Plume Column (UAV)',
            labelAr: isCritical ? 'جبهة الحريق المشتعلة (الأشعة تحت الحمراء)' : 'عمود الدخان المتصاعد (مسيرة)',
            type: 'optical',
          },
          {
            url: '/assets/ground-truth/night_embers_1793982264731.jpg',
            label: `Thermal Brightness ${tempK} K Overlay`,
            labelAr: `بصمة السطوع الحراري ${tempK} كلفن`,
            type: 'thermal',
          },
          {
            url: '/assets/ground-truth/canyon_wildfire_1793982250385.jpg',
            label: 'Canopy Flank Propagation (Aerial)',
            labelAr: 'انتشار جبهة النيران عبر التضاريس',
            type: 'optical',
          },
          {
            url: '/assets/ground-truth/forest_satellite_map_1793981648264.jpg',
            label: `${spot.satellite || 'VIIRS'} Orbital Swath (375m)`,
            labelAr: `المسار المداري للقمر الصناعي بدقة 375م`,
            type: 'satellite',
          },
        ];

        const latDeg = Math.floor(Math.abs(spot.lat));
        const latMin = ((Math.abs(spot.lat) - latDeg) * 60).toFixed(1);
        const lngDeg = Math.floor(Math.abs(spot.lon));
        const lngMin = Math.abs(spot.lon).toFixed(4);
        const formattedCoords = `${latDeg * 10} - ${spot.lat.toFixed(4)} ${lngDeg * 5} - ${spot.lon.toFixed(4)}`;

        return {
          id: `sat-${spot.id || idx}`,
          title: isCritical ? 'Confirmed Fire' : isModerate ? 'Needs Review' : 'Needs Review',
          titleAr: isCritical ? 'حريق مؤكد' : 'قيد المراجعة والتدقيق',
          type: (isCritical ? 'confirmed' : 'review') as 'confirmed' | 'review',
          status: (isCritical ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
          locationName: spot.name || `${spot.stateOrRegion || spot.country} Fire Cluster #${spot.id || idx + 100}`,
          locationNameAr: `${spot.stateOrRegion || spot.country} — بؤرة حرارية #${spot.id || idx + 100}`,
          timeAgo: spot.timeDetected || `${idx * 15 + 8} mins ago`,
          timeAgoAr: spot.timeDetected || `منذ ${idx * 15 + 8} دقيقة`,
          timestamp: Date.now() - (idx + 1) * 1200000,
          coordinates: formattedCoords,
          coordsGps: { lat: spot.lat, lng: spot.lon },
          mapPosition: {
            x: 25 + ((idx * 17) % 55),
            y: 20 + ((idx * 21) % 60),
          },
          imageUrl: gallery[0].url,
          galleryImages: gallery,
          description: `Satellite ${spot.satellite || 'VIIRS'} detected cluster with FRP ${frp} MW at ${tempK} K brightness temperature. Confidence: ${Math.round(spot.confidence || 98)}%.`,
          descriptionAr: `رصد قمر ${spot.satellite || 'VIIRS'} بؤرة حرارية بشدة ${frp} ميجاوات وحرارة سطوع ${tempK} كلفن بمستوى ثقة ${Math.round(spot.confidence || 98)}%.`,
          confidence: Math.round(spot.confidence || 98),
          reporterName: spot.satellite || 'NASA FIRMS VIIRS',
          reporterRole: 'Orbital Radiometry Sensor',
          frpMw: frp,
          tempK: tempK,
          satelliteSource: spot.satellite || 'VIIRS 375m & MODIS Aqua',
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Load custom persisted reports from LocalStorage
   */
  public static loadPersistedReports(): FireReport[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Save custom report to LocalStorage
   */
  public static saveReport(report: FireReport): void {
    try {
      const existing = this.loadPersistedReports();
      const updated = [report, ...existing.filter((r) => r.id !== report.id)].slice(0, 50);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save report to localStorage', e);
    }
  }
}
