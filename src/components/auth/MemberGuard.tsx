import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUserId } from "../../utils/user";
import { readStoredPlatformProfile } from "../../hooks/usePlatformUserProfile";

type Props = {
  children: ReactNode;
};

export default function MemberGuard({ children }: Props) {
  const location = useLocation();
  const email = getCurrentUserId();
  const profile = readStoredPlatformProfile();
  const role = profile?.role || null;

  if (!email) {
    return <Navigate to="/login-aluno" replace state={{ from: location }} />;
  }

  if (role !== "MEMBER") {
    return <Navigate to="/plataforma" replace />;
  }

  return <>{children}</>;
}
