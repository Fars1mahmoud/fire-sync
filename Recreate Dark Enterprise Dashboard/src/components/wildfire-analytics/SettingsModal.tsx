import React, { useState } from 'react';
import { X, Settings, Sliders, Eye, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [refreshInterval, setRefreshInterval] = useState('30s');
  const [highContrast, setHighContrast] = useState(false);
  const [thermalPalette, setThermalPalette] = useState('Standard Fire');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#0b1325] border border-[#1e2e4e] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#182744]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-300" />
            <h2 className="text-sm font-bold text-white">Dashboard Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#16233d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Refresh Rate */}
          <div className="flex items-center justify-between p-2.5 bg-[#0e1933] border border-[#1a2947] rounded">
            <div className="flex items-center gap-2 text-slate-300">
              <RefreshCw className="w-4 h-4 text-sky-400" />
              <span>Satellite Stream Refresh</span>
            </div>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="bg-[#080d1a] border border-[#1e2e4e] text-slate-200 text-xs rounded px-2 py-1 outline-none"
            >
              <option value="15s">Every 15s</option>
              <option value="30s">Every 30s</option>
              <option value="1m">Every 1 min</option>
              <option value="manual">Manual only</option>
            </select>
          </div>

          {/* Palette */}
          <div className="flex items-center justify-between p-2.5 bg-[#0e1933] border border-[#1a2947] rounded">
            <div className="flex items-center gap-2 text-slate-300">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Thermal Palette Mode</span>
            </div>
            <select
              value={thermalPalette}
              onChange={(e) => setThermalPalette(e.target.value)}
              className="bg-[#080d1a] border border-[#1e2e4e] text-slate-200 text-xs rounded px-2 py-1 outline-none"
            >
              <option value="Standard Fire">Standard Fire (Amber/Red)</option>
              <option value="Colorblind Friendly">Colorblind (Viridis)</option>
              <option value="High Saturation">High Saturation Neon</option>
            </select>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-2.5 bg-[#0e1933] border border-[#1a2947] rounded">
            <div className="flex items-center gap-2 text-slate-300">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Enhanced Visual Contrast</span>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded text-xs transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
