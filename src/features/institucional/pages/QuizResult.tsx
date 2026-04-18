import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CategoryEnum } from '../types/quiz';
import { categoryMetadata } from '../data/questions';

import apostoloIcon from '../../../assets/images/icons/apostolo.png';
import profetaIcon from '../../../assets/images/icons/profeta.png';
import evangelistaIcon from '../../../assets/images/icons/evangelista.png';
import pastorIcon from '../../../assets/images/icons/pastor.png';
import mestreIcon from '../../../assets/images/icons/mestre.png';

import './Quiz.css';

const DOM_COLORS: Record<CategoryEnum, string> = {
  [CategoryEnum.APOSTOLO]:    '#1b6ea5',
  [CategoryEnum.PROFETA]:     '#a80d0d',
  [CategoryEnum.EVANGELISTA]: '#cfb012',
  [CategoryEnum.PASTOR]:      '#9B59B6',
  [CategoryEnum.MESTRE]:      '#2f994a',
};

const DOM_PHRASES: Record<CategoryEnum, string> = {
  [CategoryEnum.APOSTOLO]:    'Você tem visão estratégica e paixão por abrir novos caminhos.',
  [CategoryEnum.PROFETA]:     'Você é sensível à voz de Deus e movido por autenticidade espiritual.',
  [CategoryEnum.EVANGELISTA]: 'Você é movido pelo desejo de alcançar e transformar vidas.',
  [CategoryEnum.PASTOR]:      'Você tem coração para cuidar e caminhar ao lado das pessoas.',
  [CategoryEnum.MESTRE]:      'Você tem paixão pelo ensino da Palavra e pela formação de discípulos.',
};

const DOM_NAMES: Record<CategoryEnum, string> = {
  [CategoryEnum.APOSTOLO]:    'Apóstolo',
  [CategoryEnum.PROFETA]:     'Profeta',
  [CategoryEnum.EVANGELISTA]: 'Evangelista',
  [CategoryEnum.PASTOR]:      'Pastor',
  [CategoryEnum.MESTRE]:      'Mestre',
};

const RADAR_ANGLES: Record<CategoryEnum, number> = {
  [CategoryEnum.APOSTOLO]:    -90,
  [CategoryEnum.PROFETA]:     -18,
  [CategoryEnum.EVANGELISTA]:  54,
  [CategoryEnum.PASTOR]:      126,
  [CategoryEnum.MESTRE]:      198,
};

const categoryIcons: Record<CategoryEnum, string> = {
  [CategoryEnum.APOSTOLO]:    apostoloIcon,
  [CategoryEnum.PROFETA]:     profetaIcon,
  [CategoryEnum.EVANGELISTA]: evangelistaIcon,
  [CategoryEnum.PASTOR]:      pastorIcon,
  [CategoryEnum.MESTRE]:      mestreIcon,
};

function toRad(deg: number) { return (deg * Math.PI) / 180; }
function radarPt(cx: number, cy: number, r: number, angleDeg: number) {
  return { x: cx + r * Math.cos(toRad(angleDeg)), y: cy + r * Math.sin(toRad(angleDeg)) };
}

const RadarChart = ({ scores }: { scores: Record<CategoryEnum, number> }) => {
  const cx = 140, cy = 140, maxR = 110;
  const cats = Object.values(CategoryEnum);
  const points = cats.map((c) => {
    const r = ((scores[c] ?? 0) / 100) * maxR;
    return radarPt(cx, cy, r, RADAR_ANGLES[c]);
  });
  const polygon = points.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <svg viewBox="0 0 280 280" className="radar-chart" aria-hidden="true">
      {[25, 50, 75, 100].map((lvl) => {
        const pts = cats.map((c) => radarPt(cx, cy, (lvl / 100) * maxR, RADAR_ANGLES[c]));
        return <polygon key={lvl} points={pts.map((p) => `${p.x},${p.y}`).join(' ')} className="radar-grid" />;
      })}
      {cats.map((c) => {
        const outer = radarPt(cx, cy, maxR, RADAR_ANGLES[c]);
        return <line key={c} x1={cx} y1={cy} x2={outer.x} y2={outer.y} className="radar-axis" />;
      })}
      <polygon points={polygon} className="radar-score" />
      {cats.map((c, i) => (
        <circle key={c} cx={points[i].x} cy={points[i].y} r={4} fill={DOM_COLORS[c]} stroke="#fff" strokeWidth={1.5} />
      ))}
      {cats.map((c) => {
        const lp = radarPt(cx, cy, maxR + 22, RADAR_ANGLES[c]);
        return (
          <text key={c} x={lp.x} y={lp.y} className="radar-label" textAnchor="middle" dominantBaseline="middle">
            {c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()}
          </text>
        );
      })}
    </svg>
  );
};

interface ResultData {
  id: string;
  name: string;
  scores: Record<string, number>;
  topDom: string | null;
  ties: string[];
  date: string;
  completionSeconds: number | null;
}

