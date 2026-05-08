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
          0: { slidesPerView: 2 }, // Mobilde daha iyi görünmesi için 2'ye düşürebiliriz
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
              <Link href={`/products?open=${item.id}`}>
                <div className="relative group rounded-2xl bg-white border border-slate-100 shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col">
                  {/* YENİ: aspect-[3/4] ile dik formata uyum */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-2xl bg-slate-50">
                    <Image
                      src={imgSrc}
                      alt={attr.title || attr.Title || "Ürün"}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-contain p-2 mix-blend-multiply"
                    />
                  </div>
                  <div className="p-3 text-center flex-grow flex flex-col justify-center">
                    <h3 className="text-[11px] md:text-sm font-semibold text-slate-800 line-clamp-1">
                      {attr.title || attr.Title}
                    </h3>
                    <div className="mt-1 flex items-center justify-center gap-1 text-[11px] md:text-sm font-bold">
                      <span style={{ color: SITE_MORU }}>{price} TL</span>
                      <span className="text-black font-medium">/ Adet</span>
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
          opacity: 0.15;
          filter: blur(8px);
          transform: scale(0.65);
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }
        .product-slider .swiper-slide-next,
        .product-slider .swiper-slide-prev {
          opacity: 0.5 !important;
          filter: blur(3px) !important;
          transform: scale(0.85) !important;
          z-index: 20;
        }
        .product-slider .swiper-slide-active {
          opacity: 1 !important;
          filter: blur(0) !important;
          transform: scale(1.1) !important;
          z-index: 50;
        }
      `}</style>
    </div>
  );
}