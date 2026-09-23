import { useEffect, useMemo, useState } from 'react';
import { listRedeHouseChurches, type RedeHouseChurch } from '../services/redeIgrejas';
import { CASAS_FALLBACK } from './redeData';

export type CasaResumo = {
  nome: string;
  local: string;
  encontro?: string;
  presbitero?: string;
  linkMaps?: string;
};

/** "19:00:00" → "19h"; "19:30" → "19h30". Outros formatos passam como estão. */
function formatHora(hora: string | null): string | null {
  const m = hora?.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hora;
  return m[2] === '00' ? `${Number(m[1])}h` : `${Number(m[1])}h${m[2]}`;
}

/** Casas ativas do Supabase; sem conexão (ou vazio), usa a lista de reserva. */
export function useRedeCasas() {
  const [live, setLive] = useState<RedeHouseChurch[] | null>(null);

  useEffect(() => {
    let active = true;
    listRedeHouseChurches()
      .then((data) => {
        if (active) setLive(data.filter((h) => !h.status || h.status === 'ativa'));
      })
      .catch(() => {
        // Sem conexão: fica a lista de reserva.
      });
    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => {
    if (live && live.length > 0) {
      const casas: CasaResumo[] = live.map((h) => ({
        nome: h.name,
        local: [h.neighborhood, h.city].filter(Boolean).join(' · ') || 'Campina Grande',
        encontro: [h.meeting_day, formatHora(h.meeting_time)].filter(Boolean).join(' · ') || undefined,
      }));
      return { casas, cidades: new Set(live.map((h) => h.city || '')).size };
    }
    const casas: CasaResumo[] = CASAS_FALLBACK.map((c) => ({
      nome: c.nome,
      local: `${c.bairro} · ${c.cidade}`,
      encontro: c.encontros,
      presbitero: c.lider,
      linkMaps: c.linkMaps,
    }));
    return { casas, cidades: 1 };
  }, [live]);
}
