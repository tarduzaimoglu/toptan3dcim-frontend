"use client";

import { useState } from "react";
import { Filter, X, ChevronDown, Check, Loader2 } from "lucide-react";

// YENİ VE DOĞRU TİP TANIMLAMALARI
interface ColorOption {
  id: string;
  label: string;
  hex: string;
}

interface ProductFilterProps {
  categories: any[];
  availableColors: ColorOption[];
  selectedCategory: string;
  selectedColors: string[];
  onCategoryChange: (catKey: string) => void;
  onColorToggle: (colorCode: string) => void;
  isLoading: boolean;
}

export default function ProductFilter({
  categories,
  availableColors,
  selectedCategory,
  selectedColors,
  onCategoryChange,
  onColorToggle,
  isLoading,
}: ProductFilterProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const FilterContent = () => (
    <div className="space-y-6 relative">
      
      {/* Kategoriler */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex justify-between items-center">
          Kategoriler <ChevronDown size={16} />
        </h3>
        <div className="space-y-1">
          <button 
            onClick={() => onCategoryChange("all")}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center space-x-3 
              ${selectedCategory === "all" ? 'bg-[#FF5733]/10 text-[#FF5733] font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedCategory === "all" ? 'border-[#FF5733] bg-[#FF5733]' : 'border-gray-300'}`}>
              {selectedCategory === "all" && <Check size={12} color="white" />}
            </div>
            <span>Tüm Ürünler</span>
          </button>

          {categories.map((cat) => (
            <button 
              key={cat.key}
              onClick={() => onCategoryChange(cat.key)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center space-x-3 
                ${selectedCategory === cat.key ? 'bg-[#FF5733]/10 text-[#FF5733] font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedCategory === cat.key ? 'border-[#FF5733] bg-[#FF5733]' : 'border-gray-300'}`}>
                {selectedCategory === cat.key && <Check size={12} color="white" />}
              </div>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Akıllı Renk Seçenekleri */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex justify-between items-center">
          Renk Seçenekleri <ChevronDown size={16} />
        </h3>
        <div className="flex flex-wrap gap-3 px-2">
          {availableColors.map((color) => {
            const isSelected = selectedColors.includes(color.id);
            return (
              <button
                key={color.id}
                onClick={() => onColorToggle(color.id)}
                className={`relative w-8 h-8 rounded-full shadow-sm transition-all focus:outline-none flex items-center justify-center
                  ${isSelected ? 'ring-2 ring-offset-2 ring-[#FF5733] scale-110' : 'border border-gray-300 hover:scale-110'}`}
                style={{ backgroundColor: color.hex }}
                title={color.label}
              >
                {isSelected && (
                  <Check size={14} color={color.id === 'white' || color.id === 'yellow' ? '#333' : '#FFF'} />
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-1/4 pr-8 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Filtreler {isLoading && <Loader2 size={16} className="animate-spin text-[#FF5733]" />}
          </h2>
          {(selectedCategory !== "all" || selectedColors.length > 0) && (
             <button onClick={() => { onCategoryChange("all"); selectedColors.forEach(c => onColorToggle(c)); }} className="text-sm text-[#FF5733] hover:underline font-medium">Temizle</button>
          )}
        </div>
        <FilterContent />
      </div>

      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button onClick={() => setIsMobileOpen(true)} className="bg-[#333333] text-white px-6 py-3 rounded-full font-medium shadow-xl flex items-center space-x-2">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Filter size={18} />}
          <span>Filtrele {(selectedColors.length > 0 || selectedCategory !== "all") && "• Aktif"}</span>
        </button>
      </div>

      {isMobileOpen && <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsMobileOpen(false)} />}
      <div className={`fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl transition-transform duration-300 lg:hidden max-h-[85vh] overflow-y-auto ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold flex items-center gap-2">Filtreler {isLoading && <Loader2 size={16} className="animate-spin" />}</h2>
          <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6"><FilterContent /></div>
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100">
           <button onClick={() => setIsMobileOpen(false)} className="w-full py-3 font-semibold text-white bg-[#FF5733] rounded-xl shadow-md">Sonuçları Göster</button>
        </div>
      </div>
    </>
  );
}
