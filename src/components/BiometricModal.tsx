import React, { useEffect, useState } from 'react';
import { Fingerprint, CheckCircle, ShieldCheck } from 'lucide-react';

interface BiometricModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      return;
    }

    // Automatically simulate fingerprint recognition after 2 seconds
    const timer = setTimeout(() => {
      setIsSuccess(true);
      const confirmTimer = setTimeout(() => {
        onConfirm();
      }, 500);
      return () => clearTimeout(confirmTimer);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isOpen, onConfirm]);

  const handleManualTouch = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onConfirm();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 w-11/12 max-w-sm flex flex-col items-center text-center shadow-2xl transform scale-100 transition-transform duration-300">
        {/* Sensor graphic */}
        <div
          onClick={handleManualTouch}
          className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 relative cursor-pointer active:scale-95 transition"
          title="Toca para autorizar de inmediato"
        >
          {!isSuccess ? (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-[#005CB9] border-t-transparent animate-spin" />
              <Fingerprint className="w-10 h-10 text-[#005CB9]" />
            </>
          ) : (
            <CheckCircle className="w-12 h-12 text-green-500 animate-in zoom-in-75 duration-200" />
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#005CB9] bg-blue-50 px-3 py-1 rounded-full mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Biometría Bancaria Coppel</span>
        </div>

        <h3 className="font-extrabold text-lg text-gray-800 mb-1">
          {isSuccess ? '¡Autorización Exitosa!' : 'Autorización requerida'}
        </h3>

        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          {isSuccess
            ? 'Confirmando transacción en sistema de tienda...'
            : 'Usa tu huella digital o rostro para confirmar el pago con tu Crédito Coppel.'}
        </p>

        <div className="w-full flex flex-col gap-2">
          {!isSuccess && (
            <button
              onClick={handleManualTouch}
              className="w-full bg-blue-50 hover:bg-blue-100 text-[#005CB9] text-xs font-bold py-2.5 rounded-xl transition"
            >
              Simular lectura de huella ahora
            </button>
          )}

          <button
            onClick={onCancel}
            className="text-gray-400 text-xs font-semibold hover:text-gray-600 transition py-1"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
