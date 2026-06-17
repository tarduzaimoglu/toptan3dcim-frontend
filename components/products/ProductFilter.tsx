// components/products/ProductFilter.tsx
'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

export default function ProductFilter() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Örnek Filtre Kategorileri (Bunları API'den de çekebilirsin)
  const categories = ['Filamentler', 'Reçineler', 'Yedek Parçalar', 'Aksesuarlar'];
  const materials = ['PLA', 'ABS', 'PETG', 'TPU'];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Kategori Filtresi */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex justify-between items-center">
          Kategoriler <ChevronDown size={16} />
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-[#FF5733] rounded border-gray-300 focus:ring-[#FF5733]" />
              <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Malzeme Filtresi */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex justify-between items-center">
          Malzeme <ChevronDown size={16} />
        </h3>
        <div className="space-y-2">
          {materials.map((mat) => (
            <label key={mat} className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-[#FF5733] rounded border-gray-300 focus:ring-[#FF5733]" />
              <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{mat}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Fiyat Filtresi */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Fiyat Aralığı</h3>
        <div className="flex items-center space-x-2">
          <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5733] focus:border-transparent outline-none text-sm" />
          <span className="text-gray-500">-</span>
          <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5733] focus:border-transparent outline-none text-sm" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MASAÜSTÜ GÖRÜNÜM: Sol tarafta sabit (Sticky) */}
      <div className="hidden lg:block w-1/4 pr-8 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Filtreler</h2>
          <button className="text-sm text-[#FF5733] hover:underline font-medium">Temizle</button>
        </div>
        <FilterContent />
      </div>

      {/* MOBİL GÖRÜNÜM: Ekranın altında sabit Filtre Butonu */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="bg-[#333333] text-white px-6 py-3 rounded-full font-medium shadow-lg flex items-center space-x-2 hover:bg-black transition-transform active:scale-95"
        >
          <Filter size={18} />
          <span>Filtrele ve Sırala</span>
        </button>
      </div>

      {/* MOBİL GÖRÜNÜM: Aşağıdan açılan menü (Bottom Sheet) */}
      {/* Arka Plan Karartması */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Menü Paneli */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl transform transition-transform duration-300 ease-in-out lg:hidden max-h-[85vh] overflow-y-auto shadow-2xl ${
          isMobileOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Filtreler</h2>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 active:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <FilterContent />
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 flex gap-3">
          <button className="w-1/3 py-3 font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 active:bg-gray-300">
            Temizle
          </button>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="w-2/3 py-3 font-semibold text-white bg-[#FF5733] rounded-xl hover:bg-[#e04c2c] active:bg-[#cc4527] shadow-md"
          >
            Sonuçları Göster
          </button>
        </div>
      </div>
    </>
  );
}
