import React, { useEffect, useState } from 'react';
import { Check, Printer, Timer, ChevronDown, ChevronUp, Share2, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { TicketData } from '../types';

interface ExitStepProps {
  ticket: TicketData;
  onFinishAndReset: () => void;
  onPrintInKiosk: () => void;
  onShowToast: (message: string, isSuccess?: boolean) => void;
}

export const ExitStep: React.FC<ExitStepProps> = ({
  ticket,
  onFinishAndReset,
  onPrintInKiosk,
  onShowToast
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  const [showItemDetails, setShowItemDetails] = useState(false);

  // Trigger celebration confetti
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.55 },
      colors: ['#005CB9', '#FFD200', '#E20613', '#22C55E']
    });
  }, []);

  // Generate QR Code image data URL using QRCode library
  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrPayload = ticket.qrCodeUrl || `https://coppel.com/validador?folio=${ticket.folio}&total=${ticket.total}`;
        const url = await QRCode.toDataURL(qrPayload, {
          width: 180,
          margin: 1,
          color: {
            dark: '#005CB9',
            light: '#FFFFFF'
          }
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
    };
    generateQR();
  }, [ticket]);

  // Exit timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatMinutes = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const ticketText =
    `Ticket digital Coppel #${ticket.folio}\n` +
    `Fecha: ${ticket.date}\n` +
    ticket.items.map((i) => `- ${i.quantity} x ${i.name}: $${(i.price * i.quantity).toLocaleString('es-MX')}`).join('\n') +
    `\nTotal: $${ticket.total.toLocaleString('es-MX')}\nPago: ${ticket.paymentMethod}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Ticket Digital Coppel',
        text: `Comprobante de compra Coppel #${ticket.folio} por $${ticket.total.toLocaleString('es-MX')}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`Ticket #${ticket.folio} - Total $${ticket.total}`);
      onShowToast('Folio copiado al portapapeles', true);
    }
  };

  return (
    <div className="bg-[#005CB9] text-white pb-24 h-full flex flex-col items-center justify-start text-center overflow-y-auto hide-scrollbar p-4">
      {/* Success Badge */}
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2 mt-2 shadow-[0_0_24px_rgba(34,197,94,0.6)] shrink-0 animate-in zoom-in-50 duration-300">
        <Check className="w-8 h-8 text-white stroke-[3]" />
      </div>

      <h2 className="text-2xl font-black mb-0.5 text-[#FFD200] tracking-tight">
        ¡Compra Exitosa!
      </h2>
      <p className="text-blue-100 text-xs mb-4 px-4 font-medium">
        Tu pago se ha procesado correctamente.
      </p>

      {/* Ticket Digital UI */}
      <div className="bg-white p-5 rounded-t-3xl rounded-b-2xl shadow-2xl relative w-full max-w-[290px] shrink-0 text-gray-800 transition-all duration-200">
        {/* Notches for ticket cutout look */}
        <div className="absolute -left-3 top-1/2 w-6 h-6 bg-[#005CB9] rounded-full transform -translate-y-1/2" />
        <div className="absolute -right-3 top-1/2 w-6 h-6 bg-[#005CB9] rounded-full transform -translate-y-1/2" />

        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <h3 className="font-black text-lg text-[#005CB9] leading-tight">
              Ticket Digital
            </h3>
          </div>
          <button
            onClick={handleShare}
            className="text-gray-400 hover:text-[#005CB9] p-1 rounded-md"
            title="Compartir ticket"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-gray-400 mb-3 uppercase tracking-wider font-semibold font-mono">
          Folio: {ticket.folio}
        </p>

        {/* QR Code Graphic */}
        <div className="flex justify-center mb-2 p-2 bg-white rounded-xl border border-gray-100 shadow-inner">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code Ticket Salida"
              className="w-36 h-36 object-contain"
            />
          ) : (
            <div className="w-36 h-36 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-gray-400">
              Generando QR...
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-gray-600 mb-3 px-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#005CB9] shrink-0" />
          <span>
            Escanea este código en el <strong className="text-[#005CB9] font-bold">arco óptico</strong> de salida.
          </span>
        </div>

        {/* Total & Items summary */}
        <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-end">
          <div className="text-left">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Total Pagado
            </p>
            <p className="font-black text-xl text-[#005CB9] mt-0.5 leading-none">
              ${ticket.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Artículos
            </p>
            <p className="font-bold text-sm text-gray-700 mt-0.5 leading-none">
              {ticket.itemsCount}
            </p>
          </div>
        </div>

        {/* Toggleable Item Breakdown */}
        <button
          onClick={() => setShowItemDetails(!showItemDetails)}
          className="mt-3 pt-2 border-t border-gray-100 w-full flex items-center justify-between text-[11px] text-[#005CB9] font-bold hover:underline"
        >
          <span>{showItemDetails ? 'Ocultar desglose' : 'Ver artículos comprados'}</span>
          {showItemDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showItemDetails && (
          <div className="mt-2 text-left space-y-1.5 max-h-32 overflow-y-auto hide-scrollbar text-[10px] bg-gray-50 p-2 rounded-xl border border-gray-100">
            {ticket.items.map((it) => (
              <div key={it.id} className="flex justify-between items-center text-gray-700">
                <span className="truncate pr-2 font-medium">
                  {it.quantity}x {it.name}
                </span>
                <span className="font-bold shrink-0">
                  ${(it.price * it.quantity).toLocaleString('es-MX')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="w-full max-w-[290px] mt-3 text-[11px] font-bold text-yellow-200 bg-blue-900/50 rounded-lg py-2 px-3">
        Tu QR de salida basta para salir. No necesitas ticket impreso.
      </p>

      {/* Ticket digital por WhatsApp / correo */}
      <div className="w-full max-w-[290px] mt-3 grid grid-cols-2 gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(ticketText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-500 text-white text-[11px] font-bold py-2.5 rounded-xl text-center active:scale-95 transition"
        >
          Enviar por WhatsApp
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent('Ticket Coppel #' + ticket.folio)}&body=${encodeURIComponent(ticketText)}`}
          className="bg-white/90 hover:bg-white text-[#005CB9] text-[11px] font-bold py-2.5 rounded-xl text-center active:scale-95 transition"
        >
          Enviar por correo
        </a>
      </div>

      {/* Kiosk Action */}
      <div className="w-full max-w-[290px] mt-3.5 flex gap-2">
        <button
          onClick={onPrintInKiosk}
          className="flex-1 bg-blue-800/60 hover:bg-blue-800 backdrop-blur-xs border border-blue-400/40 text-white text-[11px] font-bold py-3 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
        >
          <Printer className="w-4 h-4 text-yellow-300" />
          Imprimir ticket físico en Kiosko
        </button>
      </div>

      {/* Exit Timer */}
      <div className="mt-4 bg-blue-900/60 backdrop-blur-xs px-5 py-2.5 rounded-full flex items-center gap-2 border border-blue-400/20">
        <Timer className="w-4 h-4 text-[#FFD200]" />
        <span className="text-xs font-medium">
          Tiempo para salir:{' '}
          <span
            className={`font-black text-base ml-1 ${
              timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-[#FFD200]'
            }`}
          >
            {formatMinutes(timeLeft)}
          </span>
        </span>
      </div>

      {/* Reset button */}
      <button
        onClick={onFinishAndReset}
        className="mt-6 bg-white text-[#005CB9] font-black px-6 py-3.5 rounded-xl shadow-lg hover:bg-yellow-50 transition w-full max-w-[290px] text-xs uppercase tracking-wider active:scale-95"
      >
        Finalizar y Nueva Compra
      </button>
    </div>
  );
};
