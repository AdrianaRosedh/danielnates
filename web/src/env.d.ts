/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    locale: "es" | "en";
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly PUBLIC_SANITY_API_VERSION?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly SANITY_API_READ_TOKEN?: string;
  readonly SANITY_PREVIEW_SECRET?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
