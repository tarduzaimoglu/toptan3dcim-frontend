export const MAX_LOGO_FILE_MB = 6;
export const MAX_LOGO_FILE_BYTES = MAX_LOGO_FILE_MB * 1024 * 1024;

export const ALLOWED_LOGO_FILES = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "application/pdf": [".pdf"],
} as const;

export type CustomProductType = {
  id: string;
  title: string;
  image: string;
};

export function validateLogoFile(file: File) {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const allowedExtensions = ALLOWED_LOGO_FILES[file.type as keyof typeof ALLOWED_LOGO_FILES];
  if (!(allowedExtensions as readonly string[] | undefined)?.includes(extension)) return "Yalnızca PNG, JPG veya PDF dosyası yükleyebilirsiniz.";
  if (file.size > MAX_LOGO_FILE_BYTES) return `Dosya ${MAX_LOGO_FILE_MB} MB sınırını aşıyor.`;
  return null;
}
