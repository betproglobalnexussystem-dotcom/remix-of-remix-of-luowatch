import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

interface Props {
  allowedRole: string;
  children: ReactNode;
}

const ProtectedDashboard = ({ allowedRole, children }: Props) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user || user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedDashboard;
