import React from 'react';
import { Home, ScanBarcode, ShoppingCart, Ticket } from 'lucide-react';

interface BottomNavProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  cartCount
}) => {
  const navItems = [
    { id: 0, label: 'Inicio', icon: Home },
    { id: 1, label: 'Escanear', icon: ScanBarcode },
    { id: 2, label: 'Carrito', icon: ShoppingCart, hasBadge: true },
    { id: 3, label: 'Salida', icon: Ticket }
  ];

  return (
    <nav className="shrink-0 w-full bg-white border-t border-gray-200 px-3 py-2 pb-5 flex justify-around items-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center gap-1 transition flex-1 py-1 relative ${
              isActive
                ? 'text-[#005CB9] font-bold'
                : 'text-gray-400 hover:text-[#005CB9] font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
              {item.hasBadge && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#E20613] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-scale">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-tight select-none">
              {item.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#005CB9] -mb-1 mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
