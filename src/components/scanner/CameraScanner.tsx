import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Image as ImageIcon, X, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export type ScannerMode = 'QR' | 'H2S';

interface CameraScannerProps {
  mode: ScannerMode;
  onScanSuccess: (decodedText: string | null, capturedImageBase64: string | null) => void;
  onClose: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ mode, onScanSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [error, setError] = useState<string | null>(null);
  const [detectionState, setDetectionState] = useState<'initializing' | 'scanning' | 'detected' | 'captured'>('initializing');
  
  const qrRegionId = "html5qr-code-full-region";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For H2S camera mode
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const detectionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeTab === 'camera') {
      if (mode === 'QR') {
        startQRScanner();
      } else {
        // H2S lifecycle: Start only after mount
        startH2SCamera();
      }
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, mode]);

  const startQRScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(qrRegionId);
      html5QrCodeRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopCamera();
          onScanSuccess(decodedText, null);
        },
        () => {}
      );
    } catch (err) {
      console.error("QR Scanner start failed", err);
      setError("Failed to access camera. Please allow camera permissions.");
    }
  };

  const startH2SCamera = async () => {
    setDetectionState('initializing');
    console.log("Camera permission requested");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' } } 
      });
      console.log("Camera stream started");
      
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("Video element ready");
          setDetectionState('scanning');
          console.log("Scanning H₂S strip...");
          startFrameProcessing();
        };
      }
    } catch (err) {
      console.error("Camera start failed", err);
      setError("Failed to access camera. Please allow camera permissions.");
    }
  };

  const startFrameProcessing = () => {
    const processFrame = () => {
      if (detectionState === 'detected' || detectionState === 'captured') return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video && canvas && video.readyState === 4) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw center region to hidden canvas to check brightness
          // (Simple prototype detection logic: assume strip is present if center is bright enough)
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const w = 50;
          const h = 50;
          
          try {
            const imageData = ctx.getImageData(centerX - w/2, centerY - h/2, w, h);
            const data = imageData.data;
            let sum = 0;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i+1];
              const b = data[i+2];
              sum += (r + g + b) / 3;
            }
            const avgBrightness = sum / (w * h);
            
            // Basic threshold to "detect" strip
            if (avgBrightness > 60) {
              if (!detectionTimerRef.current) {
                // Require brightness to stay high for 1.5 seconds to confirm
                detectionTimerRef.current = setTimeout(() => {
                  handleStripDetected();
                }, 1500);
              }
            } else {
              if (detectionTimerRef.current) {
                clearTimeout(detectionTimerRef.current);
                detectionTimerRef.current = null;
              }
            }
          } catch (e) {
            // ignore canvas taint errors
          }
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };
    
    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const handleStripDetected = () => {
    console.log("Strip detected");
    setDetectionState('detected');
    
    // Auto-capture after 1 second of detection
    setTimeout(() => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');
        
        console.log("Image captured");
        setDetectionState('captured');
        stopCamera();
        
        // Brief delay so user sees "Captured" UI
        setTimeout(() => {
          onScanSuccess(null, base64);
        }, 800);
      }
    }, 1000);
  };

  const stopCamera = () => {
    if (html5QrCodeRef.current?.isScanning) {
      html5QrCodeRef.current.stop().catch(console.error);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (detectionTimerRef.current) {
      clearTimeout(detectionTimerRef.current);
      detectionTimerRef.current = null;
    }
    console.log("Camera stopped");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mode === 'QR') {
      try {
        const html5QrCode = new Html5Qrcode(qrRegionId);
        const decodedText = await html5QrCode.scanFileV2(file);
        onScanSuccess(decodedText.decodedText, null);
      } catch (err) {
        setError("Could not decode QR code from image.");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          console.log("Image captured");
          onScanSuccess(null, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              mode === 'QR' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-orange-50 text-orange-700 border-orange-200'
            } border shadow-sm`}>
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'QR' ? 'Scan Worker QR' : 'Scan H₂S Colorimetric Strip'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'QR' ? 'Align QR in frame' : 'Place strip inside guide box'}
              </p>
            </div>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-white px-4">
          <button
            onClick={() => setActiveTab('camera')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'camera' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'upload' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-6 bg-slate-50 flex-1 flex flex-col items-center justify-center min-h-[400px]">
          {error && (
            <div className="w-full p-3 mb-4 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2 text-xs text-red-800 font-medium shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="w-full flex flex-col items-center">
              {mode === 'QR' ? (
                <div id={qrRegionId} className="w-full max-w-sm rounded-xl overflow-hidden shadow-md border-4 border-slate-200 bg-white" />
              ) : (
                <div className="w-full flex flex-col items-center space-y-4">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 font-mono text-xs font-bold transition-colors">
                    {detectionState === 'initializing' && <span className="text-slate-500 animate-pulse">Initializing Camera...</span>}
                    {detectionState === 'scanning' && <span className="text-orange-600 animate-pulse">Scanning H₂S strip...</span>}
                    {detectionState === 'detected' && <span className="text-amber-600">Strip detected! Capturing...</span>}
                    {detectionState === 'captured' && (
                      <span className="text-emerald-600 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" /> <span>Image Captured</span>
                      </span>
                    )}
                  </div>

                  {/* Video Viewfinder */}
                  <div className={`relative w-full max-w-sm rounded-2xl overflow-hidden shadow-xl bg-black aspect-[3/4] flex justify-center items-center transition-all duration-300 ${
                    detectionState === 'detected' ? 'ring-4 ring-amber-500' : 
                    detectionState === 'captured' ? 'ring-4 ring-emerald-500 scale-95 opacity-80' : 
                    'ring-4 ring-slate-200'
                  }`}>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full h-full object-cover" 
                    />
                    
                    {/* Hidden canvas for processing */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Strip Guide overlay */}
                    {detectionState !== 'captured' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className={`w-16 h-32 border-2 rounded-md relative transition-colors duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] ${
                          detectionState === 'detected' ? 'border-amber-400 bg-amber-400/20' : 'border-white/70'
                        }`}>
                          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] uppercase font-bold tracking-widest text-center whitespace-nowrap transition-colors duration-300 ${
                            detectionState === 'detected' ? 'text-amber-400' : 'text-white/50'
                          }`}>
                            {detectionState === 'detected' ? 'HOLD STILL' : <>Align<br/>Strip</>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="w-full flex flex-col items-center justify-center py-8">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-xs px-6 py-12 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white flex flex-col items-center justify-center space-y-3 transition-colors group cursor-pointer shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-bold text-slate-700">Click to upload image</span>
                  <span className="block text-xs text-slate-500 mt-1">Supports JPG, PNG</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
