"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectCoverflow } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

const SITE_MORU = "#7C3AED"; 

function resolveThumbSrc(product: any) {
  const target = product.attributes || product;
  const raw = (typeof target?.imageUrl === "string" && target.imageUrl.trim() && target.imageUrl) ||
              (typeof target?.image === "string" && target.image.trim() && target.image);

  return raw || "/products/placeholder.png";
}

export default function ProductCarousel({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="w-full relative overflow-visible">
      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        loop={true} 
        speed={1000}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
          slideShadows: false,
        }}
        modules={[Autoplay, Pagination, EffectCoverflow]}
        className="w-full !overflow-visible product-slider" 
        breakpoints={{
          0: { slidesPerView: 2 }, 
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
      >
        {products.map((item) => {
          const attr = item.attributes || item;
          const imgSrc = resolveThumbSrc(item);
          const price = attr.wholesalePrice || attr.WholesalePrice || attr.price || attr.Price || "0";

          return (
            <SwiperSlide key={item.id} className="!overflow-visible py-10">
              {/* EKLENDİ: Ürüne tıklayınca /products sayfasına open parametresiyle gider */}
              <Link href={`/products?open=${item.id}`} className="block h-full">
                <div className="relative group bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col overflow-hidden">
                  
                  {/* MODERN KART TASARIMI */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
                    <Image
                      src={imgSrc}
                      alt={attr.title || attr.Title || "Ürün"}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  
                  <div className="p-4 text-center border-t border-slate-50 bg-slate-50/50">
                    <h3 className="text-xs md:text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                      {attr.title || attr.Title}
                    </h3>
                    <div className="flex items-center justify-center gap-1 font-black text-sm">
                      <span style={{ color: SITE_MORU }}>{price} TL</span>
                      <span className="text-slate-400 font-normal">/ Adet</span>
                    </div>
                  </div>

                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <style jsx global>{`
        .product-slider.swiper { 
          overflow: visible !important; 
          padding-top: 50px;
          padding-bottom: 50px;
        }
        .product-slider .swiper-slide {
          opacity: 0.3;
          transform: scale(0.8);
          transition: all 0.6s cubic-bezier(0.2, 0, 0, 1);
          z-index: 1;
        }
        .product-slider .swiper-slide-active {
          opacity: 1;
          transform: scale(1.05);
          z-index: 50;
        }
      `}</style>
    </div>
  );
}
