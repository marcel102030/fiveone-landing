// Auto-recuperação de "ChunkLoadError" após deploy.
//
// Quando um chunk lazy (rota/código com import dinâmico) falha ao carregar —
// típico quando o usuário está com a aba aberta durante um novo deploy e os
// arquivos com hash antigo deixam de existir, ou quando o service worker
// cacheou um estado inconsistente — a gente NÃO mostra a tela de erro: limpa
// SW + caches e recarrega a página uma vez, buscando a versão nova e
// consistente. Uma trava de tempo evita loop infinito de reload.

const GUARD_KEY = "fiveone_chunk_recovery_at";
const LOOP_WINDOW_MS = 15000; // no máx. 1 recuperação a cada 15s

export function isChunkLoadError(error: unknown): boolean {
  const msg =
    (error as { message?: string } | null)?.message || String(error ?? "");
  return /loading chunk|dynamically imported module|failed to fetch dynamically|importing a module script failed|ChunkLoadError|error loading dynamically/i.test(
    msg,
  );
}

export async function recoverFromChunkError(): Promise<boolean> {
  try {
    const last = Number(sessionStorage.getItem(GUARD_KEY) || 0);
    // Já tentou recuperar há pouco e ainda falhou → não recarrega de novo
    // (deixa o ErrorBoundary mostrar a tela, evitando loop).
    if (Date.now() - last < LOOP_WINDOW_MS) return false;
    sessionStorage.setItem(GUARD_KEY, String(Date.now()));
  } catch {
    /* sessionStorage indisponível — segue para o reload mesmo assim */
  }

  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {
    /* ignore */
  }
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* ignore */
  }

  window.location.reload();
  return true;
}
