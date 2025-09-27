import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "../../utils/adminAuth";
import { AdminToastProvider } from "../AdminToast";

type Props = {
  children: ReactNode;
};

export default function AdminGuard({ children }: Props) {
  const location = useLocation();
  const ok = isAdminAuthenticated();

  if (!ok) {
    return <Navigate to="/admin" replace state={{ from: location }} />;
    }

  return <AdminToastProvider>{children}</AdminToastProvider>;
}
