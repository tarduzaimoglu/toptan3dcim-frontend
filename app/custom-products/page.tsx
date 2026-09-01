import type { Metadata } from "next";
import CustomProductsClient from "@/components/custom-products/CustomProductsClient";
import { getCustomProductTypes } from "@/lib/strapi";

export const metadata: Metadata = {
  title: "Firmanıza Özel 3D Baskı Ürünler | Toptan3Dcim",
  description: "Logonuzu yükleyin, kurumsal ürün türlerini seçin ve firmanıza özel 3D baskı üretim teklifi isteyin.",
  alternates: { canonical: "/custom-products" },
  openGraph: {
    title: "Firmanıza Özel 3D Baskı Ürünler | Toptan3Dcim",
    description: "Markanıza özel anahtarlık, bardak altlığı, organizer ve daha fazlası için teklif oluşturun.",
    url: "https://toptan3dcim.com/custom-products",
    type: "website",
  },
};

export default async function CustomProductsPage() {
  const productTypes = await getCustomProductTypes();
  return <CustomProductsClient productTypes={productTypes} />;
}
