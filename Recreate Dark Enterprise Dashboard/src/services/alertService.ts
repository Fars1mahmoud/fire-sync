/**
 * Emergency Alert & Community Ground Truth Service
 * Generates Common Alerting Protocol (CAP) emergency broadcasts,
 * calculates critical infrastructure proximity threats, and verifies citizen reports.
 */

import { calculateDistanceKm, type LatLngPoint } from './gisService';

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: 'Hospital' | 'Substation' | 'School' | 'Gas Pipeline' | 'Port';
  coords: LatLngPoint;
  distanceKm?: number;
  threatLevel: 'Immediate' | 'Elevated' | 'Monitored';
}

export interface CitizenReport {
  id: string;
  location: string;
  coords: LatLngPoint;
  type: 'Confirmed Fire' | 'Possible Fire' | 'False Detection';
  timestamp: string;
  verified: boolean;
  reporterId: string;
  notes: string;
}

export class AlertService {
  private static criticalAssets: InfrastructureAsset[] = [
    { id: 'INF-01', name: 'General Hospital of Rhodes', type: 'Hospital', coords: { lat: 36.42, lng: 28.21 }, threatLevel: 'Monitored' },
    { id: 'INF-02', name: 'Soroni Power Generation Substation', type: 'Substation', coords: { lat: 36.36, lng: 27.99 }, threatLevel: 'Immediate' },
    { id: 'INF-03', name: 'Archangelos Regional High School', type: 'School', coords: { lat: 36.21, lng: 28.11 }, threatLevel: 'Elevated' },
    { id: 'INF-04', name: 'South Aegean Natural Gas Feeder', type: 'Gas Pipeline', coords: { lat: 36.28, lng: 28.02 }, threatLevel: 'Immediate' },
  ];

  private static citizenReports: CitizenReport[] = [
    {
      id: 'REP-01',
      location: 'Laerma Ridge East',
      coords: { lat: 36.15, lng: 27.93 },
      type: 'Confirmed Fire',
      timestamp: '14:22 UTC',
      verified: true,
      reporterId: 'ForestGuard-Unit-9',
      notes: 'Crown fire spotted spreading south towards coastal road.'
    },
    {
      id: 'REP-02',
      location: 'Kiotari Beach Access',
      coords: { lat: 36.05, lng: 27.96 },
      type: 'Possible Fire',
      timestamp: '14:05 UTC',
      verified: true,
      reporterId: 'CivicVolunteer-44',
      notes: 'Thick black smoke billowing over olive groves.'
    },
    {
      id: 'REP-03',
      location: 'Gennadi Rural Track',
      coords: { lat: 36.02, lng: 27.91 },
      type: 'False Detection',
      timestamp: '13:50 UTC',
      verified: false,
      reporterId: 'CivicVolunteer-12',
      notes: 'Agricultural permitted burn; contained in stone basin.'
    }
  ];

  /**
   * Assesses proximity of critical infrastructure to an active fire point
   */
  public static assessInfrastructureThreats(fireCoords: LatLngPoint): InfrastructureAsset[] {
    return this.criticalAssets.map((asset) => {
      const distanceKm = calculateDistanceKm(fireCoords, asset.coords);
      let threatLevel: InfrastructureAsset['threatLevel'] = 'Monitored';
      if (distanceKm < 6) threatLevel = 'Immediate';
      else if (distanceKm < 15) threatLevel = 'Elevated';

      return {
        ...asset,
        distanceKm,
        threatLevel
      };
    }).sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  }

  /**
   * Generates CAP-compliant emergency broadcast message
   */
  public static generateEmergencyBroadcast(targetSector: string, firelineDistanceKm: number, safeShelter: string) {
    const timestamp = new Date().toISOString();
    return {
      identifier: `NASA-FIREGUARD-CAP-${Date.now()}`,
      sender: 'NASA FireGuard Tactical Ops / Civil Protection Coordination',
      sent: timestamp,
      status: 'Actual',
      msgType: 'Alert',
      scope: 'Public',
      headlineEn: `EMERGENCY EVACUATION ORDER: ${targetSector.toUpperCase()}`,
      headlineAr: `أمر إخلاء طارئ: ${targetSector}`,
      descriptionEn: `Rapidly spreading wildfire detected within ${firelineDistanceKm} km of ${targetSector}. Immediate evacuation ordered along Designated Safe Route 01 toward ${safeShelter}. Do NOT use secondary mountain roads.`,
      descriptionAr: `تم رصد حريق بري سريع الانتشار على بعد ${firelineDistanceKm} كم من ${targetSector}. تم إصدار أمر إخلاء فوري عبر الطريق الآمن 01 باتجاه ${safeShelter}. لا تستخدم الطرق الجبلية الفرعية.`,
      recommendedAction: 'Evacuate Immediately via Route 01',
      channels: ['Cell Broadcast (WEA)', 'Sirens / VHF Channel 16', 'Satellite EAS', 'Civil Protection SMS']
    };
  }

  /**
   * Retrieves crowdsourced citizen reports
   */
  public static getCitizenReports(): CitizenReport[] {
    return [...this.citizenReports];
  }

  /**
   * Submits a new citizen report
   */
  public static submitCitizenReport(report: Omit<CitizenReport, 'id' | 'timestamp' | 'verified'>): CitizenReport {
    const newReport: CitizenReport = {
      ...report,
      id: `REP-0${this.citizenReports.length + 1}`,
      timestamp: `${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')} UTC`,
      verified: true
    };
    this.citizenReports.unshift(newReport);
    return newReport;
  }
}
