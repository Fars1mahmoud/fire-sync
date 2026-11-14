import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Maximize2,
  Minimize2,
  Layers,
  Play,
  Pause,
  CloudSun,
  Radio,
  Eye,
  MapPin
} from 'lucide-react';
import { MetricMode, Language, StationData, RegionData } from './weatherTypes';

interface MapRadarViewerProps {
  currentRegion: RegionData;
  activeMode: MetricMode;
  onSelectMode: (mode: MetricMode) => void;
  language: Language;
  onSelectStation?: (station: StationData) => void;
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  length: number;
  age: number;
  maxAge: number;
  prevX: number;
  prevY: number;
}

export const MapRadarViewer: React.FC<MapRadarViewerProps> = ({
  currentRegion,
  activeMode,
  onSelectMode,
  language,
  onSelectStation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [activeLayerStreamlines, setActiveLayerStreamlines] = useState(true);
  const [activeLayerHeatmap, setActiveLayerHeatmap] = useState(true);
  const [activeLayerStations, setActiveLayerStations] = useState(true);
  const [activeLayerContours, setActiveLayerContours] = useState(true);
  const [activeLayerHUD, setActiveLayerHUD] = useState(true);

  // High-density wind particle vector simulation (360 particles for silky fluidity)
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const isAr = language === 'ar';

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Initialize high-density particles
  const initParticles = useCallback((width: number, height: number) => {
    const count = 340;
    const parts: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const px = Math.random() * (width + 100) - 50;
      const py = Math.random() * (height + 100) - 50;
      parts.push({
        x: px,
        y: py,
        prevX: px,
        prevY: py,
        speed: 1.1 + Math.random() * 2.4,
        length: 16 + Math.random() * 32,
        age: Math.floor(Math.random() * 120),
        maxAge: 70 + Math.floor(Math.random() * 90),
      });
    }
    particlesRef.current = parts;
  }, []);

  // Vector field calculation: fluid diagonal flow from North-West to South-East following the valley
  const getFlowVector = (x: number, y: number, width: number, height: number) => {
    const nx = x / width;
    const ny = y / height;

    // Curved atmospheric current cutting diagonally down-right along the valley corridor
    const baseAngle = Math.PI * 0.18; // ~32 degrees down-right

    // Mountain canyon curvature: curves south-east then flattens towards right
    const canyonCurve = Math.sin(nx * 2.8 + ny * 1.6) * 0.35 + Math.cos(nx * 1.5 - ny * 2.2) * 0.2;
    const angle = baseAngle + canyonCurve;

    // Acceleration through narrow thermal corridor
    const distFromCorridor = Math.abs((ny - 0.2) - (nx * 0.7));
    const speedBoost = distFromCorridor < 0.25 ? 1.6 : 0.9;
    const speed = (1.2 + Math.sin(nx * 3 + ny * 2) * 0.3) * speedBoost;

    return {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle,
      speed,
    };
  };

  // Draw the exact authentic satellite & topographic radar map from Image 2
  const drawHeatmapBackground = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // 1. Deep Space Navy Satellite Baseline
      ctx.fillStyle = '#061324';
      ctx.fillRect(0, 0, width, height);

      // 2. Realistic Topographical Relief & Mountain Slopes (Dark satellite terrain)
      const terrainGrad = ctx.createLinearGradient(0, 0, width, height);
      terrainGrad.addColorStop(0, '#0a1d35');
      terrainGrad.addColorStop(0.35, '#07172b');
      terrainGrad.addColorStop(0.7, '#0d2238');
      terrainGrad.addColorStop(1, '#050f1d');
      ctx.fillStyle = terrainGrad;
      ctx.fillRect(0, 0, width, height);

      // Topographic mountain ridges (multi-layer shading)
      ctx.save();
      // Mountain ridge 1: Northern plateau
      ctx.beginPath();
      ctx.moveTo(0, height * 0.25);
      ctx.bezierCurveTo(width * 0.2, height * 0.12, width * 0.35, height * 0.28, width * 0.55, height * 0.15);
      ctx.bezierCurveTo(width * 0.75, height * 0.05, width * 0.9, height * 0.2, width, height * 0.1);
      ctx.lineTo(width, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(10, 31, 56, 0.65)';
      ctx.fill();

      // Mountain ridge 2: Southern mountain mass
      ctx.beginPath();
      ctx.moveTo(0, height * 0.75);
      ctx.bezierCurveTo(width * 0.25, height * 0.68, width * 0.45, height * 0.85, width * 0.7, height * 0.78);
      ctx.bezierCurveTo(width * 0.85, height * 0.72, width * 0.95, height * 0.9, width, height * 0.85);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = 'rgba(8, 24, 44, 0.75)';
      ctx.fill();
      ctx.restore();

      // 3. Winding Canyon River & Alpine Lake Pockets (Exact blue water features from Image 2)
      ctx.save();
      // Lake 1: Alpine basin in upper-left (at x: 27%, y: 17%)
      ctx.beginPath();
      ctx.ellipse(width * 0.27, height * 0.18, width * 0.022, height * 0.035, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Lake 2: Valley reservoir (at x: 45%, y: 64%)
      ctx.beginPath();
      ctx.ellipse(width * 0.45, height * 0.64, width * 0.016, height * 0.018, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#0369a1';
      ctx.fill();

      // Lake 3: Downstream reservoir (at x: 57%, y: 68%)
      ctx.beginPath();
      ctx.ellipse(width * 0.57, height * 0.68, width * 0.018, height * 0.015, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();

      // Canyon River Flow cutting through the mountains
      ctx.beginPath();
      ctx.moveTo(width * 0.18, height * 0.05);
      ctx.bezierCurveTo(width * 0.24, height * 0.12, width * 0.26, height * 0.15, width * 0.27, height * 0.18);
      ctx.bezierCurveTo(width * 0.28, height * 0.26, width * 0.32, height * 0.34, width * 0.38, height * 0.42);
      ctx.bezierCurveTo(width * 0.42, height * 0.52, width * 0.46, height * 0.62, width * 0.56, height * 0.67);
      ctx.bezierCurveTo(width * 0.66, height * 0.72, width * 0.74, height * 0.78, width * 0.88, height * 0.88);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.stroke();

      // River white highlight thread
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 0;
      ctx.stroke();
      ctx.restore();

      // 4. FALSE-COLOR THERMAL & MULTI-SPECTRAL RADAR HEATMAP (Exact Match to Image 2!)
      if (activeLayerHeatmap) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        if (activeMode === 'temperature' || activeMode === 'drought') {
          // A. Massive Central & South-Eastern Radiant Heat Corridors
          // Fiery crimson canyon faultline (Deep red core from Image 2)
          const fieryFault1 = ctx.createRadialGradient(
            width * 0.37, height * 0.58, 6,
            width * 0.37, height * 0.58, width * 0.12
          );
          fieryFault1.addColorStop(0, 'rgba(239, 68, 68, 0.95)'); // Pure crimson
          fieryFault1.addColorStop(0.4, 'rgba(220, 38, 38, 0.8)');
          fieryFault1.addColorStop(0.7, 'rgba(234, 88, 12, 0.5)');
          fieryFault1.addColorStop(1, 'transparent');
          ctx.fillStyle = fieryFault1;
          ctx.fillRect(0, 0, width, height);

          // Fiery faultline peak 2 along the winding canyon
          const fieryFault2 = ctx.createRadialGradient(
            width * 0.68, height * 0.6, 12,
            width * 0.68, height * 0.6, width * 0.16
          );
          fieryFault2.addColorStop(0, 'rgba(220, 38, 38, 0.95)');
          fieryFault2.addColorStop(0.35, 'rgba(234, 88, 12, 0.85)');
          fieryFault2.addColorStop(0.7, 'rgba(245, 158, 11, 0.6)');
          fieryFault2.addColorStop(1, 'transparent');
          ctx.fillStyle = fieryFault2;
          ctx.fillRect(0, 0, width, height);

          // Fiery faultline peak 3 (South-East edge near bottom-right)
          const fieryFault3 = ctx.createRadialGradient(
            width * 0.82, height * 0.76, 10,
            width * 0.82, height * 0.76, width * 0.18
          );
          fieryFault3.addColorStop(0, 'rgba(220, 38, 38, 0.9)');
          fieryFault3.addColorStop(0.4, 'rgba(234, 88, 12, 0.75)');
          fieryFault3.addColorStop(0.75, 'rgba(202, 138, 4, 0.45)');
          fieryFault3.addColorStop(1, 'transparent');
          ctx.fillStyle = fieryFault3;
          ctx.fillRect(0, 0, width, height);

          // B. Broad Golden-Yellow & Amber Thermal Expanse (Matching Image 2's glowing eastern plateau)
          const goldenExpanse = ctx.createRadialGradient(
            width * 0.62, height * 0.52, width * 0.05,
            width * 0.62, height * 0.52, width * 0.38
          );
          goldenExpanse.addColorStop(0, 'rgba(245, 158, 11, 0.92)'); // Amber
          goldenExpanse.addColorStop(0.25, 'rgba(234, 179, 8, 0.85)'); // Yellow
          goldenExpanse.addColorStop(0.5, 'rgba(132, 204, 22, 0.65)'); // Lime
          goldenExpanse.addColorStop(0.75, 'rgba(16, 185, 129, 0.45)'); // Emerald green
          goldenExpanse.addColorStop(1, 'rgba(2, 132, 199, 0)'); // Blue edge
          ctx.fillStyle = goldenExpanse;
          ctx.fillRect(0, 0, width, height);

          // Secondary western slope warmth
          const westWarmth = ctx.createRadialGradient(
            width * 0.28, height * 0.48, width * 0.04,
            width * 0.28, height * 0.48, width * 0.32
          );
          westWarmth.addColorStop(0, 'rgba(234, 179, 8, 0.75)');
          westWarmth.addColorStop(0.45, 'rgba(16, 185, 129, 0.55)');
          westWarmth.addColorStop(0.8, 'rgba(6, 182, 212, 0.35)');
          westWarmth.addColorStop(1, 'transparent');
          ctx.fillStyle = westWarmth;
          ctx.fillRect(0, 0, width, height);

          // C. Northern Mountain Hotspot Halo (Exact prominent beacon from Image 2!)
          const northBeaconHalo = ctx.createRadialGradient(
            width * 0.48, height * 0.12, 4,
            width * 0.48, height * 0.12, width * 0.09
          );
          northBeaconHalo.addColorStop(0, 'rgba(255, 255, 255, 1)'); // White core
          northBeaconHalo.addColorStop(0.25, 'rgba(254, 240, 138, 0.95)'); // Pale yellow
          northBeaconHalo.addColorStop(0.55, 'rgba(249, 115, 22, 0.85)'); // Orange ring
          northBeaconHalo.addColorStop(0.85, 'rgba(239, 68, 68, 0.5)'); // Crimson fringe
          northBeaconHalo.addColorStop(1, 'transparent');
          ctx.fillStyle = northBeaconHalo;
          ctx.fillRect(0, 0, width, height);

          // D. Ambient Cyan & Sapphire Blue cool mountain air (Top-left & edges)
          const coolAir = ctx.createRadialGradient(
            width * 0.15, height * 0.2, width * 0.08,
            width * 0.15, height * 0.2, width * 0.5
          );
          coolAir.addColorStop(0, 'rgba(6, 182, 212, 0.55)');
          coolAir.addColorStop(0.5, 'rgba(14, 165, 233, 0.35)');
          coolAir.addColorStop(1, 'transparent');
          ctx.fillStyle = coolAir;
          ctx.fillRect(0, 0, width, height);
        } else if (activeMode === 'wind') {
          // Wind kinetic velocity field (Emerald green to Electric cyan)
          const windField = ctx.createRadialGradient(
            width * 0.5, height * 0.55, width * 0.08,
            width * 0.5, height * 0.55, width * 0.55
          );
          windField.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
          windField.addColorStop(0.35, 'rgba(6, 182, 212, 0.65)');
          windField.addColorStop(0.7, 'rgba(59, 130, 246, 0.4)');
          windField.addColorStop(1, 'transparent');
          ctx.fillStyle = windField;
          ctx.fillRect(0, 0, width, height);
        } else {
          // Humidity relative vapor field (Deep Teal & Azure)
          const humField = ctx.createRadialGradient(
            width * 0.45, height * 0.5, width * 0.1,
            width * 0.45, height * 0.5, width * 0.6
          );
          humField.addColorStop(0, 'rgba(14, 165, 233, 0.8)');
          humField.addColorStop(0.4, 'rgba(56, 189, 248, 0.55)');
          humField.addColorStop(0.8, 'rgba(37, 99, 235, 0.3)');
          humField.addColorStop(1, 'transparent');
          ctx.fillStyle = humField;
          ctx.fillRect(0, 0, width, height);
        }

        ctx.restore();
      }

      // 5. CRISP GEOGRAPHIC & WATERSHED VECTOR CONTOURS (Exact white/cyan lines from Image 2!)
      if (activeLayerContours) {
        ctx.save();
        ctx.strokeStyle = 'rgba(241, 245, 249, 0.75)';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 4;

        // Main Western Basin Boundary Contour (matches Image 2 left polygon)
        ctx.beginPath();
        ctx.moveTo(width * 0.06, height * 0.22);
        ctx.lineTo(width * 0.08, height * 0.28);
        ctx.lineTo(width * 0.05, height * 0.35);
        ctx.lineTo(width * 0.07, height * 0.45);
        ctx.lineTo(width * 0.06, height * 0.55);
        ctx.bezierCurveTo(width * 0.08, height * 0.62, width * 0.12, height * 0.66, width * 0.18, height * 0.69);
        ctx.bezierCurveTo(width * 0.24, height * 0.72, width * 0.32, height * 0.66, width * 0.38, height * 0.63);
        ctx.stroke();

        // Central Plateau & Faultline Boundary (matches Image 2 central white vector)
        ctx.beginPath();
        ctx.moveTo(width * 0.2, height * 0.38);
        ctx.bezierCurveTo(width * 0.25, height * 0.28, width * 0.28, height * 0.16, width * 0.46, height * 0.13);
        ctx.bezierCurveTo(width * 0.48, height * 0.12, width * 0.52, height * 0.22, width * 0.6, height * 0.3);
        ctx.bezierCurveTo(width * 0.64, height * 0.34, width * 0.68, height * 0.48, width * 0.74, height * 0.58);
        ctx.bezierCurveTo(width * 0.78, height * 0.65, width * 0.82, height * 0.74, width * 0.86, height * 0.84);
        ctx.stroke();

        // Secondary subtle topographic elevation curves
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        for (let r = 0.18; r <= 0.62; r += 0.14) {
          ctx.beginPath();
          ctx.ellipse(width * 0.54, height * 0.48, width * r, height * (r * 0.72), -0.25, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 6. Draw Northern Hotspot Icon Badge (Cloud/Sun beacon on the yellow halo)
      ctx.save();
      const nx = width * 0.48;
      const ny = height * 0.12;

      // Concentric pulsating radar rings
      ctx.beginPath();
      ctx.arc(nx, ny, 18, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 237, 74, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(nx, ny, 24, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Golden center disc
      ctx.beginPath();
      ctx.arc(nx, ny, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fill();

      // White sun icon inside
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(nx, ny, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 7. Mountain Snow Peak Indicator at (x: 13%, y: 19%) from Image 2
      ctx.save();
      ctx.fillStyle = 'rgba(248, 250, 252, 0.85)';
      ctx.beginPath();
      ctx.moveTo(width * 0.12, height * 0.2);
      ctx.lineTo(width * 0.14, height * 0.17);
      ctx.lineTo(width * 0.16, height * 0.2);
      ctx.closePath();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    },
    [activeMode, activeLayerHeatmap, activeLayerContours]
  );

  // Main canvas animation loop with high-density silky wind streamline vectors
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 560);

    initParticles(width, height);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      initParticles(width, height);
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      // 1. Redraw realistic satellite terrain and multi-spectral heat corridor
      drawHeatmapBackground(ctx, width, height);

      // 2. Animate silky, dense white wind streamline particles (Exact match to Image 2!)
      if (activeLayerStreamlines) {
        ctx.save();
        const particles = particlesRef.current;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          if (isPlaying) {
            p.prevX = p.x;
            p.prevY = p.y;

            const flow = getFlowVector(p.x, p.y, width, height);
            p.x += flow.vx * p.speed;
            p.y += flow.vy * p.speed;
            p.age++;

            // Reset when leaving frame or exceeding max age
            if (p.x > width + 40 || p.y > height + 40 || p.x < -40 || p.y < -40 || p.age > p.maxAge) {
              // Spawn along top-left boundary
              if (Math.random() < 0.6) {
                p.x = Math.random() * (width * 0.8) - 30;
                p.y = Math.random() * (height * 0.4) - 30;
              } else {
                p.x = -20;
                p.y = Math.random() * height;
              }
              p.prevX = p.x;
              p.prevY = p.y;
              p.age = 0;
            }
          }

          // Calculate particle opacity curve with soft motion fade
          const flow = getFlowVector(p.x, p.y, width, height);
          const progress = p.age / p.maxAge;
          const alpha = Math.sin(progress * Math.PI) * 0.9;

          if (alpha > 0.04) {
            const tailX = p.x - Math.cos(flow.angle) * p.length;
            const tailY = p.y - Math.sin(flow.angle) * p.length;

            const grad = ctx.createLinearGradient(tailX, tailY, p.x, p.y);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.45})`);
            grad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            // Smooth curve segment
            ctx.quadraticCurveTo((tailX + p.x) / 2, (tailY + p.y) / 2 + 0.8, p.x, p.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.35;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Luminous glowing head dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.25, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
          }
        }
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [drawHeatmapBackground, initParticles, activeLayerStreamlines, isPlaying]);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden border border-[#1c354a] bg-[#06121e] shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full h-full min-h-[520px]'
      }`}
    >
      {/* Top Controls Bar with Segmented Metric Tabs */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between gap-3 pointer-events-none">
        {/* Metric Mode Filter Tabs */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-[#0a1b2a]/90 backdrop-blur-md rounded-xl border border-[#1c354a] shadow-lg">
          {(
            [
              { key: 'temperature', label: 'Temperature', labelAr: 'درجة الحرارة' },
              { key: 'wind', label: 'Wind', labelAr: 'الرياح' },
              { key: 'humidity', label: 'Humidity', labelAr: 'الرطوبة' },
              { key: 'drought', label: 'Drought Index', labelAr: 'مؤشر الجفاف' },
            ] as const
          ).map((tab) => {
            const isActive = activeMode === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onSelectMode(tab.key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#148cf4] text-white shadow-md shadow-sky-600/30 font-bold scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {isAr ? tab.labelAr : tab.label}
              </button>
            );
          })}
        </div>

        {/* Action icons on the right: Layers & Fullscreen */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-[#0a1b2a]/90 backdrop-blur-md rounded-xl border border-[#1c354a] shadow-lg">
          <button
            onClick={() => setShowLayersMenu(!showLayersMenu)}
            title={isAr ? 'طبقات الرادار' : 'Radar Layers'}
            className={`p-2 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white ${
              showLayersMenu ? 'bg-sky-600/30 text-sky-300' : 'hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            title={isAr ? 'ملء الشاشة' : 'Fullscreen'}
            className="p-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-300 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Layers Menu Dropdown */}
      {showLayersMenu && (
        <div className="absolute top-16 right-4 z-40 w-56 p-3 bg-[#0a1b2a]/95 backdrop-blur-xl border border-[#1c354a] rounded-xl shadow-2xl text-xs space-y-2 text-slate-200">
          <div className="font-semibold text-sky-400 pb-1 border-b border-sky-900/60 flex items-center justify-between">
            <span>{isAr ? 'طبقات الخريطة' : 'Map Layers'}</span>
            <span className="text-[10px] text-slate-400 font-mono">v4.2</span>
          </div>
          <label className="flex items-center justify-between cursor-pointer hover:text-white py-1">
            <span>{isAr ? 'تيارات الرياح (Streamlines)' : 'Wind Streamlines'}</span>
            <input
              type="checkbox"
              checked={activeLayerStreamlines}
              onChange={(e) => setActiveLayerStreamlines(e.target.checked)}
              className="accent-sky-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-white py-1">
            <span>{isAr ? 'المخطط الحراري (Heatmap)' : 'Thermal Heatmap'}</span>
            <input
              type="checkbox"
              checked={activeLayerHeatmap}
              onChange={(e) => setActiveLayerHeatmap(e.target.checked)}
              className="accent-sky-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-white py-1">
            <span>{isAr ? 'خطوط الارتفاع (Contours)' : 'Elevation Contours'}</span>
            <input
              type="checkbox"
              checked={activeLayerContours}
              onChange={(e) => setActiveLayerContours(e.target.checked)}
              className="accent-sky-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-white py-1">
            <span>{isAr ? 'محطات الرصد (Stations)' : 'Monitoring Stations'}</span>
            <input
              type="checkbox"
              checked={activeLayerStations}
              onChange={(e) => setActiveLayerStations(e.target.checked)}
              className="accent-sky-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-white py-1">
            <span>{isAr ? 'لوحات البيانات (HUD Cards)' : 'HUD Overlay Cards'}</span>
            <input
              type="checkbox"
              checked={activeLayerHUD}
              onChange={(e) => setActiveLayerHUD(e.target.checked)}
              className="accent-sky-500"
            />
          </label>

          <div className="pt-2 border-t border-sky-900/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{isAr ? 'حركة الجسيمات' : 'Particle Motion'}</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 px-2 rounded bg-sky-700/40 hover:bg-sky-600/50 text-white flex items-center gap-1 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? (isAr ? 'إيقاف' : 'Pause') : isAr ? 'تشغيل' : 'Play'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Compass Rose in Top-Left (Exact Match to Image 2!) */}
      <div className="absolute top-16 left-4 z-20 pointer-events-auto">
        <div className="relative w-10 h-10 rounded-full bg-white/95 shadow-xl shadow-black/50 flex items-center justify-center border-2 border-slate-300">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute top-0.5 text-[8px] font-extrabold text-red-600 tracking-tighter">N</div>
            <svg viewBox="0 0 24 24" className="w-6 h-6 drop-shadow">
              <polygon points="12,2 15,12 12,10 9,12" fill="#dc2626" />
              <polygon points="12,22 15,12 12,10 9,12" fill="#475569" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Interactive Radar Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Station Markers Overlay on Map */}
        {activeLayerStations &&
          currentRegion.stations.map((st) => {
            return (
              <div
                key={st.id}
                style={{ left: `${st.xPercent}%`, top: `${st.yPercent}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                onClick={() => {
                  setSelectedStation(st);
                  onSelectStation?.(st);
                }}
              >
                <span className="absolute -inset-2 rounded-full bg-amber-400/40 animate-ping" />
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full border shadow-lg transition-transform hover:scale-125 ${
                    st.status === 'Extreme'
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-500 border-amber-200 text-slate-900'
                      : 'bg-gradient-to-tr from-sky-500 to-indigo-600 border-sky-200 text-white'
                  }`}
                >
                  <CloudSun className="w-4 h-4 animate-pulse" />
                </div>

                {/* Hover / Tooltip Station Card */}
                <div className="absolute bottom-9 left-1/2 -translate-x-1/2 hidden group-hover:block z-30 w-44 p-2.5 rounded-lg bg-[#071322]/95 backdrop-blur-md border border-sky-400/30 text-white shadow-xl pointer-events-none">
                  <div className="text-[11px] font-bold text-sky-300 truncate">{st.name}</div>
                  <div className="flex items-center justify-between text-[10px] mt-1 text-slate-300">
                    <span>{isAr ? 'درجة الحرارة' : 'Temp'}:</span>
                    <span className="font-mono font-bold text-amber-300">{st.temp}°C</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span>{isAr ? 'الرياح' : 'Wind'}:</span>
                    <span className="font-mono">{st.windSpeed} km/h {st.windDir}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span>{isAr ? 'الرطوبة' : 'Humidity'}:</span>
                    <span className="font-mono">{st.humidity}%</span>
                  </div>
                </div>
              </div>
            );
          })}

        {/* 3 Floating Frosted Glass HUD Cards at the Bottom (Exact Match to Image 2!) */}
        {activeLayerHUD && (
          <div className="absolute bottom-3 inset-x-3 z-20 flex flex-wrap lg:flex-nowrap items-end justify-between gap-3 pointer-events-none">
            {/* Card 1: Exposure Assessment (Exact layout & styling from Image 2) */}
            <div className="pointer-events-auto flex-1 min-w-[220px] max-w-[340px] p-2.5 rounded-xl bg-[#061426]/90 backdrop-blur-md border border-sky-500/25 shadow-2xl text-slate-200">
              {/* Mini Pill Tag over header */}
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-1.5 rounded-full bg-sky-950/80 border border-sky-500/30 text-[9px] text-sky-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>InterLink • Live</span>
              </div>
              <div className="flex items-center justify-between mb-1 pb-1 border-b border-sky-900/60">
                <span className="text-[11px] font-bold text-sky-300 tracking-wide">
                  {isAr ? 'تقييم التعرض الإقليمي' : 'Exposure Assessment'}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-900/60 text-sky-300 font-mono">
                  LIVE
                </span>
              </div>
              <table className="w-full text-[9px] text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-sky-900/40">
                    <th className="py-0.5 font-medium">{isAr ? 'المنطقة' : 'District'}</th>
                    <th className="py-0.5 font-medium text-center">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="py-0.5 font-medium text-right">{isAr ? 'أقصى تعرض' : 'Max Exp'}</th>
                    <th className="py-0.5 font-medium text-right">{isAr ? 'المخاطر' : 'Risk'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-950/50">
                  {currentRegion.exposureList.slice(0, 3).map((item) => (
                    <tr key={item.id} className="hover:bg-sky-900/20 transition-colors">
                      <td className="py-0.5 font-medium text-slate-300 truncate max-w-[90px]">
                        {isAr ? item.districtAr : item.district}
                      </td>
                      <td className="py-0.5 text-center text-slate-400 truncate max-w-[65px]">
                        {isAr ? item.statusAr : item.status}
                      </td>
                      <td className="py-0.5 text-right font-mono font-semibold text-amber-300">
                        {item.maxExp}
                      </td>
                      <td className="py-0.5 text-right font-semibold" style={{ color: item.riskColor }}>
                        {item.riskLevel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card 2: Radar Outlook (Exact layout from Image 2) */}
            <div className="pointer-events-auto flex-1 min-w-[200px] max-w-[280px] p-2.5 rounded-xl bg-[#061426]/90 backdrop-blur-md border border-sky-500/25 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between mb-1 pb-1 border-b border-sky-900/60">
                <span className="text-[11px] font-bold text-sky-300 tracking-wide">
                  {isAr ? 'توقعات الرادار' : 'Radar Outlook'}
                </span>
                <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synced
                </span>
              </div>
              <div className="space-y-1.5">
                {currentRegion.radarOutlook.map((ro) => (
                  <div
                    key={ro.id}
                    className="flex items-center justify-between text-[9px] py-0.5 border-b border-sky-950/40 last:border-0"
                  >
                    <span className="text-slate-300 truncate max-w-[80px]">
                      {isAr ? ro.stationAr : ro.station}
                    </span>
                    <span className="font-mono text-sky-300">{ro.forecast}</span>
                    <span className="font-mono text-slate-400">{ro.rainProb}</span>
                    <span
                      className="text-[8px] px-1.5 py-0.5 rounded font-semibold"
                      style={{
                        backgroundColor: `${ro.riskColor}22`,
                        color: ro.riskColor,
                      }}
                    >
                      {ro.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Telemetry Matrix & Status Relays with Cyan Location Pin Inset */}
            <div className="pointer-events-auto min-w-[170px] p-2.5 rounded-xl bg-[#061426]/90 backdrop-blur-md border border-sky-500/25 shadow-2xl text-slate-200 relative">
              <div className="text-[11px] font-bold text-sky-300 mb-1 pb-1 border-b border-sky-900/60 flex items-center justify-between">
                <span>{isAr ? 'مصفوفة الرصد' : 'Telemetry Node'}</span>
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              </div>
              <div className="text-[9.5px] space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Node CIP:
                  </span>
                  <span className="font-mono text-emerald-400">31w-Sep-6v</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Sensory Grid:
                  </span>
                  <span className="font-mono text-sky-300">EM 0.6.3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Relay At:
                  </span>
                  <span className="font-mono text-amber-300">Safe Basin</span>
                </div>
              </div>

              {/* Bottom right satellite mini-inset with cyan pin icon from Image 2 */}
              <div className="mt-2 pt-1.5 border-t border-sky-900/40 flex items-center justify-between">
                <span className="text-[8.5px] text-slate-400">Station GPS</span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-cyan-300 bg-sky-950/70 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                  Live Sync
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Station Modal if clicked */}
      {selectedStation && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl bg-[#091830] border border-sky-500/40 p-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-sky-900/60">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">{selectedStation.name}</h3>
              </div>
              <button
                onClick={() => setSelectedStation(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer px-2 py-1 bg-slate-800 rounded"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="p-2 rounded bg-sky-950/40 border border-sky-800/30">
                <div className="text-slate-400">{isAr ? 'درجة الحرارة' : 'Temperature'}</div>
                <div className="text-lg font-bold font-mono text-amber-300">{selectedStation.temp}°C</div>
              </div>
              <div className="p-2 rounded bg-sky-950/40 border border-sky-800/30">
                <div className="text-slate-400">{isAr ? 'سرعة الرياح' : 'Wind Speed'}</div>
                <div className="text-lg font-bold font-mono text-sky-300">
                  {selectedStation.windSpeed} km/h
                </div>
              </div>
              <div className="p-2 rounded bg-sky-950/40 border border-sky-800/30">
                <div className="text-slate-400">{isAr ? 'الرطوبة النسبية' : 'Humidity'}</div>
                <div className="text-lg font-bold font-mono text-emerald-300">{selectedStation.humidity}%</div>
              </div>
              <div className="p-2 rounded bg-sky-950/40 border border-sky-800/30">
                <div className="text-slate-400">{isAr ? 'مؤشر الجفاف' : 'Drought Index'}</div>
                <div className="text-lg font-bold font-mono text-red-400">{selectedStation.droughtIndex}</div>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setSelectedStation(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
