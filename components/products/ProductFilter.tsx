"use client";

import { useState } from "react";
import { Filter, X, ChevronDown, Check, Search, ArrowUpDown } from "lucide-react";

interface ColorOption {
  id: string;
  label: string;
  hex: string;
}

interface ProductFilterProps {
  categories: any[];
  availableColors: ColorOption[];
  selectedCategories: string[];
  selectedColors: string[];
  searchQuery: string;
  sortOption: string;
  onCategoryToggle: (catKey: string) => void;
  onColorToggle: (colorCode: string) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
  onClearAll: () => void;
}

export default function ProductFilter({
  categories,
  availableColors,
  selectedCategories,
  selectedColors,
  searchQuery,
  sortOption,
  onCategoryToggle,
  onColorToggle,
  onSearchChange,
  onSortChange,
  onClearAll,
}: ProductFilterProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeFilterCount = selectedCategories.length + selectedColors.length + (searchQuery ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6 relative">
      
      {/* 1. ARAMA ÇUBUĞU */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Ürünlerde ara..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733] transition-all"
        />
      </div>

      {/* 2. SIRALAMA (Sadece Masaüstünde Burada Görünür, Mobilde Butonda) */}
      <div className="hidden lg:block">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ArrowUpDown size={16} /> Sıralama
        </h3>
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
        >
          <option value="newest">En Yeniler</option>
          <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
          <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
          <option value="minqty_asc">Min. Adet: Azdan Çoğa</option>
          <option value="minqty_desc">Min. Adet: Çoktan Aza</option>
        </select>
      </div>

      <hr className="border-gray-100 hidden lg:block" />

      {/* 3. KATEGORİLER (Çoklu Seçim - Checkbox) */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex justify-between items-center">
          Kategoriler <ChevronDown size={16} />
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.key);
            return (
              <button 
                key={cat.key}
                onClick={() => onCategoryToggle(cat.key)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center space-x-3 
                  ${isSelected ? 'bg-[#FF5733]/10 text-[#FF5733] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors
                  ${isSelected ? 'border-[#FF5733] bg-[#FF5733]' : 'border-gray-300'}`}>
                  {isSelected && <Check size={12} color="white" />}
                </div>
                <span className="text-sm">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 4. RENK SEÇENEKLERİ */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex justify-between items-center">
          Renk Seçenekleri <ChevronDown size={16} />
        </h3>
        <div className="flex flex-wrap gap-3 px-1">
          {availableColors.map((color) => {
            const isSelected = selectedColors.includes(color.id);
            return (
              <button
                key={color.id}
                onClick={() => onColorToggle(color.id)}
                className={`relative w-8 h-8 rounded-full shadow-sm transition-transform focus:outline-none flex items-center justify-center
                  ${isSelected ? 'ring-2 ring-offset-2 ring-[#FF5733] scale-110' : 'border border-gray-200 hover:scale-110'}`}
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
      {/* MASAÜSTÜ GÖRÜNÜM: Sol Kenar Çubuğu */}
      <div className="hidden lg:block w-1/4 pr-8 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Filtreler</h2>
          {activeFilterCount > 0 && (
             <button onClick={onClearAll} className="text-sm text-[#FF5733] hover:underline font-medium">Temizle</button>
          )}
        </div>
        <FilterContent />
      </div>

      {/* MOBİL GÖRÜNÜM: Ekran Altı Modern Kontrol Barı (Trendyol/Zara Stili) */}
      <div className="lg:hidden fixed bottom-6 inset-x-4 z-40 mx-auto max-w-sm">
        <div className="bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full border border-gray-100 flex items-center divide-x divide-gray-100 p-1">
          
          {/* Mobil Sıralama Butonu (Native Select kullanımı ile çok pürüzsüz çalışır) */}
          <div className="flex-1 relative">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="newest">En Yeniler</option>
              <option value="price_asc">Fiyat (Artan)</option>
              <option value="price_desc">Fiyat (Azalan)</option>
              <option value="minqty_asc">Min. Adet (Artan)</option>
              <option value="minqty_desc">Min. Adet (Azalan)</option>
            </select>
            <div className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-700">
              <ArrowUpDown size={16} />
              <span>Sırala</span>
            </div>
          </div>

          {/* Mobil Filtre Butonu */}
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-700"
          >
            <Filter size={16} />
            <span>Filtrele {activeFilterCount > 0 && <span className="w-2 h-2 rounded-full bg-[#FF5733] ml-1"></span>}</span>
          </button>
        </div>
      </div>

      {/* MOBİL FİLTRE MENÜSÜ: Sağdan Kayarak Açılan Panel (Right Drawer) */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-[85vw] max-w-sm bg-white z-[70] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Panel Başlığı */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-gray-900">Filtrele</h2>
          <button onClick={() => setIsMobileOpen(false)} className="p-2 -mr-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        {/* Panel İçeriği (Kaydırılabilir) */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <FilterContent />
        </div>
        
        {/* Panel Alt Butonları */}
        <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <button 
            onClick={onClearAll} 
            className="py-3.5 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
           >
            Temizle
           </button>
           <button 
            onClick={() => setIsMobileOpen(false)} 
            className="py-3.5 font-semibold text-white bg-[#FF5733] hover:bg-[#e64a2e] rounded-xl shadow-lg shadow-[#FF5733]/30 transition-colors"
           >
            Uygula
           </button>
        </div>
      </div>
    </>
  );
}
