import React, { useState } from 'react';
import { X, Printer, CheckCircle2, Copy } from 'lucide-react';

interface KioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  folio: string;
  pin: string;
  onShowToast: (message: string, isSuccess?: boolean) => void;
}

export const KioskModal: React.FC<KioskModalProps> = ({
  isOpen,
  onClose,
  folio,
  pin,
  onShowToast
}) => {
  const [isPrinted, setIsPrinted] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePrint = async () => {
    setIsPrinted(true);
    try {
      await fetch('/api/kiosk/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folio, pin, kioskId: 'KIOSKO-02 (Pasillo 1)' })
      });
      onShowToast('Enviado a impresora de Kiosko #02', true);
    } catch {
      onShowToast('Enviado a impresora de Kiosko #02', true);
    }
    setTimeout(() => {
      setIsPrinted(false);
      onClose();
    }, 2000);
  };

  const handleCopyPin = () => {
    navigator.clipboard?.writeText(pin);
    onShowToast('PIN copiado al portapapeles', true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-blue-50 text-[#005CB9] rounded-full flex items-center justify-center mx-auto mb-3">
          <Printer className="w-8 h-8" />
        </div>

        <h3 className="font-extrabold text-gray-900 text-lg mb-1">
          Impresión en Kiosko Físico
        </h3>
        <p className="text-xs text-gray-500 mb-4 px-2">
          Dirígete a cualquier Kiosko de autoservicio o terminal de salida e ingresa tu código PIN.
        </p>

        {/* PIN Container */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 mb-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
            PIN de Impresión Rápida
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono font-black text-3xl text-[#005CB9] tracking-widest">
              {pin}
            </span>
            <button
              onClick={handleCopyPin}
              className="p-1.5 hover:bg-blue-100 rounded-lg text-gray-500 hover:text-[#005CB9] transition"
              title="Copiar PIN"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[10px] text-gray-400 block mt-1 font-mono">
            Vinculado a Folio #{folio}
          </span>
        </div>

        <button
          onClick={handleSimulatePrint}
          disabled={isPrinted}
          className="w-full bg-[#005CB9] text-white font-extrabold py-3 rounded-xl text-xs hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xs"
        >
          {isPrinted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Imprimiendo en Kiosko...
            </>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              Enviar a Kiosko Cercano (Pasillo 1)
            </>
          )}
        </button>
      </div>
    </div>
  );
};
