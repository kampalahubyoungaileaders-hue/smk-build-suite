import type { Database } from "@/integrations/supabase/types";

export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

/**
 * Rows from joined `select()` queries. Their shape depends on the select string,
 * so pages treat them loosely and read the columns they asked for.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

/** Minimal shapes the form dialogs need for their pickers. */
export type Option = { id: string; name: string };
export type Person = { user_id: string; full_name: string | null };