const QuizResult = () => {
  const { token } = useParams<{ token: string }>();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animatedScores, setAnimatedScores] = useState<Record<CategoryEnum, number>>({
    [CategoryEnum.APOSTOLO]: 0,
    [CategoryEnum.PROFETA]: 0,
    [CategoryEnum.EVANGELISTA]: 0,
    [CategoryEnum.PASTOR]: 0,
    [CategoryEnum.MESTRE]: 0,
  });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!token) { setError('Token inválido'); setLoading(false); return; }
    fetch(`/api/quiz-result-by-token?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setResult(data.result);
        else setError(data.error ?? 'Resultado não encontrado');
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!result) return;
    const targets: Record<CategoryEnum, number> = {} as Record<CategoryEnum, number>;
    Object.values(CategoryEnum).forEach((c) => {
      targets[c] = result.scores[c] ?? 0;
    });
    let start: number | null = null;
    const duration = 1200;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current: Record<CategoryEnum, number> = {} as Record<CategoryEnum, number>;
      Object.entries(targets).forEach(([k, v]) => {
        current[k as CategoryEnum] = Math.round(v * eased);
      });
      setAnimatedScores(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    const t = setTimeout(() => setRevealed(true), 1800);
    return () => clearTimeout(t);
  }, [result]);

  if (loading) {
    return (
      <section className="quiz-section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#cfd8dc', fontSize: '1.1rem' }}>Carregando resultado...</p>
      </section>
    );
  }

  if (error || !result) {
    return (
      <section className="quiz-section" style={{ minHeight: '60vh', textAlign: 'center', paddingTop: '6rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Resultado não encontrado</h2>
        <p style={{ color: '#cfd8dc', marginBottom: '2rem' }}>
          Este link pode ter expirado ou é inválido.
        </p>
        <Link to="/teste-dons" className="start-button" style={{ textDecoration: 'none', display: 'inline-block', padding: '0.9rem 2rem' }}>
          Fazer o Teste
        </Link>
      </section>
    );
  }

  const cats = Object.values(CategoryEnum);
  const sortedScores = cats
    .map((c) => {
      const meta = categoryMetadata.find((m) => m.id === c);
      return { cat: c, score: result.scores[c] ?? 0, meta };
    })
    .filter((e) => e.meta)
    .sort((a, b) => b.score - a.score);

  const topCat = (result.topDom as CategoryEnum) ?? sortedScores[0]?.cat;
  const radarScores: Record<CategoryEnum, number> = {} as Record<CategoryEnum, number>;
  sortedScores.forEach(({ cat, score }) => { radarScores[cat] = Math.round(score); });

  const dateStr = result.date
    ? new Date(result.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <section className="Teste-section" style={{ paddingTop: '5rem' }}>
      <div className="content-container">
        <div className="results-header">
          <h2>Resultado de {result.name}</h2>
          {dateStr && (
            <p style={{ color: '#7f98a6', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Realizado em {dateStr}
            </p>
          )}
          <p style={{ marginTop: '0.5rem' }}>Perfil ministerial dos 5 Dons.</p>
        </div>

        {/* Hero dom card */}
        {topCat && (
          <div className={`hero-dom-card ${topCat}`}>
            <div className="hero-icon-wrap">
              <img src={categoryIcons[topCat]} alt={DOM_NAMES[topCat]} className="hero-icon" />
            </div>
            <div className="hero-pct">{animatedScores[topCat] ?? 0}%</div>
            <div className="hero-name">{DOM_NAMES[topCat]}</div>
            <p className="hero-phrase">{DOM_PHRASES[topCat]}</p>
          </div>
        )}

        {/* Radar */}
        <div className={`radar-section${revealed ? ' reveal-full' : ''}`}>
          <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--text-light-slate)' }}>
            Perfil dos 5 Dons
          </h3>
          <RadarChart scores={radarScores} />
        </div>

        {/* Distribution bars */}
        <div className={`distribution-section${revealed ? ' reveal-full' : ''}`}>
          {sortedScores.map(({ cat }) => (
            <div className="dist-row" key={cat}>
              <div className="dist-label">
                <img src={categoryIcons[cat]} alt={DOM_NAMES[cat]} />
                {DOM_NAMES[cat]}
              </div>
              <div className="dist-bar-bg">
                <div className={`dist-bar-fill ${cat}`} style={{ width: `${animatedScores[cat] ?? 0}%` }}>
                  <span>{animatedScores[cat] ?? 0}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '3rem 1rem 4rem' }}>
        <p style={{ color: '#cfd8dc', marginBottom: '1.5rem', fontSize: '1rem' }}>
          Quer descobrir o seu Dom Ministerial?
        </p>
        <Link
          to="/teste-dons"
          className="start-button"
          style={{ textDecoration: 'none', display: 'inline-block', padding: '1rem 2.5rem' }}
        >
          Fazer o Teste Gratuitamente
        </Link>
      </div>
    </section>
  );
};

export default QuizResult;
