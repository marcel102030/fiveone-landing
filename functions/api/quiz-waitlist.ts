import { createClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRODUCTS = new Set(["curso", "livro"]);

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...CORS },
  });
}

export const onRequestOptions = async () => new Response(null, { status: 204, headers: CORS });

export const onRequestPost = async (ctx: {
  request: Request;
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string };
}) => {
  try {
    const ct = ctx.request.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return json({ error: "content-type inválido" }, 400);

    const body = (await ctx.request.json().catch(() => null)) as {
      email?: string;
      product?: string;
      name?: string;
    } | null;

    const email = String(body?.email || "").trim().toLowerCase();
    const product = String(body?.product || "").trim();
    const name = body?.name ? String(body.name).slice(0, 120) : null;

    if (!EMAIL_RE.test(email)) return json({ error: "e-mail inválido" }, 400);
    if (!PRODUCTS.has(product)) return json({ error: "produto inválido" }, 400);

    const admin = createClient(ctx.env.SUPABASE_URL, ctx.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // idempotente por (email, product)
    const { error } = await admin
      .from("quiz_waitlist")
      .upsert({ email, product, name, source: "quiz" }, { onConflict: "email,product", ignoreDuplicates: true });

    if (error) {
      console.error("quiz-waitlist insert error:", error.message);
      return json({ error: "Erro ao registrar." }, 500);
    }
    return json({ ok: true }, 200);
  } catch {
    return json({ error: "Erro interno." }, 500);
  }
};
