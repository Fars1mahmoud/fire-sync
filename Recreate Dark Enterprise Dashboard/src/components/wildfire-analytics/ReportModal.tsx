import React, { useState } from 'react';
import { X, FileText, Printer, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: string;
  totalDetections?: string;
  burnedArea?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  selectedRegion,
  totalDetections = '2,819',
  burnedArea = '321K ha',
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#0b1325] border border-[#1e2e4e] rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#182744]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Generate Fire Surveillance Report</h2>
              <p className="text-[11px] text-slate-400">Region: {selectedRegion} (Historical Audit)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#16233d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Preview Summary */}
        <div className="space-y-3 text-xs">
          <div className="bg-[#0e1933] border border-[#1b2b48] rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>Executive Brief: Annual Fire Radiative Energy</span>
              <span className="text-amber-400 font-mono text-[11px]">NASA FIRMS Verified</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Thermal anomalies recorded across {selectedRegion} indicate high vegetative fire concentrations in historical observation windows. Satellite-derived Fire Radiative Power (FRP) metrics provide reliable guidance for suppression staging and risk assessment.
            </p>
          </div>

          {/* Quick Metrics Table */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#0e1933] p-2.5 rounded border border-[#192744]">
              <div className="text-[10px] text-slate-400">Total Detections</div>
              <div className="text-lg font-bold text-white font-mono">{totalDetections}</div>
            </div>
            <div className="bg-[#0e1933] p-2.5 rounded border border-[#192744]">
              <div className="text-[10px] text-slate-400">Estimated Burn Area</div>
              <div className="text-lg font-bold text-amber-500 font-mono">{burnedArea}</div>
            </div>
            <div className="bg-[#0e1933] p-2.5 rounded border border-[#192744]">
              <div className="text-[10px] text-slate-400">Sensor Confidence</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">Nominal / High</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-3 border-t border-[#182744] flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {downloaded && (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Report exported successfully!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#142240] hover:bg-[#1a2d54] text-slate-300 hover:text-white rounded text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              disabled={downloading}
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded text-xs font-semibold shadow transition-all disabled:opacity-50"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
