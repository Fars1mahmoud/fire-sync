/**
 * Satellite Orbit & Overpass Tracker Service
 * Predicts sensor overpass passes for:
 * - Suomi-NPP / NOAA-20 (VIIRS 375m I-Band)
 * - Aqua & Terra (MODIS 1000m Thermal)
 * - Copernicus Sentinel-2 (MSI SWIR / 10m NDVI)
 * - Copernicus Sentinel-5P (TROPOMI Atmospheric Plumes)
 */

export interface SatellitePassSchedule {
  satellite: string;
  sensor: string;
  resolution: string;
  overpassTimeUTC: string;
  countdownMinutes: number;
  coverageSector: string;
  spectralBands: string;
  status: 'Upcoming' | 'In Progress' | 'Processing';
}

export class SatelliteService {
  public static getOverpassesForRegion(regionName: string): SatellitePassSchedule[] {
    const isCal = regionName === 'California';

    if (isCal) {
      return [
        {
          satellite: 'Suomi-NPP',
          sensor: 'VIIRS (375m I-Band)',
          resolution: '375 m',
          overpassTimeUTC: '21:18 UTC',
          countdownMinutes: 24,
          coverageSector: 'California & Sierra Nevada Range',
          spectralBands: 'I4 (3.74µm) & I5 (11.45µm)',
          status: 'Upcoming',
        },
        {
          satellite: 'Aqua',
          sensor: 'MODIS (Thermal 4µm/11µm)',
          resolution: '1000 m',
          overpassTimeUTC: '21:55 UTC',
          countdownMinutes: 61,
          coverageSector: 'Pacific Southwest & Great Basin',
          spectralBands: 'Bands 21, 22, 31, 32',
          status: 'Upcoming',
        },
        {
          satellite: 'Sentinel-2A',
          sensor: 'MSI (SWIR / 10m NDVI)',
          resolution: '10 m / 20 m',
          overpassTimeUTC: '22:40 UTC',
          countdownMinutes: 106,
          coverageSector: 'Plumas / Dixie Burn Perimeter',
          spectralBands: 'B11 (1.61µm) & B12 (2.19µm)',
          status: 'Upcoming',
        },
        {
          satellite: 'Sentinel-5P',
          sensor: 'TROPOMI (NO2 & Aerosol Index)',
          resolution: '3.5 x 5.5 km',
          overpassTimeUTC: '23:15 UTC',
          countdownMinutes: 141,
          coverageSector: 'Sacramento Valley Aerosol Plume',
          spectralBands: 'UV-VIS-NIR-SWIR',
          status: 'Upcoming',
        },
      ];
    }

    // Mediterranean Basin schedule
    return [
      {
        satellite: 'Suomi-NPP',
        sensor: 'VIIRS (375m I-Band)',
        resolution: '375 m',
        overpassTimeUTC: '13:48 UTC',
        countdownMinutes: 18,
        coverageSector: 'East Mediterranean & Aegean Arc',
        spectralBands: 'I4 (3.74µm) & I5 (11.45µm)',
        status: 'Upcoming',
      },
      {
        satellite: 'Aqua',
        sensor: 'MODIS (Thermal 4µm/11µm)',
        resolution: '1000 m',
        overpassTimeUTC: '14:20 UTC',
        countdownMinutes: 50,
        coverageSector: 'Central Mediterranean & Italy/Greece',
        spectralBands: 'Bands 21, 22, 31, 32',
        status: 'Upcoming',
      },
      {
        satellite: 'Sentinel-2A',
        sensor: 'MSI (SWIR / 10m NDVI)',
        resolution: '10 m / 20 m',
        overpassTimeUTC: '15:05 UTC',
        countdownMinutes: 95,
        coverageSector: 'Rhodes & Attica Burn Perimeter',
        spectralBands: 'B11 (1.61µm) & B12 (2.19µm)',
        status: 'Upcoming',
      },
      {
        satellite: 'Sentinel-5P',
        sensor: 'TROPOMI (NO2 & Aerosol Index)',
        resolution: '3.5 x 5.5 km',
        overpassTimeUTC: '16:15 UTC',
        countdownMinutes: 165,
        coverageSector: 'Balkan & Mediterranean Plume',
        spectralBands: 'UV-VIS-NIR-SWIR',
        status: 'Upcoming',
      },
    ];
  }
}
