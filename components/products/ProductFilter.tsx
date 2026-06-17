"use client";

import { useState } from "react";
import { Filter, X, ChevronDown, Check } from "lucide-react";

interface Category {
  key: string;
  label: string;
}

interface ColorOption {
  code: string;
  name: string;
}

interface ProductFilterProps {
  categories: Category[];
  availableColors: ColorOption[];
  selectedCategory: string | null;
  selectedColors: string[];
  onCategoryChange: (catKey: string) => void;
  onColorToggle: (colorCode: string) => void;
}

export default function ProductFilter({
  categories,
  availableColors,
  selectedCategory,
  selectedColors,
  onCategoryChange,
  onColorToggle,
}: ProductFilterProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const FilterContent = () => (
    <div className="space-y-6">
      
      {/* KATEGORİLER */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex justify-between items-center">
          Kategoriler <ChevronDown size={16} />
        </h3>
        <div className="space-y-2">
          {/* Tümü Seçeneği */}
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="radio" 
              name="category"
              checked={!selectedCategory || selectedCategory === "featured"}
              onChange={() => onCategoryChange("featured")}
              className="form-radio h-4 w-4 text-[#FF5733] border-gray-300 focus:ring-[#FF5733]" 
            />
            <span className={`transition-colors ${!selectedCategory || selectedCategory === "featured" ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
              Tüm Ürünler
            </span>
          </label>

          {/* Dinamik Kategoriler */}
          {categories.map((cat) => (
            <label key={cat.key} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="radio" 
                name="category"
                checked={selectedCategory === cat.key}
                onChange={() => onCategoryChange(cat.key)}
                className="form-radio h-4 w-4 text-[#FF5733] border-gray-300 focus:ring-[#FF5733]" 
              />
              <span className={`transition-colors ${selectedCategory === cat.key ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* RENK SEÇENEKLERİ */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex justify-between items-center">
          Renk Seçenekleri <ChevronDown size={16} />
        </h3>
        <div className="flex flex-wrap gap-3">
          {availableColors.map((color) => {
            const isSelected = selectedColors.includes(color.code);
            return (
              <button
                key={color.code}
                onClick={() => onColorToggle(color.code)}
                className={`relative w-8 h-8 rounded-full shadow-sm transition-all focus:outline-none flex items-center justify-center
                  ${isSelected ? 'ring-2 ring-offset-2 ring-[#FF5733] scale-110' : 'border border-gray-200 hover:scale-110'}`}
                style={{ backgroundColor: color.code }}
                title={color.name}
              >
                {isSelected && (
                  <Check size={14} color={color.code.toUpperCase() === '#FFFFFF' ? '#333' : '#FFF'} />
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
      {/* Masaüstü Görünüm */}
      <div className="hidden lg:block w-1/4 pr-8 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Filtreler</h2>
          {(selectedCategory || selectedColors.length > 0) && (
            <button 
              onClick={() => { onCategoryChange("featured"); selectedColors.forEach(c => onColorToggle(c)); }} 
              className="text-sm text-[#FF5733] hover:underline font-medium"
            >
              Temizle
            </button>
          )}
        </div>
        <FilterContent />
      </div>

      {/* Mobil Fab Buton */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="bg-[#333333] text-white px-6 py-3 rounded-full font-medium shadow-xl flex items-center space-x-2"
        >
          <Filter size={18} />
          <span>Filtrele {(selectedColors.length > 0 || selectedCategory) && "• Aktif"}</span>
        </button>
      </div>

      {/* Mobil Bottom Sheet */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
      <div className={`fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl transition-transform duration-300 lg:hidden max-h-[85vh] overflow-y-auto ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold">Filtreler</h2>
          <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6"><FilterContent /></div>
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100">
           <button 
            onClick={() => setIsMobileOpen(false)}
            className="w-full py-3 font-semibold text-white bg-[#FF5733] rounded-xl shadow-md"
          >
            Sonuçları Göster
          </button>
        </div>
      </div>
    </>
  );
}
