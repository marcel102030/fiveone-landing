import type { RedePageSlug } from './redeLinks';
import RedeAgenda from './pages/RedeAgenda';
import RedeCasas from './pages/RedeCasas';
import RedeConfissao from './pages/RedeConfissao';
import RedeContato from './pages/RedeContato';
import RedeEstrutura from './pages/RedeEstrutura';
import RedeHistoria from './pages/RedeHistoria';
import RedeQuemSomos from './pages/RedeQuemSomos';
import RedeRecursos from './pages/RedeRecursos';
import RedeValores from './pages/RedeValores';

const PAGES: Record<RedePageSlug, () => JSX.Element> = {
  'quem-somos': RedeQuemSomos,
  historia: RedeHistoria,
  valores: RedeValores,
  estrutura: RedeEstrutura,
  confissao: RedeConfissao,
  casas: RedeCasas,
  agenda: RedeAgenda,
  recursos: RedeRecursos,
  contato: RedeContato,
};

/** Página interna do site da rede pelo slug da rota. */
export default function RedeSitePage({ slug }: { slug: RedePageSlug }) {
  const Page = PAGES[slug];
  return <Page />;
}
