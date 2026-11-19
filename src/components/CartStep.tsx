import React, { useState } from 'react';
import {
  ShoppingCart,
  ShoppingBag,
  Trash2,
  Banknote,
  CalendarClock,
  ArrowLeft,
  Wallet,
  CreditCard,
  Coins,
  Fingerprint,
  Plus,
  Minus
} from 'lucide-react';
import { CartItem, CheckoutMode, PaymentFrequency, PaymentMethodType } from '../types';

interface CartStepProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onNavigateToScan: () => void;
  onRequestBiometricPay: (method: PaymentMethodType, mode: CheckoutMode, freq: PaymentFrequency) => void;
  onPayWithAdvisor?: () => void;
}

export const CartStep: React.FC<CartStepProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onNavigateToScan,
  onRequestBiometricPay,
  onPayWithAdvisor
}) => {
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>(null);
  const [frequency, setFrequency] = useState<PaymentFrequency>('quincenal');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('credito');

  // Calculate totals
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const currentTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Interest & installment calculations
  const getFrequencyConfig = (freq: PaymentFrequency) => {
    switch (freq) {
      case 'semanal':
        return { periods: 52, interest: 1.45, label: 'semana', displayPeriod: 'Semanales' };
      case 'mensual':
        return { periods: 12, interest: 1.15, label: 'mes', displayPeriod: 'Mensuales' };
      case 'quincenal':
      default:
        return { periods: 24, interest: 1.30, label: 'quincena', displayPeriod: 'Quincenales' };
    }
  };

  const freqConfig = getFrequencyConfig(frequency);

  // Total installment per period
  const totalInstallment = (currentTotal * freqConfig.interest) / freqConfig.periods;

  const handlePayClick = () => {
    if (cartItems.length === 0) return;
    onRequestBiometricPay(paymentMethod, checkoutMode, frequency);
  };

  return (
    <div className="p-4 h-full flex flex-col bg-gray-50 pb-24 overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="font-extrabold text-xl text-[#005CB9] flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-[#005CB9]" />
          Tu Carrito
        </h2>
        {cartItems.length > 0 && (
          <span className="text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200">
            {totalItemsCount} {totalItemsCount === 1 ? 'artículo' : 'artículos'}
          </span>
        )}
      </div>

      {/* Empty State */}
      {cartItems.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-8 my-auto flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <ShoppingBag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-800 font-bold text-base">Tu carrito está vacío</h3>
          <p className="text-xs text-gray-500 mt-1.5 mb-5 max-w-[240px]">
            Ve a la sección de escáner para agregar artículos directamente de los estantes de la tienda.
          </p>
          <button
            onClick={onNavigateToScan}
            className="text-[#005CB9] font-extrabold text-xs bg-blue-50 hover:bg-blue-100 px-5 py-3 rounded-full transition shadow-xs active:scale-95"
          >
            Ir a escanear en tienda
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full min-h-0">
          {/* Cart Items list */}
          <div className="space-y-2.5 mb-3 flex-1 overflow-y-auto hide-scrollbar pr-0.5">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-2xl shadow-xs border border-gray-100 flex gap-3 items-center"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-xl p-1 shrink-0 border border-gray-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-xs sm:text-sm leading-tight truncate">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {item.depto} • SKU: {item.sku}
                  </p>
                  <div className="font-extrabold text-[#005CB9] text-sm mt-1">
                    ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition p-1 bg-gray-50 hover:bg-red-50 rounded-full"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-black rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-gray-800 w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-black rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Flow Panel */}
          <div className="bg-white p-4 rounded-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border border-gray-100 mt-auto shrink-0 transition-all duration-300">
            {/* Estado 1: Selección de Modalidad */}
            {checkoutMode === null ? (
              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-xs sm:text-sm text-center">
                  Selecciona tu modalidad de pago
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCheckoutMode('contado')}
                    className="border border-gray-300 bg-white rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition shadow-xs active:scale-95"
                  >
                    <Banknote className="w-7 h-7 text-[#005CB9]" />
                    <span className="text-xs font-bold text-gray-700">De Contado</span>
                    <span className="text-[10px] text-gray-400 font-semibold">1 solo pago hoy</span>
                  </button>

                  <button
                    onClick={() => setCheckoutMode('planes')}
                    className="bg-[#FFD200] border-2 border-[#E5BD00] rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 hover:brightness-105 transition shadow-sm relative overflow-hidden active:scale-95"
                  >
                    <div className="absolute inset-0 bg-white/25 transform -skew-x-12 -translate-x-full animate-shimmer" />
                    <CalendarClock className="w-7 h-7 text-[#005CB9]" />
                    <span className="text-xs font-black text-[#005CB9]">Planes de Pago</span>
                    <span className="text-[10px] text-[#005CB9] font-bold">Desde 24 quincenas</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Estado 2: Detalles del Flujo Seleccionado */
              <div className="flex flex-col gap-3">
                {/* Header y Botón Volver */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <button
                    onClick={() => setCheckoutMode(null)}
                    className="text-gray-400 hover:text-[#005CB9] flex items-center gap-1 text-xs font-semibold transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Volver
                  </button>
                  <span className="font-extrabold text-[#005CB9] text-xs uppercase tracking-wider">
                    {checkoutMode === 'contado' ? 'Pago de Contado' : 'Planes de Pago'}
                  </span>
                </div>

                {/* Flujo: Contado Summary */}
                {checkoutMode === 'contado' && (
                  <div className="flex justify-between items-end bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                    <div>
                      <span className="text-gray-500 text-xs font-medium block">
                        Total a pagar hoy
                      </span>
                      <span className="text-[10px] font-bold text-[#005CB9] bg-white px-2 py-0.5 rounded-full mt-1 inline-block border border-blue-100">
                        {totalItemsCount} {totalItemsCount === 1 ? 'artículo' : 'artículos'}
                      </span>
                    </div>
                    <span className="font-black text-2xl text-[#005CB9] leading-none">
                      ${currentTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {/* Flujo: Planes de Pago Summary */}
                {checkoutMode === 'planes' && (
                  <div className="flex flex-col gap-2.5">
                    {/* Frecuencia switch */}
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                      {(['semanal', 'quincenal', 'mensual'] as PaymentFrequency[]).map((f) => {
                        const labels: Record<PaymentFrequency, string> = {
                          semanal: 'Semanales',
                          quincenal: 'Quincenales',
                          mensual: 'Mensuales'
                        };
                        const isActive = frequency === f;
                        return (
                          <button
                            key={f}
                            onClick={() => setFrequency(f)}
                            className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition ${
                              isActive
                                ? 'bg-white text-[#005CB9] shadow-xs'
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            {labels[f]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Breakdown per item */}
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 max-h-32 overflow-y-auto hide-scrollbar space-y-1.5">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-1 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                        <span>Desglose por artículo</span>
                        <span>Cuota x {freqConfig.label}</span>
                      </div>
                      {cartItems.map((item) => {
                        const itemInstallment =
                          (item.price * freqConfig.interest * item.quantity) / freqConfig.periods;
                        return (
                          <div
                            key={item.id}
                            className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100"
                          >
                            <div className="flex flex-col flex-1 min-w-0 pr-2">
                              <span className="text-[10px] text-gray-800 font-bold truncate">
                                {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                              </span>
                              <span className="text-[9px] text-gray-400">
                                Contado: ${(item.price * item.quantity).toLocaleString('es-MX')}
                              </span>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                              <span className="text-xs font-black text-[#005CB9]">
                                ${itemInstallment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-[8px] text-gray-500 uppercase font-medium">
                                x {freqConfig.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Installment notice */}
                    <div className="bg-yellow-50/80 border border-yellow-200 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-700">Total a pagar por período:</span>
                      <span className="font-black text-sm text-[#005CB9]">
                        ${totalInstallment.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-[9px] font-normal text-gray-600">/{freqConfig.label}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Métodos de Pago Compartidos */}
                <div className="mt-1">
                  <h4 className="text-[11px] font-bold text-gray-800 mb-1.5">
                    Selecciona método de pago
                  </h4>
                  <div className="space-y-1.5">
                    {/* Cuenta Coppel */}
                    <label
                      onClick={() => setPaymentMethod('cuenta')}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                        paymentMethod === 'cuenta'
                          ? 'border-2 border-[#005CB9] bg-blue-50/70 shadow-xs'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'cuenta'}
                          onChange={() => setPaymentMethod('cuenta')}
                          className="text-[#005CB9] focus:ring-[#005CB9] w-3.5 h-3.5"
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                            <Wallet className="w-3 h-3 text-gray-600" />
                          </div>
                          <span
                            className={`text-xs ${
                              paymentMethod === 'cuenta' ? 'font-bold text-[#005CB9]' : 'font-medium text-gray-700'
                            }`}
                          >
                            Cuenta Coppel
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold">Saldo: $4,200.00</span>
                    </label>

                    {/* Tarjeta Débito/Crédito */}
                    <label
                      onClick={() => setPaymentMethod('tarjeta')}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                        paymentMethod === 'tarjeta'
                          ? 'border-2 border-[#005CB9] bg-blue-50/70 shadow-xs'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'tarjeta'}
                          onChange={() => setPaymentMethod('tarjeta')}
                          className="text-[#005CB9] focus:ring-[#005CB9] w-3.5 h-3.5"
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-3 h-3 text-gray-600" />
                          </div>
                          <span
                            className={`text-xs ${
                              paymentMethod === 'tarjeta' ? 'font-bold text-[#005CB9]' : 'font-medium text-gray-700'
                            }`}
                          >
                            Tarjeta Débito/Crédito
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold">Visa / MC</span>
                    </label>

                    {/* Crédito Coppel (Default) */}
                    <label
                      onClick={() => setPaymentMethod('credito')}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                        paymentMethod === 'credito'
                          ? 'border-2 border-[#005CB9] bg-blue-50 rounded-xl shadow-xs'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'credito'}
                          onChange={() => setPaymentMethod('credito')}
                          className="text-[#005CB9] focus:ring-[#005CB9] w-4 h-4"
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#FFD200] rounded-full flex items-center justify-center">
                            <Coins className="w-3.5 h-3.5 text-[#005CB9]" />
                          </div>
                          <span
                            className={`text-xs ${
                              paymentMethod === 'credito' ? 'font-black text-[#005CB9]' : 'font-medium text-gray-700'
                            }`}
                          >
                            Crédito Coppel
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-green-700 bg-green-100/80 px-2 py-0.5 rounded-full">
                        $18,500 disp.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Simulador de crédito (estimado) */}
                {checkoutMode === 'planes' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs">
                    <p className="font-extrabold text-[#005CB9] mb-1.5">Simulador de crédito · estimado</p>
                    <div className="space-y-1">
                      {(['semanal', 'quincenal', 'mensual'] as PaymentFrequency[]).map((f) => {
                        const c = getFrequencyConfig(f);
                        const pago = (currentTotal * c.interest) / c.periods;
                        return (
                          <div key={f} className={`flex justify-between ${f === frequency ? 'font-black text-[#005CB9]' : 'text-gray-600'}`}>
                            <span>{c.periods} pagos {c.displayPeriod.toLowerCase()}</span>
                            <span>${pago.toLocaleString('es-MX', { maximumFractionDigits: 0 })} c/u</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">Cifras estimadas de demostración; el asesor confirma tu plan real.</p>
                  </div>
                )}

                {/* Botón Pagar Ahora */}
                <button
                  onClick={handlePayClick}
                  className="w-full bg-[#005CB9] text-white font-extrabold py-3.5 rounded-xl shadow-md hover:bg-blue-700 transition transform active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group mt-1"
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-shimmer" />
                  <Fingerprint className="w-5 h-5 text-[#FFD200]" />
                  Pagar Ahora
                </button>
                {onPayWithAdvisor && (
                  <button
                    onClick={onPayWithAdvisor}
                    className="w-full bg-white text-[#005CB9] border-2 border-[#005CB9] font-extrabold py-3 rounded-xl hover:bg-blue-50 transition active:scale-95 text-sm"
                  >
                    Pagar con un asesor
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
