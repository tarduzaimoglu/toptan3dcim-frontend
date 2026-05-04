"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function HeroBanner({ banners }: { banners: any[] }) {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  if (!banners || banners.length === 0) return null;

  return (
    <div className="w-full relative group">
      <Swiper
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="w-full"
      >
        {banners.map((item) => {
          const attr = item.attributes || item; 
          
          // Masaüstü Görseli
          const desktopImg = attr.image?.data?.attributes?.url || attr.image?.url;
          // Mobil Görseli (Yeni eklediğimiz alan)
          const mobileImg = attr.mobileImage?.data?.attributes?.url || attr.mobileImage?.url;
          
          const link = attr.link;

          if (!desktopImg) return null;

          const fullDesktopUrl = desktopImg.startsWith("http") ? desktopImg : `${STRAPI_URL}${desktopImg}`;
          const fullMobileUrl = mobileImg 
            ? (mobileImg.startsWith("http") ? mobileImg : `${STRAPI_URL}${mobileImg}`)
            : fullDesktopUrl; // Mobil görsel yoksa masaüstü görselini kullan

          return (
            <SwiperSlide key={item.id}>
              <div className="w-full relative">
                {link ? (
                  <Link href={link.startsWith('http') ? link : `https://${link}`}>
                    <picture>
                      {/* Ekran 768px'den küçükse mobil görseli göster */}
                      <source media="(max-width: 768px)" srcSet={fullMobileUrl} />
                      {/* Daha büyük ekranlarda masaüstü görselini göster */}
                      <img 
                        src={fullDesktopUrl} 
                        alt={attr.title || "Banner"}
                        className="w-full h-auto block object-contain"
                      />
                    </picture>
                  </Link>
                ) : (
                  <picture>
                    <source media="(max-width: 768px)" srcSet={fullMobileUrl} />
                    <img 
                      src={fullDesktopUrl} 
                      alt="Banner" 
                      className="w-full h-auto block object-contain"
                    />
                  </picture>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <style jsx global>{`
        .swiper-button-next, .swiper-button-prev {
          color: white !important;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .group:hover .swiper-button-next, .group:hover .swiper-button-prev {
          opacity: 1;
        }
        @media (max-width: 768px) {
          .swiper-button-next, .swiper-button-prev { display: none !important; }
        }
      `}</style>
    </div>
  );
}