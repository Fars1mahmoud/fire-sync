/**
 * Aerial Firefighting Fleet Management & Water Drop Service
 * Coordinates Canadair CL-415 Scooper and Sikorsky S-64 Air-Crane tactical assets,
 * calculating water drop coverage, turnaround replenishment intervals, and fuel endurance.
 */

import { TACTICAL_FLEET, type TacticalAircraft } from '../data/wildfireData';

export interface DropMissionResult {
  aircraftId: string;
  waterDeliveredLiters: number;
  remainingFuelPct: number;
  nextStatus: TacticalAircraft['status'];
  etaMinutesToNextDrop: number;
  hotspotSuppressionGainPct: number;
}

export class FleetService {
  private static fleet: TacticalAircraft[] = [...TACTICAL_FLEET];

  /**
   * Retrieves active tactical aircraft in theater
   */
  public static getActiveFleet(): TacticalAircraft[] {
    return [...this.fleet];
  }

  /**
   * Simulates a tactical water drop mission on a specified target hotspot
   */
  public static executeWaterDrop(aircraftId: string, currentTargetFrp: number): DropMissionResult {
    const idx = this.fleet.findIndex((a) => a.id === aircraftId);
    if (idx === -1) {
      throw new Error(`Aircraft ${aircraftId} not registered in tactical database.`);
    }

    const craft = this.fleet[idx];
    const waterDeliveredLiters = craft.waterCapacityLiters;
    const newFuel = Math.max(15, craft.fuelPct - 6);
    const newDrops = craft.dropsCompleted + 1;

    // Suppression gain is proportional to water payload relative to fire FRP
    const hotspotSuppressionGainPct = Math.min(22, Math.round((waterDeliveredLiters / (currentTargetFrp * 15)) * 10) / 10);

    // Update internal state
    const nextStatus: TacticalAircraft['status'] = newFuel < 25 ? 'Standby' : 'Refilling at Sea';
    this.fleet[idx] = {
      ...craft,
      fuelPct: newFuel,
      dropsCompleted: newDrops,
      status: nextStatus
    };

    return {
      aircraftId,
      waterDeliveredLiters,
      remainingFuelPct: newFuel,
      nextStatus,
      etaMinutesToNextDrop: 18, // 18-minute scoop & turn loop in Mediterranean
      hotspotSuppressionGainPct
    };
  }

  /**
   * Computes theater-wide aerial suppression statistics
   */
  public static getFleetTheaterMetrics() {
    const totalDrops = this.fleet.reduce((sum, a) => sum + a.dropsCompleted, 0);
    const totalWaterDeliveredLiters = this.fleet.reduce((sum, a) => sum + a.dropsCompleted * a.waterCapacityLiters, 0);
    const totalTons = Math.round(totalWaterDeliveredLiters / 1000);
    const activeAircraftCount = this.fleet.filter((a) => a.status !== 'Standby').length;

    return {
      totalAircraft: this.fleet.length,
      activeAircraftCount,
      totalDrops,
      totalWaterDeliveredLiters,
      totalWaterDeliveredTons: totalTons,
    };
  }
}
