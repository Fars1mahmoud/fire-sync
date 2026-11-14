/**
 * Post-Fire Recovery & Satellite dNBR / NDVI Analytics Service
 */

import { API_BASE_URL } from '../../../services/apiClient';
import { RecoveryMetrics, RECOVERY_SECTORS } from './recoveryTypes';

export class RecoveryApiService {
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
   * Fetch real fire analytics summary and calibrate burn scar area
   */
  public static async fetchRecoveryMetrics(regionKey: string): Promise<RecoveryMetrics> {
    const baseSector = RECOVERY_SECTORS[regionKey] || RECOVERY_SECTORS['basin-central'];
    try {
      const params = new URLSearchParams();
      if (regionKey.includes('canada')) {
        params.set('country', 'CAN');
      } else if (regionKey.includes('egypt')) {
        params.set('country', 'EGY');
      } else {
        params.set('country', 'BRA');
      }

      const res = await fetch(`${API_BASE_URL}/analytics/summary?${params.toString()}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3500),
      });

      if (!res.ok) return baseSector.metrics;
      const data = await res.json();

      // Estimate real burn scar hectares from total FIRMS fire detections (approx 25 ha per 375m VIIRS pixel)
      const totalCount = data.total_fires || data.total_detections || 5000;
      const estimatedHa = Math.round(totalCount * 25);
      const formattedHa = estimatedHa.toLocaleString('en-US') + ' ha';

      return {
        ...baseSector.metrics,
        burnScarAreaHa: estimatedHa,
        burnScarFormatted: formattedHa,
      };
    } catch {
      return baseSector.metrics;
    }
  }
}

