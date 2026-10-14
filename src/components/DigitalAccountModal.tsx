import React from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

interface DigitalAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalAccountModal: React.FC<DigitalAccountModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-[#FFD200] rounded-full flex items-center justify-center text-[#005CB9] font-black text-sm">
            C
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-sm">Cuenta Digital Coppel</h3>
            <p className="text-[10px] text-gray-400">Cliente #CPPL-782941-0</p>
          </div>
        </div>

        {/* Digital Coppel Card */}
        <div className="bg-gradient-to-br from-[#005CB9] to-[#003876] rounded-2xl p-4 text-white shadow-md relative overflow-hidden mb-4">
          <div className="flex justify-between items-start mb-6">
            <span className="font-black text-xl text-[#FFD200] tracking-tight">Coppel</span>
            <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Crédito Departamental
            </span>
          </div>

          <div className="space-y-1 mb-3">
            <p className="text-[9px] text-blue-200 uppercase font-semibold">Crédito Disponible</p>
            <p className="font-black text-2xl text-white tracking-tight">$18,500.00 MXN</p>
          </div>

          <div className="flex justify-between items-end text-[10px] text-blue-200">
            <div>
              <p className="text-[8px] text-blue-300 uppercase">Titular</p>
              <p className="font-bold text-white text-xs">Carlos Villa</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-blue-300 uppercase">Línea Total</p>
              <p className="font-bold text-white">$25,000.00</p>
            </div>
          </div>
        </div>

        {/* Barcode representation */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col items-center mb-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
            Código de Cliente en Tienda
          </p>
          <div className="flex items-center justify-center gap-1.5 py-1">
            <div className="h-8 w-1 bg-black rounded" />
            <div className="h-8 w-2 bg-black rounded" />
            <div className="h-8 w-0.5 bg-black rounded" />
            <div className="h-8 w-1.5 bg-black rounded" />
            <div className="h-8 w-3 bg-black rounded" />
            <div className="h-8 w-1 bg-black rounded" />
            <div className="h-8 w-2 bg-black rounded" />
            <div className="h-8 w-1 bg-black rounded" />
            <div className="h-8 w-2 bg-black rounded" />
            <div className="h-8 w-0.5 bg-black rounded" />
            <div className="h-8 w-1.5 bg-black rounded" />
            <div className="h-8 w-2 bg-black rounded" />
          </div>
          <span className="text-[10px] font-mono text-gray-600 font-bold mt-1">
            0108 9283 7192
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-gray-700">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>Paga a crédito en tienda sin tarjeta física</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>Elige plazos a 24, 36 o 48 quincenas</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-[#005CB9] text-white font-bold py-2.5 rounded-xl text-xs hover:bg-blue-700 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
