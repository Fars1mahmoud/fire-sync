import React, { useState } from 'react';
import { X, Camera, Download, CheckCircle } from 'lucide-react';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CaptureModal: React.FC<CaptureModalProps> = ({ isOpen, onClose }) => {
  const [captured, setCaptured] = useState(false);

  if (!isOpen) return null;

  const handleCapture = () => {
    setCaptured(true);
    setTimeout(() => {
      setCaptured(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#0b1325] border border-[#1e2e4e] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#182744]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Capture Dashboard Canvas</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#16233d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Create an instant high-resolution snapshot of FireBoard with all charts, seasonal curves, and heatmap state for operational briefings.
        </p>

        <div className="bg-[#0e1933] border border-[#192744] rounded p-3 text-xs space-y-1.5 font-mono text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Resolution:</span>
            <span>2560 x 1440 (Ultra HD)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Color Profile:</span>
            <span>sRGB Dark Spectrum</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Timestamp:</span>
            <span>{new Date().toISOString()}</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#142240] hover:bg-[#1a2d54] text-slate-300 rounded text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCapture}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold rounded text-xs shadow transition-all"
          >
            {captured ? (
              <>
                <CheckCircle className="w-4 h-4" /> Snapshot Saved
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download PNG
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
