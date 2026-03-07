import { ReactNode, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { getCurrentUserId } from "../../../shared/utils/user";
import { PageLoader } from "../../../shared/components/ui/Spinner";

type Props = { children: ReactNode };

function isSafeNext(next: string): boolean {
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
}

export default function StudentGuard({ children }: Props) {
  const location = useLocation();
  const { session, loading } = useAuth();

  const next = useMemo(
    () => `${location.pathname}${location.search || ""}`,
    [location.pathname, location.search],
  );

  // Aguarda a sessão ser carregada antes de redirecionar
  if (loading) return <PageLoader label="Verificando acesso…" />;

  // Verifica sessão Supabase Auth primeiro, depois fallback no localStorage legado
  const isAuthenticated = !!session || !!getCurrentUserId();

  if (!isAuthenticated) {
    const destination = isSafeNext(next) ? next : "/plataforma";
    return <Navigate to={`/login-aluno?next=${encodeURIComponent(destination)}`} replace />;
  }

  return <>{children}</>;
}
