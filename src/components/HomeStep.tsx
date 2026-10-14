import React, { useState } from 'react';
import { Tag, Footprints, WashingMachine, Smartphone, Sparkles, Plus, Check } from 'lucide-react';
import { Product } from '../types';
import { DEPARTMENTS } from '../data/products';

interface HomeStepProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onOpenAccountModal: () => void;
  onNavigateToScan: () => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const HomeStep: React.FC<HomeStepProps> = ({
  products,
  onAddToCart,
  onOpenAccountModal,
  onNavigateToScan,
  selectedCategory,
  onSelectCategory
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAdd = (product: Product) => {
    onAddToCart(product);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'tag':
        return <Tag className="w-5 h-5" />;
      case 'footprints':
        return <Footprints className="w-5 h-5" />;
      case 'washing-machine':
        return <WashingMachine className="w-5 h-5" />;
      case 'smartphone':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white pb-24 min-h-full">
      {/* Promo Banner Carousel */}
      <div className="bg-blue-50/50 p-4 relative overflow-hidden">
        <div className="bg-[#003876] rounded-2xl p-4 sm:p-5 text-white flex flex-col justify-center relative overflow-hidden shadow-md h-38">
          {/* Background decorative glow */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-blue-500/20 rounded-full blur-xl" />
          <div className="z-10 w-2/3">
            <span className="text-[10px] font-bold tracking-widest text-[#FFD200] uppercase mb-1 block">
              Especial de Tienda
            </span>
            <h2 className="font-extrabold text-2xl leading-tight mb-1">
              Hasta <span className="text-3xl text-[#FFD200]">40%</span>
            </h2>
            <p className="text-[11px] font-medium text-blue-100 mb-3 leading-snug">
              de descuento en celulares y accesorios
            </p>
            <button
              onClick={onNavigateToScan}
              className="bg-[#FFD200] text-[#005CB9] hover:bg-yellow-400 font-extrabold text-[11px] px-4 py-2 rounded-full w-max shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#005CB9]" />
              Equípate en tienda
            </button>
          </div>

          <img
            src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=300&q=80"
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-36 h-36 object-cover rounded-full opacity-85 shadow-lg border-2 border-white/20"
            alt="Celulares y Accesorios Coppel"
          />
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeSlide === idx ? 'w-5 bg-[#005CB9]' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Departments List */}
      <div className="pt-2 pb-5 px-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base text-gray-800">
            Todos los departamentos
          </h3>
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs font-semibold text-[#005CB9] hover:underline"
            >
              Ver todos
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedCategory === dept.id;
            return (
              <div
                key={dept.id}
                onClick={() => onSelectCategory(isSelected ? null : dept.id)}
                className={`flex flex-col items-center min-w-[74px] gap-1.5 cursor-pointer transition select-none ${
                  isSelected ? 'scale-105' : 'hover:opacity-85'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-xs ${
                    isSelected
                      ? 'bg-[#005CB9] text-white ring-2 ring-[#FFD200]'
                      : 'bg-white border border-gray-200 text-[#005CB9] hover:border-blue-300'
                  }`}
                >
                  {getDeptIcon(dept.icon)}
                </div>
                <span
                  className={`text-[11px] font-medium text-center leading-tight truncate max-w-[70px] ${
                    isSelected ? 'text-[#005CB9] font-bold' : 'text-gray-700'
                  }`}
                >
                  {dept.name}
                </span>
                <span className="text-[10px] font-bold text-[#E20613] leading-none">
                  {dept.discount}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Banner */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="bg-[#005CB9] rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="z-10 w-2/3">
            <span className="text-[9px] font-bold tracking-wider text-[#FFD200] uppercase block mb-0.5">
              Crédito Coppel
            </span>
            <p className="text-white font-bold text-xs sm:text-sm leading-snug">
              Crea tu cuenta digital y compra más fácil y rápido
            </p>
          </div>
          <button
            onClick={onOpenAccountModal}
            className="z-10 bg-white text-[#005CB9] hover:bg-yellow-50 text-xs font-black px-3.5 py-2 rounded-xl whitespace-nowrap shadow-sm transition active:scale-95"
          >
            Hazlo aquí
          </button>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-gray-800">
            {selectedCategory ? `Departamento: ${selectedCategory}` : 'Descubre más para ti'}
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            {products.length} productos
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 text-sm font-medium">No se encontraron productos en este departamento.</p>
            <button
              onClick={() => onSelectCategory(null)}
              className="mt-3 text-xs font-bold text-[#005CB9] bg-blue-50 px-4 py-2 rounded-full"
            >
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const isAdded = addedIds[product.id];
              return (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-2xl p-3 shadow-xs flex flex-col relative group hover:shadow-md transition-all duration-200"
                >
                  {product.tag && (
                    <span className="absolute top-2 left-2 bg-[#E20613] text-white text-[9px] font-black px-2 py-0.5 rounded-md z-10 shadow-xs">
                      {product.tag}
                    </span>
                  )}

                  <div className="h-28 flex items-center justify-center mb-2 overflow-hidden rounded-xl bg-gray-50 p-1">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
                    {product.depto}
                  </span>

                  <h4 className="text-xs font-medium text-gray-800 line-clamp-2 mb-1.5 h-8 leading-tight">
                    {product.name}
                  </h4>

                  <div className="flex items-baseline gap-1.5 mt-auto">
                    <span
                      className={`font-black text-sm ${
                        product.tag === 'Oferta' ? 'text-[#E20613]' : 'text-gray-900'
                      }`}
                    >
                      $ {product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through">
                        ${product.originalPrice.toLocaleString('es-MX')}
                      </span>
                    )}
                  </div>

                  {/* Monthly or Bi-weekly credit teaser */}
                  <span className="text-[9px] font-semibold text-gray-500 mt-1 block">
                    Desde ${(product.price * 1.3 / 24).toFixed(0)} quincenales
                  </span>

                  {/* Add to cart quick button */}
                  <button
                    onClick={() => handleAdd(product)}
                    className={`mt-2.5 w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs active:scale-95 ${
                      isAdded
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-50 text-[#005CB9] hover:bg-[#005CB9] hover:text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Agregado
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Agregar
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
