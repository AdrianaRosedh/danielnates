/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    locale: "es" | "en";
    user?: import("@supabase/supabase-js").User;
    /** Admin scope: 'all' for full admin, or a project slug for
     *  scoped access. Only set on /admin/* routes for logged-in users. */
    adminScope?: string;
    /** Admin chrome language ('es' | 'en'). Independent of the public
     *  site locale. Persisted via the dn_admin_lang cookie. */
    adminLang?: "es" | "en";
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
