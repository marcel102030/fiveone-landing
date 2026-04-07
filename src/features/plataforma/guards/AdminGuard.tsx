import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated, clearAdminAuthenticated } from "../../../shared/utils/adminAuth";
import { AdminToastProvider } from "../../../shared/components/AdminToast";
import { supabase } from "../../../shared/lib/supabaseClient";

type Props = { children: ReactNode };

type Status = "checking" | "ok" | "redirect";

export default function AdminGuard({ children }: Props) {
  const location = useLocation();
  const [status, setStatus] = useState<Status>(
    isAdminAuthenticated() ? "checking" : "redirect"
  );

  useEffect(() => {
    if (status === "redirect") return;

    async function ensureSession() {
      // Tenta obter a sessão atual
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus("ok");
        return;
      }

      // Sem sessão ativa — tenta renovar via refresh token
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        // Renovação falhou: limpa o flag e redireciona para login
        clearAdminAuthenticated();
        setStatus("redirect");
      } else {
        setStatus("ok");
      }
    }

    void ensureSession();
  }, []);

  if (status === "redirect") {
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <AdminToastProvider>{children}</AdminToastProvider>;
}
