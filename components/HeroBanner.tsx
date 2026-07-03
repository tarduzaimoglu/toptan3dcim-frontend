"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

function getMediaUrl(media: any): string | null {
  if (!media) return null;

  // Strapi v4 single media: image.data.attributes.url
  if (media.data && !Array.isArray(media.data)) {
    return media.data?.attributes?.url || media.data?.url || null;
  }

  // Strapi v4 multiple media: image.data[0].attributes.url
  if (media.data && Array.isArray(media.data)) {
    return media.data[0]?.attributes?.url || media.data[0]?.url || null;
  }

  // Strapi v5 / flat media: image.url
  if (media.url) {
    return media.url;
  }

  // Olası array media: image[0].url
  if (Array.isArray(media)) {
    return media[0]?.url || media[0]?.attributes?.url || null;
  }

  // Bazı yapılarda attributes içinde gelebilir
  if (media.attributes?.url) {
    return media.attributes.url;
  }

  return null;
}

function makeFullUrl(url: string, baseUrl: string): string {
  if (url.startsWith("http")) return url;
  return `${baseUrl}${url}`;
}

function normalizeLink(link?: string): string {
  if (!link) return "#";

  if (link.startsWith("http")) return link;

  if (link.startsWith("/")) return link;

  return `https://${link}`;
}

export default function HeroBanner({ banners }: { banners: any[] }) {
  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  if (!banners || banners.length === 0) return null;

  const validBanners = banners
    .map((item) => {
      const attr = item.attributes || item;

      const desktopImg = getMediaUrl(attr.image);
      const mobileImg = getMediaUrl(attr.mobileImage);
      const link = attr.link;

      if (!desktopImg) return null;

      const fullDesktopUrl = makeFullUrl(desktopImg, STRAPI_URL);
      const fullMobileUrl = mobileImg
        ? makeFullUrl(mobileImg, STRAPI_URL)
        : fullDesktopUrl;

      return {
        id: item.id,
        title: attr.title || "Banner",
        link,
        fullDesktopUrl,
        fullMobileUrl,
      };
    })
    .filter(Boolean) as {
    id: number | string;
    title: string;
    link?: string;
    fullDesktopUrl: string;
    fullMobileUrl: string;
  }[];

  if (validBanners.length === 0) return null;

  return (
    <div className="w-full relative group">
      <Swiper
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="w-full"
      >
        {validBanners.map((banner) => {
          const imageElement = (
            <picture>
              <source media="(max-width: 768px)" srcSet={banner.fullMobileUrl} />
              <img
                src={banner.fullDesktopUrl}
                alt={banner.title}
                className="w-full h-auto block object-contain"
              />
            </picture>
          );

          return (
            <SwiperSlide key={banner.id}>
              <div className="w-full relative">
                {banner.link ? (
                  <Link href={normalizeLink(banner.link)}>
                    {imageElement}
                  </Link>
                ) : (
                  imageElement
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .group:hover .swiper-button-next,
        .group:hover .swiper-button-prev {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
