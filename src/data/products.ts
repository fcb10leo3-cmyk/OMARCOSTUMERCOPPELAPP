import { Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-moto',
    name: 'Motocicleta American Piston 150cc',
    price: 59999.0,
    originalPrice: 65999.0,
    img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
    depto: 'Movilidad',
    barcode: '7501030429401',
    sku: 'MOT-AP150',
    tag: 'Oferta',
    description: 'Motor de 4 tiempos enfriado por aire, transmisión de 5 velocidades.'
  },
  {
    id: 'prod-botas',
    name: 'Botas Confort Jennifer Lopez Negras',
    price: 999.0,
    originalPrice: 1299.0,
    img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80',
    depto: 'Zapatos',
    barcode: '7501030429402',
    sku: 'ZAP-JL-402',
    tag: 'Oferta',
    description: 'Calzado femenino de piel sintética con plantilla ergonómica y tacón medio.'
  },
  {
    id: 'prod-perfume',
    name: 'Perfume Carolina Herrera Good Girl 80ml',
    price: 3450.0,
    originalPrice: 3890.0,
    img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
    depto: 'Belleza',
    barcode: '7501030429403',
    sku: 'PER-CH-80ML',
    description: 'Fragancia oriental floral con notas de haba tonka y jazmín sambac.'
  },
  {
    id: 'prod-lavadora',
    name: 'Lavadora Automática Whirlpool 19kg',
    price: 10499.0,
    originalPrice: 12999.0,
    img: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80',
    depto: 'Línea Blanca',
    barcode: '7501030429404',
    sku: 'LAV-WP19K',
    description: 'Sistema de lavado Xpert System con 12 ciclos automáticos y agitador Triple Action.'
  },
  {
    id: 'prod-tenis',
    name: 'Tenis Nike Air Max 270 Hombre',
    price: 2199.0,
    originalPrice: 2899.0,
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    depto: 'Calzado',
    barcode: '7501030429405',
    sku: 'TEN-NK270',
    tag: 'Oferta',
    description: 'Unidad Air Max de gran volumen para amortiguación elástica durante todo el día.'
  },
  {
    id: 'prod-pantalon',
    name: "Pantalón Levi's 501 Original Fit Azul",
    price: 1099.0,
    originalPrice: 1399.0,
    img: 'https://images.unsplash.com/photo-1542272604-780c9685646a?auto=format&fit=crop&w=400&q=80',
    depto: 'Ropa',
    barcode: '7501030429406',
    sku: 'ROP-LEV501',
    description: 'El corte recto original de tiro medio y botón clásico en mezclilla de alta durabilidad.'
  },
  {
    id: 'prod-smartwatch',
    name: 'Smartwatch Huawei Watch Fit 2 Negro',
    price: 1899.0,
    originalPrice: 2399.0,
    img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
    depto: 'Electrónica',
    barcode: '7501030429407',
    sku: 'ELE-HWFIT2',
    description: 'Pantalla AMOLED FullView de 1.74", llamadas Bluetooth y monitoreo SpO2 continuo.'
  },
  {
    id: 'prod-celular',
    name: 'Smartphone Samsung Galaxy A54 5G 128GB',
    price: 5499.0,
    originalPrice: 6999.0,
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
    depto: 'Celulares',
    barcode: '7501030429408',
    sku: 'CEL-SAMA54',
    tag: 'Oferta',
    description: 'Cámara triple de 50 MP con OIS, batería de 5,000 mAh y pantalla Super AMOLED 120Hz.'
  }
];

export const DEPARTMENTS = [
  { id: 'ofertas', name: 'Ofertas', discount: 'Hasta 60%', icon: 'tag' },
  { id: 'zapatos', name: 'Zapatos', discount: 'Hasta 40%', icon: 'footprints' },
  { id: 'linea-blanca', name: 'Línea Blanca', discount: 'Hasta 40%', icon: 'washing-machine' },
  { id: 'electronica', name: 'Electrónica', discount: 'Hasta 40%', icon: 'smartphone' },
  { id: 'celulares', name: 'Celulares', discount: 'Hasta 35%', icon: 'phone' },
  { id: 'ropa', name: 'Ropa', discount: 'Hasta 50%', icon: 'shirt' }
];
