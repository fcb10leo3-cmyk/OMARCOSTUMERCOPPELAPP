/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Hand,
  Maximize2,
  Minimize2,
  Wifi,
  BatteryMedium,
  Users,
  Bell
} from 'lucide-react';
import { MOCK_PRODUCTS } from './data/products';
import { Product, CartItem, CheckoutMode, PaymentFrequency, PaymentMethodType, TicketData } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeStep } from './components/HomeStep';
import { ScannerStep } from './components/ScannerStep';
import { CartStep } from './components/CartStep';
import { ExitStep } from './components/ExitStep';
import { BiometricModal } from './components/BiometricModal';
import { AssistanceModal, AssistanceCallResponse } from './components/AssistanceModal';
import { AdvisorTerminalModal } from './components/AdvisorTerminalModal';
import { DigitalAccountModal } from './components/DigitalAccountModal';
import { KioskModal } from './components/KioskModal';
import { Toast } from './components/Toast';
import { playSuccessChime } from './utils/audio';

export default function App() {
  // Navigation: 0 = Inicio, 1 = Escanear, 2 = Carrito, 3 = Salida
  const [activeTab, setActiveTab] = useState<number>(0);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      ...MOCK_PRODUCTS[4], // Tenis Nike Air Max 270
      quantity: 1,
      addedAt: Date.now()
    }
  ]);

  // Search & category filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Modals & Assistance State
  const [showBiometric, setShowBiometric] = useState(false);
  const [showAssistance, setShowAssistance] = useState(false);
  const [showAdvisorTerminal, setShowAdvisorTerminal] = useState(false);
  const [assistanceCallData, setAssistanceCallData] = useState<AssistanceCallResponse | null>(null);
  const [isAssistanceLoading, setIsAssistanceLoading] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showKioskModal, setShowKioskModal] = useState(false);

  // Pending payment details during checkout
  const [pendingPayment, setPendingPayment] = useState<{
    method: PaymentMethodType;
    mode: CheckoutMode;
    frequency: PaymentFrequency;
  } | null>(null);

  // Generated Ticket
  const [ticketData, setTicketData] = useState<TicketData>({
    folio: '#CPPL-74892',
    total: 2199.0,
    itemsCount: 1,
    items: [],
    date: new Date().toLocaleDateString('es-MX'),
    paymentMethod: 'Crédito Coppel',
    frequency: 'quincenal',
    qrCodeUrl: 'https://coppel.com/validador?folio=74892&total=2199',
    kioskPin: 'K-9281'
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsSuccess, setToastIsSuccess] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Frame mode toggle for desktop viewing: 'phone' or 'fluid'
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Current clock for device status bar
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, isSuccess = false) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    setToastIsSuccess(isSuccess);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, addedAt: Date.now() }];
    });
    showToast(`Agregado al carrito: ${product.name}`, true);
  };

  // Quantity adjustments
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Remove from cart
  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Artículo eliminado del carrito');
  };

  // Total items in cart
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Filtered products on Home tab
  const filteredProducts = useMemo(() => {
    let list = MOCK_PRODUCTS;

    if (selectedCategory) {
      if (selectedCategory === 'ofertas') {
        list = list.filter((p) => p.tag === 'Oferta');
      } else if (selectedCategory === 'zapatos') {
        list = list.filter((p) => p.depto === 'Zapatos' || p.depto === 'Calzado');
      } else if (selectedCategory === 'linea-blanca') {
        list = list.filter((p) => p.depto === 'Línea Blanca');
      } else if (selectedCategory === 'electronica') {
        list = list.filter((p) => p.depto === 'Electrónica' || p.depto === 'Celulares');
      } else if (selectedCategory === 'celulares') {
        list = list.filter((p) => p.depto === 'Celulares');
      } else if (selectedCategory === 'ropa') {
        list = list.filter((p) => p.depto === 'Ropa');
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.depto.toLowerCase().includes(q) ||
          p.barcode.includes(q)
      );
    }

    return list;
  }, [searchQuery, selectedCategory]);

  // Voice Search simulation
  const handleVoiceSearch = () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }
    setIsVoiceListening(true);
    showToast('Escuchando... Di un producto (ej. "Tenis Nike")', false);

    // Simulated speech query after 2 seconds
    setTimeout(() => {
      setIsVoiceListening(false);
      setSearchQuery('Nike');
      showToast('Buscando: "Nike"', true);
    }, 2200);
  };

  // Request Biometric payment
  const handleRequestBiometricPay = (
    method: PaymentMethodType,
    mode: CheckoutMode,
    frequency: PaymentFrequency
  ) => {
    setPendingPayment({ method, mode, frequency });
    setShowBiometric(true);
  };

  // Complete Biometric payment
  const handleConfirmBiometric = async () => {
    setShowBiometric(false);
    playSuccessChime();

    const currentTotal = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const methodLabels: Record<PaymentMethodType, string> = {
      credito: 'Crédito Coppel',
      tarjeta: 'Tarjeta Débito/Crédito',
      cuenta: 'Cuenta Coppel'
    };

    const paymentLabel = pendingPayment ? methodLabels[pendingPayment.method] : 'Crédito Coppel';

    try {
      // Register purchase on backend
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          total: currentTotal,
          paymentMethod: paymentLabel,
          frequency: pendingPayment?.frequency
        })
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        setTicketData({
          folio: data.folio,
          total: currentTotal,
          itemsCount: totalCartCount,
          items: [...cartItems],
          date: new Date().toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          paymentMethod: paymentLabel,
          frequency: pendingPayment?.frequency,
          qrCodeUrl: data.qrCodeUrl,
          kioskPin: data.kioskPin
        });
      }
    } catch (err) {
      console.warn('Backend checkout fallback to offline ticket:', err);
      const fallbackFolio = `#CPPL-${Math.floor(10000 + Math.random() * 90000)}`;
      setTicketData({
        folio: fallbackFolio,
        total: currentTotal,
        itemsCount: totalCartCount,
        items: [...cartItems],
        date: new Date().toLocaleDateString('es-MX'),
        paymentMethod: paymentLabel,
        frequency: pendingPayment?.frequency,
        qrCodeUrl: `https://coppel.com/validador?folio=${fallbackFolio}&total=${currentTotal}`,
        kioskPin: `K-${Math.floor(1000 + Math.random() * 9000)}`
      });
    }

    setActiveTab(3); // Go to exit ticket
    showToast('¡Pago procesado exitosamente!', true);
  };

  // Reset and return home
  const handleFinishAndReset = () => {
    setCartItems([]);
    setPendingPayment(null);
    setActiveTab(0);
    showToast('Gracias por tu compra en Coppel', true);
  };

  // Store staff assistance trigger - Connects with /api/call-assistance webhook
  const handleTriggerAssistance = async (
    customReason?: string,
    customAisle?: string
  ) => {
    setIsAssistanceLoading(true);
    setShowAssistance(true);
    showToast('Enviando solicitud a asesores de tienda...', false);

    const currentTotal = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

    try {
      const res = await fetch('/api/call-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aisle: customAisle || 'Pasillo 4 - Calzado y Telefonía',
          storeDepartment: 'Piso de Ventas',
          reason: customReason || 'Cliente solicita apoyo con compra en tienda',
          requesterRole: 'cliente',
          requesterName: 'App Móvil Consumidor',
          urgency: 'normal',
          cartTotal: currentTotal
        })
      });

      const data = await res.json();
      if (data.success && data.call) {
        setAssistanceCallData(data.call);
        showToast(
          `Solicitud enviada (PIN: ${data.call.customerPin}). Esperando a un asesor...`,
          false
        );
      }
    } catch (error) {
      console.error('Error al conectar con la app de personal:', error);
      showToast('Asistencia solicitada (Modo offline)');
    } finally {
      setIsAssistanceLoading(false);
    }
  };

  // Poll assistance call status while waiting for an advisor to accept in their app
  useEffect(() => {
    if (!showAssistance || !assistanceCallData?.id || assistanceCallData.status !== 'pendiente') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/call-assistance/${assistanceCallData.id}`);
        const data = await res.json();
        if (data.success && data.call) {
          if (data.call.status === 'en_camino' && data.call.assignedAdvisor) {
            setAssistanceCallData(data.call);
            playSuccessChime();
            showToast(`¡Asignado! ${data.call.assignedAdvisor} va en camino`, true);
          }
        }
      } catch (err) {
        console.warn('Error polling assistance call status:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [showAssistance, assistanceCallData]);

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center sm:p-4 select-none">
      {/* Top Desktop Helper Toolbar */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[440px] mb-2 px-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span>Coppel Phygital v2.4</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Advisor Terminal Monitor Button */}
          <button
            onClick={() => setShowAdvisorTerminal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#005CB9] text-white hover:bg-blue-700 font-bold shadow-xs transition"
            title="Abrir terminal de asesores Coppel"
          >
            <Users className="w-3.5 h-3.5 text-[#FFD200]" />
            <span>Terminal Asesores</span>
          </button>

          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white border border-slate-300 font-semibold shadow-xs transition"
            title="Cambiar formato de visualización"
          >
            {isPhoneFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" /> Pantalla completa
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5" /> Marco de celular
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container / Mobile Phone Shell */}
      <div
        className={`relative w-full bg-gray-50 flex flex-col overflow-hidden transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-[400px] h-[850px] max-h-[94vh] shadow-2xl sm:rounded-[2.5rem] border-[6px] border-gray-800'
            : 'max-w-md h-screen sm:rounded-none border-none'
        }`}
      >
        {/* Device Status Bar */}
        <div className="bg-[#005CB9] text-white px-5 pt-2 pb-1 flex justify-between items-center text-[11px] font-semibold tracking-tight shrink-0 select-none">
          <span className="font-bold">{currentTime || '09:41'}</span>

          {/* Speaker notch on phone frame */}
          {isPhoneFrame && (
            <div className="w-24 h-4 bg-gray-900 rounded-full flex items-center justify-center">
              <div className="w-8 h-1 bg-gray-700 rounded-full" />
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold">5G</span>
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Global Coppel Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onVoiceSearch={handleVoiceSearch}
          isVoiceListening={isVoiceListening}
        />

        {/* Main Content Area */}
        <main className="flex-1 relative bg-gray-50 hide-scrollbar overflow-y-auto">
          {activeTab === 0 && (
            <HomeStep
              products={filteredProducts}
              onAddToCart={handleAddToCart}
              onOpenAccountModal={() => setShowAccountModal(true)}
              onNavigateToScan={() => setActiveTab(1)}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}

          {activeTab === 1 && (
            <ScannerStep
              catalog={MOCK_PRODUCTS}
              onProductScanned={handleAddToCart}
              onShowToast={showToast}
            />
          )}

          {activeTab === 2 && (
            <CartStep
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onNavigateToScan={() => setActiveTab(1)}
              onRequestBiometricPay={handleRequestBiometricPay}
            />
          )}

          {activeTab === 3 && (
            <ExitStep
              ticket={ticketData}
              onFinishAndReset={handleFinishAndReset}
              onPrintInKiosk={() => setShowKioskModal(true)}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Floating In-Store Assistance Button */}
        <button
          onClick={() => handleTriggerAssistance()}
          className="absolute bottom-18 left-4 w-12 h-12 bg-[#FFD200] active:scale-95 hover:scale-105 rounded-full shadow-lg flex items-center justify-center z-30 transition border-2 border-[#E5BD00]"
          title="Pedir asistencia de personal en tienda"
          aria-label="Asistencia en tienda"
        >
          <Hand className="w-6 h-6 text-[#005CB9]" />
        </button>

        {/* Bottom Nav */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cartCount={totalCartCount}
        />

        {/* Toast Notification */}
        <Toast message={toastMessage} isSuccess={toastIsSuccess} />

        {/* Biometric Confirmation Modal */}
        <BiometricModal
          isOpen={showBiometric}
          onConfirm={handleConfirmBiometric}
          onCancel={() => {
            setShowBiometric(false);
            showToast('Pago cancelado');
          }}
        />

        {/* Central Assistance Popup */}
        <AssistanceModal
          isOpen={showAssistance}
          onClose={() => setShowAssistance(false)}
          callData={assistanceCallData}
          isLoading={isAssistanceLoading}
          onSendCustomRequest={(reason, aisle) => handleTriggerAssistance(reason, aisle)}
        />

        {/* Advisor Terminal Monitor */}
        <AdvisorTerminalModal
          isOpen={showAdvisorTerminal}
          onClose={() => setShowAdvisorTerminal(false)}
          onShowToast={showToast}
        />

        {/* Digital Account Modal */}
        <DigitalAccountModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
        />

        {/* Kiosk Physical Print Modal */}
        <KioskModal
          isOpen={showKioskModal}
          onClose={() => setShowKioskModal(false)}
          folio={ticketData.folio}
          pin={ticketData.kioskPin}
          onShowToast={showToast}
        />
      </div>
    </div>
  );
}
