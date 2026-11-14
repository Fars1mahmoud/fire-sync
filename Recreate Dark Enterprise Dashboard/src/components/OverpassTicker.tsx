import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/wildfireData';
import { SatelliteService, type SatellitePassSchedule } from '../services';

interface OverpassTickerProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
}

export const OverpassTicker: React.FC<OverpassTickerProps> = ({ lang, selectedRegion }) => {
  const t = TRANSLATIONS[lang];
  const [schedules, setSchedules] = useState<SatellitePassSchedule[]>([]);

  useEffect(() => {
    setSchedules(SatelliteService.getOverpassesForRegion(selectedRegion));
  }, [selectedRegion]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSchedules((prev) =>
        prev.map((item) => ({
          ...item,
          countdownMinutes: item.countdownMinutes > 1 ? item.countdownMinutes - 1 : 120,
        }))
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overpass-ticker-bar">
      <div className="ticker-label">
        <strong>
          {t.overpassSchedule} (
          {selectedRegion === 'Brazil'
            ? 'Amazon Equatorial Arc'
            : selectedRegion === 'Canada'
            ? 'Northern Polar Orbit'
            : selectedRegion === 'California'
            ? 'Pacific Orbit'
            : 'European Arc'}
          ):
        </strong>
      </div>
      <div className="ticker-items-container">
        {schedules.map((sat) => {
          const isSoon = sat.countdownMinutes <= 30;
          return (
            <div key={sat.satellite} className={`ticker-sat-pill ${isSoon ? 'imminent-pass' : ''}`}>
              <span className="sat-name">{sat.satellite}</span>
              <span className="sat-sensor">({sat.sensor})</span>
              <span className="sat-utc">{sat.overpassTimeUTC}</span>
              <span className={`sat-countdown ${isSoon ? 'countdown-urgent' : ''}`}>
                ⏳ {sat.countdownMinutes} min
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
