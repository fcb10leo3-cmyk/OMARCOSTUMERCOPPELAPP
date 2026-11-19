import React, { useState } from 'react';
import { Hand, UserCheck, Shield, Clock, MapPin, CheckCircle2, ChevronRight, X } from 'lucide-react';

export interface AssistanceCallResponse {
  id: string;
  customerPin: string;
  aisle: string;
  department?: string;
  storeDepartment?: string;
  reason: string;
  requesterRole?: string;
  requesterName?: string;
  urgency?: 'normal' | 'urgente';
  status: 'pendiente' | 'en_camino' | 'atendido' | 'cancelado';
  advisorName: string | null;
  assignedAdvisor?: string | null;
  estimatedArrival: string | null;
  createdAt?: unknown;
  acceptedAt?: string;
}

interface AssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  callData: AssistanceCallResponse | null;
  isLoading: boolean;
  onSendCustomRequest: (reason: string, aisle: string) => void;
}

export const AssistanceModal: React.FC<AssistanceModalProps> = ({
  isOpen,
  onClose,
  callData,
  isLoading,
  onSendCustomRequest
}) => {
  const [selectedReason, setSelectedReason] = useState('Cliente solicita apoyo de asesor en tienda');
  const [selectedAisle, setSelectedAisle] = useState('Pasillo 4 - Calzado y Telefonía');
  const [showOptions, setShowOptions] = useState(false);

  if (!isOpen) return null;

  const quickReasons = [
    'Cliente solicita apoyo con cotización de sala',
    'Solicita probar talla o calzado de bodega',
    'Duda con línea de Crédito Coppel',
    'Verificar precio o existencia en bodega'
  ];

  const quickAisles = [
    'Pasillo 3 - Muebles y Salas',
    'Pasillo 4 - Calzado y Telefonía',
    'Pasillo 1 - Línea Blanca',
    'Pasillo 2 - Electrónica y TV'
  ];

  const advisor = callData?.advisorName || callData?.assignedAdvisor;
  const isAssigned = callData?.status === 'en_camino' && Boolean(advisor);

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 bg-gray-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-3xl p-5 w-11/12 max-w-sm flex flex-col items-center text-center shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 relative border-2 ${
          isAssigned ? 'border-green-400 bg-green-50/20' : 'border-transparent'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Pulse Animation */}
        {!isAssigned ? (
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 border border-blue-100 relative">
            <div className="absolute inset-0 rounded-full bg-[#FFD200]/40 animate-ping opacity-60" />
            <Hand className="w-8 h-8 text-[#005CB9] z-10" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 border-2 border-green-400 relative animate-in zoom-in-75 duration-300">
            <UserCheck className="w-9 h-9 text-green-700 z-10" />
          </div>
        )}

        {/* Status Pill */}
        {!isAssigned ? (
          <div className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-900 text-[10px] font-extrabold px-3 py-1 rounded-full mb-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span>{isLoading ? 'Conectando con Firestore...' : 'Buscando asesor disponible...'}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-[10px] font-extrabold px-3 py-1 rounded-full mb-1.5 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>¡Asesor en camino!</span>
          </div>
        )}

        {/* Main Notice */}
        {!isAssigned ? (
          <>
            <h3 className="font-extrabold text-gray-900 text-base leading-snug mb-1">
              Buscando asesor disponible...
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              Tu solicitud fue enviada en tiempo real. En cuanto un asesor acepte, verás su nombre aquí.
            </p>
          </>
        ) : (
          <>
            <h3 className="font-extrabold text-green-700 text-lg leading-snug mb-0.5">
              ¡{advisor} va en camino!
            </h3>
            <p className="text-xs text-gray-600 mb-2 font-medium">
              Tiempo estimado de llegada: <strong className="text-gray-900">{callData?.estimatedArrival || '1-2 minutos'}</strong>
            </p>
          </>
        )}

        {/* Customer PIN Handshake Card */}
        {callData?.customerPin && (
          <div className={`w-full rounded-2xl p-3 my-1.5 text-center shadow-xs transition-colors ${
            isAssigned ? 'bg-green-100/70 border-2 border-green-400' : 'bg-blue-50/80 border-2 border-[#005CB9]/30'
          }`}>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
              Tu PIN de Asistencia en Tienda
            </span>
            <div className={`text-3xl font-black font-mono tracking-widest my-0.5 ${
              isAssigned ? 'text-green-800' : 'text-[#005CB9]'
            }`}>
              {callData.customerPin}
            </div>
            <p className="text-[10px] text-gray-600 font-medium">
              {isAssigned ? (
                <>Díselo a <strong>{advisor}</strong> cuando llegue a tu pasillo.</>
              ) : (
                <>Díselo al asesor cuando llegue.</>
              )}
            </p>
          </div>
        )}

        {/* Details List */}
        <div className="w-full text-left space-y-1.5 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100 my-2">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-3.5 h-3.5 text-[#005CB9] shrink-0" />
            <span className="truncate">
              <strong>Lugar:</strong> {callData?.aisle || selectedAisle}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-3.5 h-3.5 text-green-600 shrink-0" />
            <span>
              <strong>Tiempo estimado:</strong> {callData?.estimatedArrival || (isAssigned ? '1-2 minutos' : 'En espera de confirmación')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Shield className="w-3.5 h-3.5 text-[#005CB9] shrink-0" />
            <span className="truncate">
              <strong>Tipo de ayuda:</strong> {callData?.reason || selectedReason}
            </span>
          </div>
        </div>

        {/* Toggle options if customer wants to specify their aisle or reason */}
        {!showOptions ? (
          <button
            onClick={() => setShowOptions(true)}
            className="text-[11px] text-[#005CB9] font-bold hover:underline mb-2 flex items-center gap-1"
          >
            <span>Cambiar pasillo o motivo de ayuda</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        ) : (
          <div className="w-full text-left space-y-2 mb-3 bg-white border border-gray-200 p-2.5 rounded-xl text-xs animate-in fade-in">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Pasillo en tienda:
              </label>
              <select
                value={selectedAisle}
                onChange={(e) => setSelectedAisle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs font-medium"
              >
                {quickAisles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Motivo de apoyo:
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs font-medium"
              >
                {quickReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                onSendCustomRequest(selectedReason, selectedAisle);
                setShowOptions(false);
              }}
              className="w-full bg-blue-50 text-[#005CB9] font-bold py-1.5 rounded-lg text-xs hover:bg-blue-100 transition"
            >
              Reenviar solicitud actualizada
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-[#005CB9] text-white text-xs font-extrabold py-2.5 rounded-xl hover:bg-blue-700 transition shadow-xs flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          Entendido, esperando aquí
        </button>
      </div>
    </div>
  );
};
