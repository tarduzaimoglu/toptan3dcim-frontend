import type { Metadata } from "next";
import TeklifAlClient from "@/components/quote/TeklifAlClient";

export const metadata: Metadata = {
  title: "3D Baskı Teklifi Al | Toptan3Dcim",
  description: "STL modelinizi yükleyin, 3D baskı seçeneklerini belirleyin ve tahmini üretim fiyatınızı görün.",
  alternates: { canonical: "/teklif-al" },
  openGraph: {
    title: "3D Baskı Teklifi Al | Toptan3Dcim",
    description: "STL modeliniz için malzeme, renk, doluluk ve adet seçenekleriyle tahmini 3D baskı fiyatı oluşturun.",
    url: "https://toptan3dcim.com/teklif-al",
    type: "website",
  },
};

export default function TeklifAlPage() {
  return <TeklifAlClient />;
}
