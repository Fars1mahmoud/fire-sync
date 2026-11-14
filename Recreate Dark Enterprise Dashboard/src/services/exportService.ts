/**
 * GIS Data Export & Interoperability Service
 * Handles standards-compliant export formats:
 * - OGC GeoJSON (EPSG:4326)
 * - OGC KML 2.2 (Google Earth & Tactical COP)
 * - Standard Tabular CSV for statistical modeling
 */

import type { Hotspot } from '../data/wildfireData';

export class ExportService {
  public static exportToGeoJSON(hotspots: Hotspot[]): string {
    const geojson = {
      type: 'FeatureCollection',
      metadata: {
        generator: 'NASA FireGuard Enterprise GIS',
        timestamp: new Date().toISOString(),
        count: hotspots.length,
        crs: {
          type: 'name',
          properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
        }
      },
      features: hotspots.map((h) => ({
        type: 'Feature',
        id: h.id,
        geometry: {
          type: 'Point',
          coordinates: [h.lon, h.lat]
        },
        properties: {
          name: h.name,
          country: h.country,
          frp_mw: h.frp,
          temp_k: h.tempK,
          confidence_pct: h.confidence,
          satellite_sensor: h.satellite,
          status: h.status,
          burned_acres: h.acres,
          time_utc: h.timeDetected
        }
      }))
    };
    return JSON.stringify(geojson, null, 2);
  }

  public static exportToKML(hotspots: Hotspot[]): string {
    const placemarks = hotspots.map((h) => `
    <Placemark>
      <name>${h.name} [${h.frp} MW]</name>
      <description><![CDATA[
        <h3>${h.name}</h3>
        <p><b>Status:</b> ${h.status}</p>
        <p><b>FRP:</b> ${h.frp} MW</p>
        <p><b>Sensor:</b> ${h.satellite} (${h.confidence}% conf)</p>
        <p><b>Detection Time:</b> ${h.timeDetected}</p>
        <p><b>Estimated Burn Area:</b> ${h.acres.toLocaleString()} acres</p>
      ]]></description>
      <Point>
        <coordinates>${h.lon},${h.lat},0</coordinates>
      </Point>
    </Placemark>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>NASA FireGuard Hotspots Feed</name>
    <open>1</open>
    ${placemarks}
  </Document>
</kml>`;
  }

  public static exportToCSV(hotspots: Hotspot[]): string {
    const header = 'id,name,country,latitude,longitude,frp_mw,brightness_temp_k,confidence,satellite,status,acres,time_utc\n';
    const rows = hotspots.map((h) =>
      `"${h.id}","${h.name}","${h.country}",${h.lat},${h.lon},${h.frp},${h.tempK},${h.confidence},"${h.satellite}","${h.status}",${h.acres},"${h.timeDetected}"`
    ).join('\n');
    return header + rows;
  }

  public static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
