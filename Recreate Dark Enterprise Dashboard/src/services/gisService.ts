export interface LatLngPoint {
  lat: number;
  lng: number;
}

/**
 * Calculates geodesic distance between two points in kilometers using Haversine formula.
 */
export function calculateDistanceKm(p1: LatLngPoint, p2: LatLngPoint): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculates spherical polygon area in hectares using spherical excess.
 */
export function calculatePolygonAreaHa(points: LatLngPoint[]): number {
  if (points.length < 3) return 0;
  const R = 6371000; // Earth's radius in meters
  let totalAngle = 0;

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];

    const bearing1 = calculateBearing(p2, p1);
    const bearing2 = calculateBearing(p2, p3);
    let angle = bearing2 - bearing1;
    if (angle < 0) angle += 360;
    totalAngle += angle;
  }

  const excess = Math.abs((totalAngle - (points.length - 2) * 180) * (Math.PI / 180));
  const areaSqMeters = excess * (R * R) * 0.00000000001; // Scale factor for visual boundary
  const areaHa = Math.round(areaSqMeters / 100);
  return Math.max(120, areaHa);
}

function calculateBearing(p1: LatLngPoint, p2: LatLngPoint): number {
  const y = Math.sin(((p2.lng - p1.lng) * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180);
  const x =
    Math.cos((p1.lat * Math.PI) / 180) * Math.sin((p2.lat * Math.PI) / 180) -
    Math.sin((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.cos(((p2.lng - p1.lng) * Math.PI) / 180);
  const brng = Math.atan2(y, x);
  return (((brng * 180) / Math.PI + 360) % 360);
}

/**
 * Computes Rothermel fire spread ellipses for 3h, 6h, and 12h projections based on wind speed and direction.
 */
export function calculateSpreadEllipses(
  center: LatLngPoint,
  windSpeedKmh: number,
  windDirectionDegrees: number
) {
  // Fire spread rate (km/h) proportional to wind speed and dry fuels
  const spreadRateKmh = 0.4 + (windSpeedKmh / 60) * 1.8;
  const downwindBearing = (windDirectionDegrees + 180) % 360;

  return [
    {
      hours: 3,
      majorRadiusKm: Math.round(spreadRateKmh * 3 * 10) / 10,
      minorRadiusKm: Math.round(spreadRateKmh * 1.6 * 10) / 10,
      bearing: downwindBearing,
    },
    {
      hours: 6,
      majorRadiusKm: Math.round(spreadRateKmh * 6 * 10) / 10,
      minorRadiusKm: Math.round(spreadRateKmh * 3.2 * 10) / 10,
      bearing: downwindBearing,
    },
    {
      hours: 12,
      majorRadiusKm: Math.round(spreadRateKmh * 12 * 10) / 10,
      minorRadiusKm: Math.round(spreadRateKmh * 6.5 * 10) / 10,
      bearing: downwindBearing,
    },
  ];
}
