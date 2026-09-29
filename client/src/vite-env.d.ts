/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend server origini, masalan https://api.idu.universal-uz.uz (oxirida /api yozilmaydi).
   *  Bo'sh bo'lsa nisbiy `/api` ishlatiladi — dev rejimida Vite proxy orqali ketadi. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Monaco'ning ichki Monarch til ta'riflari (tip fayllari yo'q)
declare module 'monaco-editor/languages/definitions/html/html' {
  import type { languages } from 'monaco-editor';
  export const language: languages.IMonarchLanguage & { tokenizer: Record<string, languages.IMonarchLanguageRule[]> };
  export const conf: languages.LanguageConfiguration;
}
declare module 'monaco-editor/languages/definitions/css/css' {
  import type { languages } from 'monaco-editor';
  export const language: languages.IMonarchLanguage & { tokenizer: Record<string, languages.IMonarchLanguageRule[]> };
  export const conf: languages.LanguageConfiguration;
}
