import type { Metadata } from 'next';
import FigurineRequestForm from '@/components/figurine/FigurineRequestForm';

export const metadata: Metadata = {
  title: 'Kişiye Özel Figür | Toptan 3D ÇıM',
  description: 'Kişiye özel figür talebinizi ve referans fotoğraflarınızı güvenli şekilde iletin.',
};

export default function FigurinePage() {
  return <main><FigurineRequestForm /></main>;
}
