import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Bell,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Radio,
  Copy
} from 'lucide-react';
import { AssistanceCallResponse } from './AssistanceModal';

interface AdvisorTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, isSuccess?: boolean) => void;
}

export const AdvisorTerminalModal: React.FC<AdvisorTerminalModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [calls, setCalls] = useState<AssistanceCallResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cola' | 'webhook'>('cola');

  const fetchCalls = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/call-assistance');
      const data = await res.json();
      if (data.success && data.calls) {
        setCalls(data.calls);
      }
    } catch (err) {
      console.warn('Error fetching assistance calls:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCalls();
      const interval = setInterval(fetchCalls, 3500);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/call-assistance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Llamada actualizada: ${status}`, true);
        fetchCalls();
      }
    } catch {
      onShowToast('Error al actualizar estado');
    }
  };

  const handleSimulateExternalWebhook = async () => {
    try {
      const res = await fetch('/api/call-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aisle: 'Pasillo 3 - Muebles y Salas',
          storeDepartment: 'Mueblería',
          reason: 'Cliente solicita apoyo con cotización de sala',
          requesterRole: 'cliente',
          requesterName: 'App Móvil Consumidor (Prueba Webhook)',
          urgency: 'normal'
        })
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`¡Webhook recibido con éxito! PIN: ${data.call.customerPin}`, true);
        fetchCalls();
      }
    } catch {
      onShowToast('Error ejecutando webhook');
    }
  };

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://[TU-URL-DE-ESTA-APP]';
  const curlExample = `curl -X POST "${currentHost}/api/call-assistance" \\
  -H "Content-Type: application/json" \\
  -d '{
    "aisle": "Pasillo 3 - Muebles y Salas",
    "storeDepartment": "Mueblería",
    "reason": "Cliente solicita apoyo con cotización de sala",
    "requesterRole": "cliente",
    "requesterName": "App Móvil Consumidor",
    "urgency": "normal"
  }'`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Terminal Header */}
        <div className="bg-[#003876] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFD200] flex items-center justify-center text-[#005CB9] font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">
                  Terminal de Asesores Coppel
                </h3>
                <span className="flex items-center gap-1 text-[10px] bg-green-500/30 text-green-300 font-bold px-2 py-0.5 rounded-full">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> En vivo
                </span>
              </div>
              <p className="text-[10px] text-blue-200">
                Piso de Ventas • Notificaciones de Asistencia en Tiempo Real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={fetchCalls}
              disabled={isLoading}
              className="p-1.5 hover:bg-white/10 rounded-lg text-blue-200 hover:text-white transition"
              title="Actualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-blue-200 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('cola')}
            className={`flex-1 py-2.5 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'cola'
                ? 'border-b-2 border-[#005CB9] text-[#005CB9] bg-white'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Solicitudes en Tienda ({calls.length})
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`flex-1 py-2.5 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'webhook'
                ? 'border-b-2 border-[#005CB9] text-[#005CB9] bg-white'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Conectar Webhook Externo
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {activeTab === 'cola' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Bandeja de llamadas de clientes
                </span>
                <button
                  onClick={handleSimulateExternalWebhook}
                  className="text-[10px] bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-bold px-2.5 py-1 rounded-full transition flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> + Simular llamada webhook
                </button>
              </div>

              {calls.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">Sin llamadas pendientes</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Todos los clientes en tienda han sido atendidos.
                  </p>
                </div>
              ) : (
                calls.map((call) => {
                  const isNotificado = call.status === 'notificado';
                  const isEnCamino = call.status === 'en_camino';
                  const isAtendido = call.status === 'atendido';

                  return (
                    <div
                      key={call.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isNotificado
                          ? 'bg-amber-50/60 border-amber-200 ring-2 ring-amber-400/40'
                          : isEnCamino
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-[#005CB9]">
                              {call.id}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                isNotificado
                                  ? 'bg-amber-100 text-amber-800'
                                  : isEnCamino
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {call.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-gray-900 mt-1 leading-tight">
                            {call.reason}
                          </h4>
                        </div>

                        {/* PIN badge */}
                        <div className="bg-white px-2.5 py-1 rounded-xl border border-blue-200 text-center shrink-0 shadow-xs">
                          <span className="text-[8px] font-bold text-gray-400 block uppercase">
                            PIN Cliente
                          </span>
                          <span className="font-mono font-black text-sm text-[#005CB9]">
                            {call.customerPin}
                          </span>
                        </div>
                      </div>

                      {/* Location & Details */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 my-2 bg-white/80 p-2 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#005CB9] shrink-0" />
                          <span className="truncate">{call.aisle}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                        <span className="text-[10px] text-gray-500 font-medium">
                          Asesor: <strong>{call.assignedAdvisor}</strong>
                        </span>

                        <div className="flex gap-1.5">
                          {isNotificado && (
                            <button
                              onClick={() => handleUpdateStatus(call.id, 'en_camino')}
                              className="bg-[#005CB9] text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                            >
                              Voy en camino
                            </button>
                          )}
                          {!isAtendido && (
                            <button
                              onClick={() => handleUpdateStatus(call.id, 'atendido')}
                              className="bg-green-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-green-700 transition"
                            >
                              Atendido ✓
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Webhook documentation & live test */
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="flex items-center gap-1.5 font-bold text-[#005CB9] mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Webhook URL Activa</span>
                </div>
                <p className="text-[11px] text-gray-600 mb-2">
                  Cualquier aplicación externa de personal o dispositivo IoT puede invocar este webhook vía POST:
                </p>
                <code className="block bg-white p-2 rounded-lg font-mono text-[11px] text-gray-800 border border-blue-200 select-all overflow-x-auto">
                  POST {currentHost}/api/call-assistance
                </code>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-gray-700 text-xs">Ejemplo cURL para probar:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(curlExample);
                      onShowToast('cURL copiado al portapapeles', true);
                    }}
                    className="text-[10px] text-[#005CB9] font-bold flex items-center gap-1 hover:underline"
                  >
                    <Copy className="w-3 h-3" /> Copiar comando
                  </button>
                </div>
                <pre className="bg-gray-900 text-green-400 p-3 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed">
                  {curlExample}
                </pre>
              </div>

              <button
                onClick={handleSimulateExternalWebhook}
                className="w-full bg-[#005CB9] text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-[#FFD200]" />
                Ejecutar solicitud de prueba ahora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
