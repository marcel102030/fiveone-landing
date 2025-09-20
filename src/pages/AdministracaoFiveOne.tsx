import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { clearAdminAuthenticated, getAdminEmail } from "../utils/adminAuth";
import { useNavigate } from "react-router-dom";
import "./AdministracaoFiveOne.css";

export default function AdministracaoFiveOne() {
  document.title = "Administração | Five One";
  const navigate = useNavigate();

  const name = useMemo(() => {
    const email = getAdminEmail() || "Member";
    const first = email.split("@")[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }, []);

  // Mock data
  const totalAlunos = 42;
  const loginsSerie = [2, 5, 3, 7, 6, 9, 8, 12, 10]; // fictício
  const alunosEngajados = [
    { nome: "Ana Lima", horas: 14 },
    { nome: "Carlos Souza", horas: 12 },
    { nome: "Marcos Silva", horas: 11 },
  ];
  const cursosPopulares = [
    { nome: "Fundamentos do Mestre", alunos: 120 },
    { nome: "Apologética Essencial", alunos: 96 },
    { nome: "Evangelismo no Dia a Dia", alunos: 81 },
  ];
  const aulasCurtidas = [
    { titulo: "O Mestre e a Palavra Viva", likes: 58 },
    { titulo: "Discernindo a Voz Profética", likes: 44 },
    { titulo: "Cuidado Pastoral na Prática", likes: 39 },
  ];
  const aulasMenosCurtidas = [
    { titulo: "Introdução à Ética Cristã", likes: 9 },
    { titulo: "História da Igreja — Visão Geral", likes: 6 },
    { titulo: "Organizando seu Estudo", likes: 4 },
  ];
  const [tab, setTab] = useState<"mais" | "menos">("mais");

  const navCards = [
    { to: "/admin/alunos", title: "Alunos", desc: "Gerencie perfis e matrículas." },
    { to: "/admin/conteudo", title: "Conteúdo Plataforma", desc: "Formações, módulos e aulas." },
    { to: "/admin/igrejas", title: "Painel de Igrejas — Quiz", desc: "Cadastro e relatórios." },
    { to: "/admin/relatorio-quiz", title: "Relatório Quiz", desc: "Consolidados e exportações." },
    { to: "/admin/blog", title: "Blog Site", desc: "Postagens e categorias." },
  ];

  return (
    <div className="adm5-wrap">
      <div className="adm5-topbar">
        <div>
          <h1 className="adm5-title">Olá, {name}!</h1>
          <p className="adm5-sub">Configure ou acesse os dados da sua plataforma por aqui.</p>
        </div>
        <div className="adm5-actions">
          <span className="adm5-pill" style={{cursor:'default'}}>{getAdminEmail() || 'admin'}</span>
          <button className="adm5-pill" onClick={()=>{ clearAdminAuthenticated(); navigate('/admin', { replace:true }); }}>Sair</button>
        </div>
      </div>

      <div className="adm5-hero">
        <img className="adm5-hero-img" src="/assets/images/banner-login-fiveone.png" alt="Destaques Five One" />
      </div>

      <div className="adm5-grid">
        {navCards.map((c, i) => (
          <Link key={c.to} to={c.to} className="adm5-card">
            <div className="adm5-card-icon" aria-hidden>
              {i === 0 && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
              {i === 1 && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              )}
              {i === 2 && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="M5 12a7 7 0 0 1 14 0"/><path d="M12 12v8"/><path d="M8 20h8"/></svg>
              )}
              {i === 3 && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v4H3z"/><path d="M3 13h18v8H3z"/><path d="M7 13v8"/></svg>
              )}
              {i === 4 && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5V6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v13.5l-6.5-3.25L4 19.5z"/></svg>
              )}
            </div>
            <div className="adm5-card-title">{c.title}</div>
            <div className="adm5-card-desc">{c.desc}</div>
          </Link>
        ))}
      </div>

      <div className="adm5-stats-row">
        <div className="adm5-panel">
          <h3>Número de alunos</h3>
          <div className="adm5-big-number">{totalAlunos}</div>
          <div className="muted">Total de alunos na plataforma</div>
        </div>
        <div className="adm5-panel adm5-chart">
          <h3>Logins na plataforma</h3>
          <div className="adm5-chart-canvas">
            <div className="adm5-chart-line" />
            <div className="adm5-chart-series">
              {loginsSerie.map((v, i) => {
                const x = (i / (loginsSerie.length - 1)) * 100;
                const y = 100 - Math.min(100, v * 8); // escala fictícia
                return <div key={i} className="adm5-dot" style={{ left: `${x}%`, bottom: `${y}%` }} />;
              })}
            </div>
          </div>
          <div className="adm5-legend"><span className="adm5-leg">Logins/dia</span></div>
        </div>
      </div>

      <section className="adm5-section">
        <h3>Alunos mais engajados</h3>
        <div className="adm5-list">
          {alunosEngajados.map((a, i) => (
            <div key={i} className="adm5-list-item">
              <strong>{i + 1}. {a.nome}</strong>
              <span className="meta">{a.horas} h assistidas na última semana</span>
            </div>
          ))}
        </div>
      </section>

      <section className="adm5-section">
        <h3>Cursos mais populares</h3>
        <div className="adm5-list">
          {cursosPopulares.map((c, i) => (
            <div key={i} className="adm5-list-item">
              <strong>{i + 1}. {c.nome}</strong>
              <span className="meta">{c.alunos} alunos inscritos</span>
            </div>
          ))}
        </div>
      </section>

      <section className="adm5-section">
        <div className="adm5-tabs">
          <button className={`adm5-tab ${tab === 'mais' ? 'active' : ''}`} onClick={() => setTab('mais')}>Aulas mais curtidas</button>
          <button className={`adm5-tab ${tab === 'menos' ? 'active' : ''}`} onClick={() => setTab('menos')}>Aulas menos curtidas</button>
        </div>
        <div className="adm5-list">
          {(tab === 'mais' ? aulasCurtidas : aulasMenosCurtidas).map((a, i) => (
            <div key={i} className="adm5-list-item">
              <strong>{i + 1}. {a.titulo}</strong>
              <span className="meta">{a.likes} curtidas</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
