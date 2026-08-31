export const UPLOAD_ERRORS: Record<string, { title: string; message: string }> = {
  FILE_TOO_LARGE: {
    title: "Dosya boyutu çok büyük",
    message: "Dosya 50 MB sınırını aşıyor. Daha küçük bir STL dosyası deneyin.",
  },
  UNSUPPORTED_FORMAT: {
    title: "Desteklenmeyen dosya formatı",
    message: "Yalnızca .STL uzantılı dosyalar desteklenir.",
  },
  STL_UNREADABLE: {
    title: "Dosya okunamadı",
    message: "STL dosyası bozuk veya okunamıyor olabilir. Farklı bir dosya deneyin.",
  },
  TOO_COMPLEX: {
    title: "Model işlenemedi",
    message: "Model otomatik hesaplama için fazla karmaşık. WhatsApp üzerinden manuel inceleme isteyebilirsiniz.",
  },
  UNKNOWN: {
    title: "Bir hata oluştu",
    message: "Dosya işlenirken beklenmeyen bir hata oluştu.",
  },
};
