/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POLOTNO_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
