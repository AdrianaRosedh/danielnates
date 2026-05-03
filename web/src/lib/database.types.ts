/**
 * Hand-written for now. Once your Supabase project exists, regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      contact_messages: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          message: string;
          locale: "es" | "en" | null;
          source: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          message: string;
          locale?: "es" | "en" | null;
          source?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]>;
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          locale: "es" | "en" | null;
          confirmed: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email: string;
          locale?: "es" | "en" | null;
          confirmed?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
