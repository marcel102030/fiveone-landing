import { supabase } from "../../../shared/lib/supabaseClient";

export type Product = {
  id: string;
  title: string;
  description: string | null;
  ministry_id: string | null;
  price_cents: number;
  currency: string;
  hotmart_product_id: string | null;
  hotmart_offer_codes: string[];
  checkout_url: string | null;
  cover_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Purchase = {
  id: string;
  user_email: string;
  product_id: string | null;
  status: "pending" | "approved" | "refunded" | "chargeback" | "expired" | "canceled";
  hotmart_transaction: string | null;
  hotmart_event: string | null;
  payment_method: string | null;
  amount_cents: number | null;
  buyer_name: string | null;
  buyer_phone: string | null;
  approved_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("platform_product")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Product[];
}

export async function updateProduct(
  id: string,
  patch: Partial<Omit<Product, "id" | "created_at" | "updated_at">>,
): Promise<void> {
  const { error } = await supabase.from("platform_product").update(patch).eq("id", id);
  if (error) throw error;
}

export async function createProduct(p: Omit<Product, "created_at" | "updated_at">): Promise<void> {
  const { error } = await supabase.from("platform_product").insert(p);
  if (error) throw error;
}

export async function listPurchases(limit = 100): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from("platform_purchase")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as Purchase[];
}

export function formatPriceBRL(cents: number, currency = "BRL"): string {
  const value = cents / 100;
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}
