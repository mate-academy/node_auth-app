interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  [key: string]: string;
}

// eslint-disable-next-line no-shadow
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
