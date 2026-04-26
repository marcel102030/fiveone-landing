import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUserId } from "../../../shared/utils/user";
import { readStoredPlatformProfile } from "../hooks/usePlatformUserProfile";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { PageLoader } from "../../../shared/components/ui/Spinner";

type Props = {
  children: ReactNode;
};

export default function MemberGuard({ children }: Props) {
  const location = useLocation();
  const { session, loading } = useAuth();
  const email = getCurrentUserId();
  const profile = readStoredPlatformProfile();
  const role = profile?.role || null;

  if (loading) return <PageLoader label="Verificando acesso…" />;

  // Exige sessão Supabase válida — localStorage sozinho não basta para membros.
  if (!session && !email) {
    return <Navigate to="/login-aluno" replace state={{ from: location }} />;
  }

  if (role !== "MEMBER") {
    return <Navigate to="/plataforma" replace />;
  }

  return <>{children}</>;
}
