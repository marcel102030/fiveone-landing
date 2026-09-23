// Fotos otimizadas do site da rede (WebP). Para trocar ou incluir uma foto,
// gere as versões -1600.webp e -1000.webp em assets/otimizadas/ (e as da capa
// em assets/otimizadas/capa/, com 1920px).
const arquivos = import.meta.glob<{ default: string }>('../assets/otimizadas/*.webp', { eager: true });
const capa = import.meta.glob<{ default: string }>('../assets/otimizadas/capa/*.webp', { eager: true });

export type Foto = { lg: string; sm: string };

export function foto(nome: string): Foto {
  const url = (w: number) => {
    const mod = arquivos[`../assets/otimizadas/${nome}-${w}.webp`];
    if (!mod) throw new Error(`Foto otimizada não encontrada: ${nome}-${w}.webp`);
    return mod.default;
  };
  return { lg: url(1600), sm: url(1000) };
}

/** Fotos do carrossel da capa, na ordem dos nomes dos arquivos. */
export function fotoCapa(): string[] {
  return Object.keys(capa)
    .sort()
    .map((k) => capa[k].default);
}
