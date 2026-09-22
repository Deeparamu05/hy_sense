import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Employee } from '../../types';
import { Download, Printer, X, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  isJustCreated?: boolean;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  employee,
  isOpen,
  onClose,
  isJustCreated = false
}) => {
  if (!isOpen || !employee) return null;

  const handleDownloadQR = () => {
    const svgElement = document.getElementById('employee-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 480;
      if (ctx) {
        // Draw white card background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header
        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HYSENSE SAFETY BADGE', canvas.width / 2, 40);

        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText(`Worker ID: ${employee.employeeId} | ${employee.department}`, canvas.width / 2, 65);

        // Draw QR Code centered
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(75, 90, 250, 250);
        ctx.drawImage(img, 85, 100, 230, 230);

        // Footer details
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(employee.employeeName, canvas.width / 2, 375);

        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`QR CODE: ${employee.qrData}`, canvas.width / 2, 400);

        ctx.fillStyle = '#64748b';
        ctx.font = '10px sans-serif';
        ctx.fillText('Authorized Industrial Worker Attendance & H2S Monitoring', canvas.width / 2, 440);

        // Trigger Download
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `HYSENSE_QR_${employee.employeeId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isJustCreated ? 'EMPLOYEE CREATED SUCCESSFULLY ✓' : 'WORKER UNIQUE QR BADGE'}
              </h2>
              <p className="text-xs text-slate-500">HYSENSE Automatic Security Token</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-qr-area" className="p-6 text-center space-y-4">
          {isJustCreated && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-center space-x-2 no-print">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Worker added to master database & QR associated</span>
            </div>
          )}

          {/* Worker Info */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">Worker Name</span>
                <span className="font-bold text-slate-900 text-sm">{employee.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">Employee ID</span>
                <span className="font-mono font-bold text-amber-700 text-sm">{employee.employeeId}</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">Department</span>
                <span className="text-slate-700 font-medium">{employee.department}</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">Shift</span>
                <span className="text-slate-700 font-medium">{employee.shift}</span>
              </div>
            </div>
          </div>

          {/* Large Render QR Code */}
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
            <QRCodeSVG
              id="employee-qr-svg"
              value={employee.qrData}
              size={190}
              level="H"
              includeMargin={true}
            />
            <div className="mt-3 text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {employee.qrData}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1.5 no-print font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero personal sensitive PII encoded in QR payload</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 pt-2 border-t border-slate-100 flex items-center justify-between space-x-3 no-print">
          <button
            onClick={handleDownloadQR}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-700" />
            <span>Download QR</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-700" />
            <span>Print QR</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
