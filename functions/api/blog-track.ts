// POST /api/blog-track
// Registra uma sessão de leitura de um post do blog (público, sem auth).
// Chamado via navigator.sendBeacon quando a pessoa sai da página.

import { createClient } from "@supabase/supabase-js";

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type Body = {
  postId?: string;
  sessionId?: string;
  durationSeconds?: number;
  maxScrollPct?: number;
  reachedEnd?: boolean;
  source?: string;
  deviceType?: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SOURCES = ["instagram", "google", "whatsapp", "facebook", "direct", "other"];
const DEVICES = ["mobile", "tablet", "desktop"];
const clampInt = (v: unknown, min: number, max: number): number | null => {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, n));
};

export const onRequestOptions = () => new Response(null, { status: 204, headers: CORS });

export const onRequestPost = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  try {
    const b = (await request.json()) as Body;
    if (!b.postId || !UUID_RE.test(b.postId)) {
      return new Response(JSON.stringify({ ok: false, error: "postId inválido" }), {
        status: 400,
        headers: { "content-type": "application/json", ...CORS },
      });
    }

    const row = {
      post_id: b.postId,
      session_id: typeof b.sessionId === "string" ? b.sessionId.slice(0, 64) : null,
      duration_seconds: clampInt(b.durationSeconds, 0, 86400),
      max_scroll_pct: clampInt(b.maxScrollPct, 0, 100),
      reached_end: Boolean(b.reachedEnd),
      source: SOURCES.includes(String(b.source)) ? b.source : "other",
      device_type: DEVICES.includes(String(b.deviceType)) ? b.deviceType : null,
    };

    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const { error } = await admin.from("blog_post_view").insert(row);
    if (error) {
      console.error("blog-track insert error:", error.message);
      return new Response(JSON.stringify({ ok: false }), {
        status: 500,
        headers: { "content-type": "application/json", ...CORS },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json", ...CORS },
    });
  } catch (e) {
    console.error("blog-track error:", e);
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { "content-type": "application/json", ...CORS },
    });
  }
};
