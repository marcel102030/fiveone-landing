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
      let { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          clearAdminAuthenticated();
          setStatus("redirect");
          return;
        }
        ({ data: { session } } = await supabase.auth.getSession());
      }

      if (!session) {
        clearAdminAuthenticated();
        setStatus("redirect");
        return;
      }

      // Revalida que o e-mail desta sessão ainda tem role=ADMIN.
      // Sem isso, um admin recém-revogado mantém acesso por 7 dias.
      const { data: stillAdmin, error: rpcError } = await supabase.rpc('is_platform_admin');
      if (rpcError || stillAdmin !== true) {
        clearAdminAuthenticated();
        setStatus("redirect");
        return;
      }

      setStatus("ok");
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
