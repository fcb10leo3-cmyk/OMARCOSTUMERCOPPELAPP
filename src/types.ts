export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  img: string;
  depto: string;
  barcode: string;
  tag?: string;
  sku: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
  addedAt: number;
}

export type CheckoutMode = 'contado' | 'planes' | null;

export type PaymentFrequency = 'semanal' | 'quincenal' | 'mensual';

export type PaymentMethodType = 'credito' | 'tarjeta' | 'cuenta';

export interface TicketData {
  folio: string;
  total: number;
  itemsCount: number;
  items: CartItem[];
  date: string;
  paymentMethod: string;
  frequency?: PaymentFrequency;
  qrCodeUrl: string;
  kioskPin: string;
}
