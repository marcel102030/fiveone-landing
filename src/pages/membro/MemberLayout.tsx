import { NavLink, Outlet, useLocation } from "react-router-dom";
import { usePlatformUserProfile } from "../../hooks/usePlatformUserProfile";
import "./memberLayout.css";

const menuItems = [
  { to: "/membro", label: "Painel (Minha Jornada)" },
  { to: "/membro/igreja", label: "Minha Igreja na Casa" },
  { to: "/membro/discipulado", label: "Discipulado 1-1" },
  { to: "/membro/trilhas", label: "Trilhas" },
  { to: "/membro/avisos", label: "Avisos & Calendario" },
  { to: "/membro/oracao", label: "Pedidos de oracao" },
  { to: "/membro/perfil-ministerial", label: "Meu Perfil Ministerial" },
];

export default function MemberLayout() {
  const { profile } = usePlatformUserProfile();
  const location = useLocation();
  const displayName = profile?.displayName || profile?.name || profile?.email || "Membro";

  return (
    <div className="member-shell">
      <aside className="member-sidebar">
        <div className="member-brand">
          <span className="member-pill">Perfil de Membro</span>
          <h2>Bem-vindo, {displayName}</h2>
        </div>
        <nav className="member-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `member-nav-link ${isActive ? "is-active" : ""}`}
              aria-current={location.pathname === item.to ? "page" : undefined}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="member-main">
        <Outlet />
      </main>
    </div>
  );
}
