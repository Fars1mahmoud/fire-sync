import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/wildfireData';
import {
  WeatherService,
  RiskService,
  RegionService,
  type RegionalWeatherData,
  type RiskPredictionResult,
} from '../services';
import { RealMiniMap } from './RealMiniMap';

interface WeatherAndRiskProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
  activeFiresCount: number;
}

export const WeatherAndRisk: React.FC<WeatherAndRiskProps> = ({
  lang,
  selectedRegion,
  activeFiresCount,
}) => {
  const [weather, setWeather] = useState<RegionalWeatherData | null>(null);
  const [risk, setRisk] = useState<RiskPredictionResult | null>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    WeatherService.getRegionalWeather(selectedRegion).then((w) => {
      setWeather(w);

      const reg = RegionService.getRegionById(selectedRegion);
      // Compute transparent risk engine prediction
      const calculatedRisk = RiskService.computeRisk({
        region: selectedRegion,
        temperatureC: w.temperatureC,
        relativeHumidityPct: w.relativeHumidityPct,
        windSpeedKmh: w.windSpeedKmh,
        droughtIndexKBDI: w.droughtIndexKBDI,
        activeHotspotCount: activeFiresCount,
        historicalMonthAverage: reg ? Math.round(reg.baseActiveFires / 2) : 185,
      });

      setRisk(calculatedRisk);
    });
  }, [selectedRegion, activeFiresCount]);

  return (
    <div className="right-stack">
      {/* Live Weather Panel */}
      <div className="panel weather-panel">
        <div className="panel-head">
          <strong>{t.liveWeather}</strong>
          <small className="source-tag">
            {weather?.isLiveApiData ? 'LIVE OPEN-METEO' : t.nasaPower}
          </small>
        </div>
        <div className="weather-content">
          {/* Temperature Box */}
          <div className="temperature-box">
            <span className="sun-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="#ffb300" stroke="#ff8c00" strokeWidth="1">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" stroke="#ffb300" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="21" x2="12" y2="23" stroke="#ffb300" strokeWidth="2" strokeLinecap="round" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#ffb300" strokeWidth="2" strokeLinecap="round" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#ffb300" strokeWidth="2" strokeLinecap="round" />
                <line x1="1" y1="12" x2="3" y2="12" stroke="#ffb300" strokeWidth="2" strokeLinecap="round" />
                <line x1="21" y1="12" x2="23" y2="12" stroke="#ffb300" strokeWidth="2" strokeLinecap="round" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#ffb300" strokeWidth="2" strokeLinecap="round" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#ffb300" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <div className="temp-numbers">
              <b>{weather ? `${weather.temperatureC}°C` : '36.2°C'}</b>
              <small>
                {selectedRegion === 'Brazil'
                  ? (lang === 'ar' ? 'حرارة استوائية وجفاف حوض الأمازون' : 'Amazon Basin Tropical Heat')
                  : selectedRegion === 'Canada'
                  ? (lang === 'ar' ? 'موجة حر التايغا والغابات الشمالية' : 'Boreal Forest Summer Heat')
                  : selectedRegion === 'California'
                  ? (lang === 'ar' ? 'رياح سانتا آنا وحرارة شديدة' : 'Extreme Offshore Heat')
                  : (lang === 'ar' ? 'موجة حر متوسطية حادة' : 'Severe Mediterranean Heat')}
              </small>
            </div>
          </div>

          {/* Weather Metrics List */}
          <div className="weather-list">
            <div className="weather-metric">
              <span className="metric-icon">💨</span>
              <span className="metric-name">{lang === 'ar' ? 'سرعة الرياح' : 'Wind Speed'}</span>
              <b className="metric-val">{weather ? `${weather.windSpeedKmh} km/h` : '42 km/h'}</b>
            </div>

            <div className="weather-metric">
              <span className="metric-icon">🧭</span>
              <span className="metric-name">{lang === 'ar' ? 'اتجاه الرياح' : 'Wind Direction'}</span>
              <b className="metric-val">
                ↗ {weather ? `${weather.windCompass} (${weather.windDirectionDeg}°)` : 'NE (35°)'}
              </b>
            </div>

            <div className="weather-metric">
              <span className="metric-icon">💧</span>
              <span className="metric-name">{lang === 'ar' ? 'الرطوبة النسبية' : 'Humidity'}</span>
              <b className="metric-val">{weather ? `${weather.relativeHumidityPct}%` : '18%'}</b>
            </div>

            <div className="weather-metric danger">
              <span className="metric-icon">⚠️</span>
              <span className="metric-name">{lang === 'ar' ? 'مؤشر الجفاف (KBDI)' : 'Drought (KBDI)'}</span>
              <b className="metric-val">
                {weather ? `${weather.droughtIndexKBDI}` : '680'} ({weather?.droughtIndexKBDI && weather.droughtIndexKBDI > 700 ? 'Historic' : 'Extreme'})
              </b>
            </div>
          </div>
        </div>
      </div>

      {/* Fire Risk Prediction Panel */}
      <div className="panel risk-panel">
        <div className="panel-head">
          <strong>{t.fireRiskPrediction}</strong>
          <small className="source-tag">
            {risk ? `PHYSICAL ENGINE: ${risk.overallRiskPercentage}%` : t.next3Days}
          </small>
        </div>
        <div className="risk-content">
          <div className="risk-map-wrap" style={{ height: '110px' }}>
            <RealMiniMap
              lat={RegionService.getRegionById(selectedRegion).center.lat}
              lng={RegionService.getRegionById(selectedRegion).center.lng}
              zoom={6}
              type="risk"
              lang={lang}
            />
          </div>
          <div className="risk-key">
            <div className={`risk-level ${risk?.tier === 'Critical' ? 'active-tier' : ''}`}>
              <i className="badge-dot critical" />
              <div>
                <strong>{t.critical}</strong>
                <small>75–100%</small>
              </div>
            </div>

            <div className={`risk-level ${risk?.tier === 'High' ? 'active-tier' : ''}`}>
              <i className="badge-dot high" />
              <div>
                <strong>{t.high}</strong>
                <small>50–75%</small>
              </div>
            </div>

            <div className={`risk-level ${risk?.tier === 'Moderate' ? 'active-tier' : ''}`}>
              <i className="badge-dot moderate" />
              <div>
                <strong>{t.moderate}</strong>
                <small>20–50%</small>
              </div>
            </div>

            <div className={`risk-level ${risk?.tier === 'Low' ? 'active-tier' : ''}`}>
              <i className="badge-dot low" />
              <div>
                <strong>{t.low}</strong>
                <small>0–20%</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
