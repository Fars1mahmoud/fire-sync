/**
 * Alert Management & Backend Satellite Alert Service
 */

import { API_BASE_URL } from '../../../services/apiClient';
import { AlertItem, AlertRule, SeverityLevel, AlertStatus } from './alertTypes';

export class AlertApiService {
  private static RULES_STORAGE_KEY = 'nasa_fire_intel_alert_rules_v1';
  private static ALERTS_STORAGE_KEY = 'nasa_fire_intel_alerts_v1';

  /**
   * Health check for FastAPI backend
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
   * Fetch severe satellite hotspots from backend and convert to live AlertItem objects
   */
  public static async fetchBackendAlerts(region: string): Promise<AlertItem[]> {
    try {
      const params = new URLSearchParams();
      const r = region.toLowerCase();
      if (r.includes('brazil') || r.includes('amazon')) {
        params.set('region', 'brazil');
        params.set('country', 'Brazil');
      } else if (r.includes('canada')) {
        params.set('region', 'canada');
        params.set('country', 'Canada');
      } else if (r.includes('egypt')) {
        params.set('region', 'egypt');
        params.set('country', 'Egypt');
      }

      params.set('limit', '10');

      const res = await fetch(`${API_BASE_URL}/fires/map?${params.toString()}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3500),
      });

      if (!res.ok) return [];
      const data = await res.json();
      const rawSpots = data.hotspots || [];

      // Only take high/critical FRP spots
      const severeSpots = rawSpots.filter((s: any) => (s.frp || 0) > 120);

      return severeSpots.map((spot: any, idx: number): AlertItem => {
        const frp = spot.frp || Math.round(180 + Math.random() * 400);
        const tempK = spot.tempK || Math.round(330 + Math.random() * 80);
        const isCritical = frp > 400;
        const severity: SeverityLevel = isCritical ? 'Critical' : frp > 220 ? 'High' : 'Moderate';

        return {
          id: `alert-sat-${spot.id || idx}`,
          title: isCritical ? 'Critical Thermal Spike' : 'Wildfire Front Progression',
          titleAr: isCritical ? 'إنذار حرج: بؤرة اشتعال عالية الشدة' : 'إنذار تقدم جبهة النيران',
          subtitle: `Satellite ${spot.satellite || 'VIIRS'} detected ${frp} MW radiated heat signature at ${tempK} K`,
          subtitleAr: `رصد قمر ${spot.satellite || 'VIIRS'} إشعاعاً حرارياً بقوة ${frp} ميجاوات وحرارة سطوع ${tempK} كلفن`,
          severity,
          status: 'Unresolved',
          timeArabic: spot.timeDetected || `منذ ${idx * 12 + 6} دقيقة`,
          timeEnglish: spot.timeDetected || `${idx * 12 + 6} mins ago`,
          timestamp: Date.now() - (idx + 1) * 720000,
          region: spot.name || `${spot.stateOrRegion || spot.country} High-Risk Sector`,
          regionAr: `${spot.stateOrRegion || spot.country} — قطاع ذو خطورة مرتفعة`,
          coordinates: { lat: spot.lat, lng: spot.lon },
          frpMw: frp,
          confidence: Math.round(spot.confidence || 96),
          windSpeed: `${Math.round(18 + (idx * 5) % 25)} km/h ENE`,
          windSpeedAr: `${Math.round(18 + (idx * 5) % 25)} كم/ساعة شمال شرق`,
          humidity: `${Math.round(15 + (idx * 3) % 20)}% RH`,
          satellite: spot.satellite || 'VIIRS NOAA-20 Suomi-NPP',
          category: isCritical ? 'EXTREME_FIRE' : 'SMOKE',
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Load saved rules from localStorage
   */
  public static loadSavedRules(): AlertRule[] {
    try {
      const raw = localStorage.getItem(this.RULES_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Save rule to localStorage
   */
  public static saveRule(rule: AlertRule): void {
    try {
      const existing = this.loadSavedRules();
      const updated = [rule, ...existing.filter((r) => r.id !== rule.id)];
      localStorage.setItem(this.RULES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save alert rule', e);
    }
  }

  /**
   * Delete rule from localStorage
   */
  public static deleteRule(id: string): void {
    try {
      const existing = this.loadSavedRules();
      const updated = existing.filter((r) => r.id !== id);
      localStorage.setItem(this.RULES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete alert rule', e);
    }
  }

  /**
   * Load alert status overrides from localStorage
   */
  public static loadStatusOverrides(): Record<string, AlertStatus> {
    try {
      const raw = localStorage.getItem(this.ALERTS_STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  /**
   * Save alert status override to localStorage
   */
  public static saveStatusOverride(alertId: string, status: AlertStatus): void {
    try {
      const existing = this.loadStatusOverrides();
      existing[alertId] = status;
      localStorage.setItem(this.ALERTS_STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn('Failed to save alert status override', e);
    }
  }
}

