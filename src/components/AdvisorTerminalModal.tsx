import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Bell,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  Send,
  Radio,
  Copy
} from 'lucide-react';
import { AssistanceCallResponse } from './AssistanceModal';
import {
  db,
  collection,
  doc,
  onSnapshot,
  updateDoc,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp
} from '../firebase';

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
  const [activeTab, setActiveTab] = useState<'cola' | 'firebase'>('cola');
  const [myAdvisorName, setMyAdvisorName] = useState('Carlos Mendoza (Piso de Ventas)');

  // Real-time Firestore listener for collection "asistencias"
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const q = query(collection(db, 'asistencias'), orderBy('createdAt', 'desc'), limit(30));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: AssistanceCallResponse[] = [];
        snapshot.forEach((d) => {
          const item = d.data();
          let createdAtStr = new Date().toISOString();
          if (item.createdAt?.toDate) {
            createdAtStr = item.createdAt.toDate().toISOString();
          }

          loaded.push({
            id: d.id,
            customerPin: item.customerPin || '----',
            aisle: item.aisle || 'Pasillo en tienda',
            department: item.department || 'Piso de Ventas',
            reason: item.reason || 'Solicitud de asistencia',
            status: item.status || 'pendiente',
            advisorName: item.advisorName || null,
            estimatedArrival: item.estimatedArrival || null,
            createdAt: createdAtStr
          });
        });
        setCalls(loaded);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Error al conectar con Firestore en terminal de asesor:', err);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  // Advisor claims and confirms they are on their way
  const handleAcceptCall = async (id: string) => {
    try {
      await updateDoc(doc(db, 'asistencias', id), {
        status: 'en_camino',
        advisorName: myAdvisorName,
        estimatedArrival: '1-2 minutos'
      });
      onShowToast(`¡Confirmado! ${myAdvisorName} va en camino`, true);
    } catch (err) {
      console.error('Error al actualizar Firestore:', err);
      onShowToast('Error al confirmar asistencia');
    }
  };

  // Mark call as completed in Firestore
  const handleResolveCall = async (id: string) => {
    try {
      await updateDoc(doc(db, 'asistencias', id), {
        status: 'atendido'
      });
      onShowToast('Marcado como atendido', true);
    } catch (err) {
      console.error('Error al actualizar Firestore:', err);
      onShowToast('Error al marcar atendido');
    }
  };

  // Simulate a test customer call in Firestore
  const handleSimulateFirestoreCustomer = async () => {
    try {
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      await addDoc(collection(db, 'asistencias'), {
        aisle: 'Pasillo 3 - Muebles y Salas',
        reason: 'Cliente solicita apoyo con cotización de sala',
        customerPin: pin,
        department: 'Mueblería',
        status: 'pendiente',
        advisorName: null,
        estimatedArrival: null,
        createdAt: serverTimestamp()
      });
      onShowToast(`Doc creado en Firestore (PIN: ${pin})`, true);
    } catch (err) {
      console.error('Error al crear doc de prueba:', err);
      onShowToast('Error al crear doc en Firestore');
    }
  };

  if (!isOpen) return null;

  const advisorCodeSnippet = `// En la OTRA APP (App de Asesores Coppel):
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCeLrgPDOLERlr0lHe8Y1ugliPxWcyab0",
  authDomain: "coppel-asistencia.firebaseapp.com",
  projectId: "coppel-asistencia",
  storageBucket: "coppel-asistencia.firebasestorage.app",
  messagingSenderId: "484673873075",
  appId: "1:484673873075:web:7f483347a495126122bcc6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. Escuchar solicitudes pendientes en tiempo real:
const q = query(collection(db, "asistencias"), where("status", "==", "pendiente"));
onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      const llamada = change.doc.data();
      console.log("Nueva llamada:", change.doc.id);
      console.log("- Lugar:", llamada.aisle);
      console.log("- Motivo:", llamada.reason);
      console.log("- PIN Cliente:", llamada.customerPin);
    }
  });
});

// 2. Al pulsar "Voy en camino", actualizar el documento:
async function confirmarQueVoyEnCamino(docId, nombreDelAsesor) {
  const docRef = doc(db, "asistencias", docId);
  await updateDoc(docRef, {
    status: "en_camino",
    advisorName: nombreDelAsesor, // Ej: "Carlos Mendoza"
    estimatedArrival: "1-2 minutos"
  });
}`;

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
                  Terminal Asesores Coppel
                </h3>
                <span className="flex items-center gap-1 text-[10px] bg-amber-500/30 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  <Flame className="w-3 h-3 text-[#FFD200]" /> Firestore en Vivo
                </span>
              </div>
              <p className="text-[10px] text-blue-200">
                Colección: <strong className="text-white">asistencias</strong> • Proyecto: <strong className="text-white">coppel-asistencia</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
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
            Solicitudes en Vivo ({calls.length})
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`flex-1 py-2.5 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'firebase'
                ? 'border-b-2 border-[#005CB9] text-[#005CB9] bg-white'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Código Firestore para la Otra App
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {activeTab === 'cola' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Bandeja Firestore: asistencias
                </span>
                <button
                  onClick={handleSimulateFirestoreCustomer}
                  className="text-[10px] bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-bold px-2.5 py-1 rounded-full transition flex items-center gap-1 shadow-xs"
                >
                  <Send className="w-3 h-3" /> + Crear doc de prueba
                </button>
              </div>

              {/* Advisor profile bar */}
              <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-gray-700">Tu nombre de asesor:</span>
                <input
                  type="text"
                  value={myAdvisorName}
                  onChange={(e) => setMyAdvisorName(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-[#005CB9] focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  placeholder="Ej. Carlos Mendoza"
                />
              </div>

              {isLoading && calls.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  Cargando solicitudes desde Firestore...
                </div>
              ) : calls.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">Sin llamadas pendientes</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    No hay documentos en la colección asistencias en este momento.
                  </p>
                </div>
              ) : (
                calls.map((call) => {
                  const isPendiente = call.status === 'pendiente' || !call.advisorName;
                  const isEnCamino = call.status === 'en_camino';

                  return (
                    <div
                      key={call.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isPendiente
                          ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/50 shadow-sm'
                          : isEnCamino
                          ? 'bg-green-50/60 border-green-300'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-[#005CB9] truncate max-w-[140px]">
                              {call.id}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                isPendiente
                                  ? 'bg-amber-200 text-amber-900 animate-pulse'
                                  : isEnCamino
                                  ? 'bg-green-200 text-green-900 font-bold'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              {isPendiente ? '⚠️ Pendiente' : call.status}
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
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 my-2 bg-white/90 p-2 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#005CB9] shrink-0" />
                          <span className="truncate font-semibold text-gray-800">{call.aisle}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{new Date(call.createdAt as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                        <span className="text-[10px] text-gray-500 font-medium truncate max-w-[170px]">
                          Asesor:{' '}
                          <strong className={isPendiente ? 'text-amber-700' : 'text-green-800'}>
                            {call.advisorName || 'Sin asignar'}
                          </strong>
                        </span>

                        <div className="flex gap-1.5 shrink-0">
                          {isPendiente && (
                            <button
                              onClick={() => handleAcceptCall(call.id)}
                              className="bg-[#005CB9] hover:bg-blue-700 active:scale-95 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1"
                            >
                              <span>Aceptar y voy en camino</span>
                            </button>
                          )}

                          {isEnCamino && (
                            <button
                              onClick={() => handleResolveCall(call.id)}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition"
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
            /* Firestore documentation & code */
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Conexión Directa a Firestore</span>
                </div>
                <p className="text-[11px] text-gray-700 leading-relaxed">
                  Ambas aplicaciones se comunican directamente a través de la colección <strong>asistencias</strong> en Firebase Firestore. No requieren endpoints HTTP intermedios ni servidores de relay.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-gray-800 text-xs">Código Firestore para la App de Asesores:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(advisorCodeSnippet);
                      onShowToast('Código Firestore copiado', true);
                    }}
                    className="text-[10px] text-[#005CB9] font-bold flex items-center gap-1 hover:underline"
                  >
                    <Copy className="w-3 h-3" /> Copiar código
                  </button>
                </div>
                <pre className="bg-gray-900 text-amber-300 p-3 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed">
                  {advisorCodeSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
