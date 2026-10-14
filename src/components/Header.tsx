import React, { useState } from 'react';
import { Search, Mic, Bell, X, MapPin } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onVoiceSearch: () => void;
  isVoiceListening: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onVoiceSearch,
  isVoiceListening
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="bg-coppel-blue text-white px-4 pt-3 pb-3 flex flex-col gap-2.5 shrink-0 z-20 shadow-md">
        {/* Top brand bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-0.5 shadow-sm">
              <div className="w-full h-full bg-[#FFD200] rounded-full flex items-center justify-center text-[#005CB9] font-black text-lg select-none">
                C
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight leading-none text-[#FFD200]">
                Coppel
              </span>
              <span className="text-[9px] font-semibold text-blue-100 tracking-wider flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5 text-[#FFD200]" /> Sucursal Centro • En tienda
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 hover:bg-blue-700/80 active:scale-95 rounded-full transition"
              title="Notificaciones"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FFD200] rounded-full ring-2 ring-[#005CB9]" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Busca tus productos..."
            className="w-full bg-white text-gray-800 rounded-full py-2.5 pl-10 pr-10 text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD200] shadow-sm transition"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />

          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-9 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}

          <button
            onClick={onVoiceSearch}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition ${
              isVoiceListening
                ? 'text-red-500 animate-pulse bg-red-50'
                : 'text-[#005CB9] hover:text-blue-800'
            }`}
            title="Búsqueda por voz"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Notifications Drawer Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#005CB9]" />
                <h3 className="font-bold text-gray-900 text-sm">Notificaciones de Tienda</h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 py-3 text-xs">
              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl">
                <p className="font-bold text-[#005CB9]">¡Bienvenido a Coppel Phygital!</p>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  Escanea el código de barras de cualquier artículo con tu cámara para agregarlo a tu carrito y pagar a crédito.
                </p>
                <span className="text-[10px] text-gray-400 mt-1 block">Hace 5 min</span>
              </div>

              <div className="p-2.5 bg-yellow-50/70 border border-yellow-100 rounded-xl">
                <p className="font-bold text-gray-900">10% de bonificación en Electrónica</p>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  Válido al pagar en tus compras de contado o a crédito hoy en piso de venta.
                </p>
                <span className="text-[10px] text-gray-400 mt-1 block">Hoy</span>
              </div>
            </div>

            <button
              onClick={() => setShowNotifications(false)}
              className="w-full mt-2 bg-[#005CB9] text-white font-bold py-2.5 rounded-xl text-xs hover:bg-blue-700 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
