import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Video, Camera, Scan, Flashlight, RefreshCw, Barcode, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { playScannerBeep } from '../utils/audio';

interface ScannerStepProps {
  onProductScanned: (product: Product) => void;
  catalog: Product[];
  onShowToast: (message: string, isSuccess?: boolean) => void;
}

export const ScannerStep: React.FC<ScannerStepProps> = ({
  onProductScanned,
  catalog,
  onShowToast
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flashFeedback, setFlashFeedback] = useState(false);
  const [lastScannedItem, setLastScannedItem] = useState<Product | null>(null);
  const [showManualPicker, setShowManualPicker] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Trigger scanning of a selected product
  const triggerScanSuccess = useCallback((product: Product) => {
    playScannerBeep();
    setFlashFeedback(true);
    setLastScannedItem(product);
    onProductScanned(product);
    onShowToast(`Escaneado: ${product.name}`, true);

    setTimeout(() => {
      setFlashFeedback(false);
    }, 400);
  }, [onProductScanned, onShowToast]);

  // Simulate scanning a random item or sequential item
  const handleSimulateScan = () => {
    const randomProduct = catalog[Math.floor(Math.random() * catalog.length)];
    triggerScanSuccess(randomProduct);
  };

  // Start real device camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      onShowToast('Cámara en vivo activada', true);
    } catch (err: unknown) {
      console.warn('Camera access unavailable:', err);
      setCameraError('Permiso de cámara no concedido o no disponible. Usa el escaneo simulado.');
      setIsCameraActive(false);
      onShowToast('Cámara no disponible, usando simulador');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setTorchOn(false);
  }, []);

  // Flashlight toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const capabilities = track.getCapabilities?.() as { torch?: boolean };
        if (capabilities && capabilities.torch) {
          const nextState = !torchOn;
          await (track as MediaStreamTrack & { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
            advanced: [{ torch: nextState }]
          });
          setTorchOn(nextState);
          onShowToast(nextState ? 'Linterna activada' : 'Linterna apagada');
        } else {
          onShowToast('Linterna no soportada en este dispositivo');
        }
      } catch {
        onShowToast('No se pudo encender la linterna');
      }
    }
  };

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="p-4 flex flex-col h-full bg-gray-50 pb-24">
      {/* Title */}
      <div className="text-center mb-3">
        <h2 className="font-extrabold text-xl text-[#005CB9] tracking-tight">
          Escanear Artículo
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Apunta la cámara al código de barras del producto en tienda
        </p>
      </div>

      {/* Scanner Box */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200 flex-1 flex flex-col min-h-0">
        <div
          className={`relative bg-gray-100 rounded-2xl flex-1 overflow-hidden border border-gray-300 w-full min-h-[300px] sm:min-h-[360px] flex items-center justify-center transition-colors duration-200 ${
            flashFeedback ? 'bg-green-100/90 ring-4 ring-green-400' : ''
          }`}
          id="camera-container"
        >
          {/* Real Camera Video */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${
              isCameraActive ? 'block' : 'hidden'
            }`}
          />

          {/* Fallback & Placeholder View */}
          {!isCameraActive && (
            <div
              onClick={handleSimulateScan}
              className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/70 backdrop-blur-xs cursor-pointer p-4 text-center select-none group"
            >
              <div className="relative w-20 h-20 flex items-center justify-center mb-3">
                <div className="absolute inset-0 rounded-full bg-[#005CB9]/20 animate-pulse-ring" />
                <div className="w-14 h-14 bg-[#005CB9] group-hover:scale-105 rounded-full flex items-center justify-center shadow-lg z-10 transition">
                  <Scan className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-[#005CB9] font-extrabold text-sm drop-shadow-xs">
                Toca para escanear simulado
              </span>
              <span className="text-[11px] text-gray-500 mt-1">
                o activa la cámara real abajo
              </span>
            </div>
          )}

          {/* Flash Feedback visual highlight */}
          {flashFeedback && (
            <div className="absolute inset-0 bg-green-500/30 z-30 flex items-center justify-center animate-in fade-in duration-100">
              <div className="bg-white/95 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-xs font-bold text-gray-900">¡Código leído!</span>
              </div>
            </div>
          )}

          {/* Scanner Overlay Graphics: 4 brackets + laser beam */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Top Left */}
            <div className="absolute top-5 left-5 w-10 h-10 border-t-4 border-l-4 border-[#005CB9] rounded-tl-xl shadow-xs" />
            {/* Top Right */}
            <div className="absolute top-5 right-5 w-10 h-10 border-t-4 border-r-4 border-[#005CB9] rounded-tr-xl shadow-xs" />
            {/* Bottom Left */}
            <div className="absolute bottom-5 left-5 w-10 h-10 border-b-4 border-l-4 border-[#005CB9] rounded-bl-xl shadow-xs" />
            {/* Bottom Right */}
            <div className="absolute bottom-5 right-5 w-10 h-10 border-b-4 border-r-4 border-[#005CB9] rounded-br-xl shadow-xs" />

            {/* Red/Blue Laser Scan Line */}
            <div className="absolute left-8 right-8 h-1 bg-[#005CB9] shadow-[0_0_12px_rgba(0,92,185,0.9)] animate-scan rounded-full opacity-90" />
          </div>

          {/* Controls overlay when real camera is active */}
          {isCameraActive && (
            <div className="absolute top-3 right-3 z-30 flex gap-2">
              <button
                onClick={toggleTorch}
                className="bg-black/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/70 transition"
                title="Linterna"
              >
                <Flashlight className={`w-4 h-4 ${torchOn ? 'text-[#FFD200]' : 'text-white'}`} />
              </button>
              <button
                onClick={stopCamera}
                className="bg-black/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/70 transition"
                title="Detener cámara"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {cameraError && (
          <p className="text-[11px] text-red-500 text-center mt-2 font-medium">
            {cameraError}
          </p>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4 shrink-0">
          <button
            onClick={isCameraActive ? stopCamera : startCamera}
            className={`flex flex-col items-center justify-center border py-3.5 rounded-xl transition group ${
              isCameraActive
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
            }`}
          >
            <Video className="w-5 h-5 mb-1 text-gray-500 group-hover:text-[#005CB9] transition" />
            <span className="text-[11px] font-extrabold uppercase tracking-wide">
              {isCameraActive ? 'Detener Cámara' : 'Cámara Real'}
            </span>
          </button>

          <button
            onClick={handleSimulateScan}
            className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border border-blue-200 py-3.5 rounded-xl transition text-[#005CB9] group shadow-xs active:scale-95"
          >
            <Camera className="w-5 h-5 mb-1 text-[#005CB9]" />
            <span className="text-[11px] font-extrabold uppercase tracking-wide">
              Foto Temporal
            </span>
          </button>
        </div>

        {/* Shelf Barcode Manual Selector drawer trigger */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowManualPicker(!showManualPicker)}
            className="text-gray-500 hover:text-[#005CB9] font-semibold flex items-center gap-1.5 transition"
          >
            <Barcode className="w-4 h-4" />
            {showManualPicker ? 'Ocultar códigos de estante' : 'Escanear por código de estante'}
          </button>
          {lastScannedItem && (
            <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full truncate max-w-[150px]">
              Último: {lastScannedItem.name}
            </span>
          )}
        </div>

        {/* Quick Shelf items list */}
        {showManualPicker && (
          <div className="mt-2.5 max-h-36 overflow-y-auto hide-scrollbar space-y-1.5 border border-gray-100 bg-gray-50/50 p-2 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Etiquetas en pasillo disponibles:
            </p>
            {catalog.map((item) => (
              <div
                key={item.id}
                onClick={() => triggerScanSuccess(item)}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition text-xs"
              >
                <div className="flex flex-col truncate pr-2">
                  <span className="font-bold text-gray-800 truncate">{item.name}</span>
                  <span className="text-[9px] text-gray-400 font-mono">Cod: {item.barcode}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-[#005CB9]">
                    ${item.price.toLocaleString('es-MX')}
                  </span>
                  <span className="text-[9px] text-[#005CB9] block font-semibold">+ Escanear</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
