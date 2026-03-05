import { ReactNode, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUserId } from "../../utils/user";

type Props = {
  children: ReactNode;
};

function isSafeNext(next: string): boolean {
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
}

export default function StudentGuard({ children }: Props) {
  const location = useLocation();
  const email = getCurrentUserId();

  const next = useMemo(() => `${location.pathname}${location.search || ""}`, [location.pathname, location.search]);

  if (!email) {
    const destination = isSafeNext(next) ? next : "/plataforma";
    return <Navigate to={`/login-aluno?next=${encodeURIComponent(destination)}`} replace />;
  }

  return <>{children}</>;
}

