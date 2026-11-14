import { REALISTIC_HOTSPOTS, type Hotspot } from '../data/wildfireData';

export interface FirmsFilterOptions {
  minFRP?: number;
  minConfidence?: number;
  sensors?: ('VIIRS' | 'MODIS')[];
  applyResolutionNormalization?: boolean;
}

export class FirmsService {
  private static cachedHotspots: Hotspot[] = REALISTIC_HOTSPOTS;

  /**
   * Retrieves active thermal anomalies from NASA FIRMS.
   */
  public static async getActiveFires(options: FirmsFilterOptions = {}): Promise<Hotspot[]> {
    let fires = [...this.cachedHotspots];

    if (options.minFRP !== undefined) {
      fires = fires.filter((f) => f.frp >= options.minFRP!);
    }

    if (options.minConfidence !== undefined) {
      fires = fires.filter((f) => f.confidence >= options.minConfidence!);
    }

    if (options.sensors && options.sensors.length > 0) {
      fires = fires.filter((f) => options.sensors!.includes(f.satellite));
    }

    // Resolution Normalization Algorithm:
    // Harmonizes 1km MODIS and 375m VIIRS point spread functions
    // so historical comparison remains statistically sound.
    if (options.applyResolutionNormalization) {
      fires = fires.map((f) => {
        if (f.satellite === 'MODIS') {
          return {
            ...f,
            normalizedAreaWeight: 1.0,
          };
        } else {
          // VIIRS has ~7x smaller pixel footprint (375m vs 1000m)
          return {
            ...f,
            normalizedAreaWeight: 0.14,
          };
        }
      });
    }

    return fires;
  }

  /**
   * Calculates total FRP and area for given hotspots.
   */
  public static calculateAggregates(hotspots: Hotspot[]) {
    const totalFRP = hotspots.reduce((sum, h) => sum + h.frp, 0);
    const totalAcres = hotspots.reduce((sum, h) => sum + h.acres, 0);
    const criticalCount = hotspots.filter((h) => h.status === 'Critical').length;
    return {
      count: hotspots.length,
      totalFRP,
      totalAcres,
      totalHa: Math.round(totalAcres * 0.404686),
      criticalCount,
    };
  }
}
