/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend server origini, masalan https://api.idu.universal-uz.uz (oxirida /api yozilmaydi).
   *  Bo'sh bo'lsa nisbiy `/api` ishlatiladi — dev rejimida Vite proxy orqali ketadi. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
