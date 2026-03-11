import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserService } from "./services/user.service";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await UserService.adminme();
        setAuthorized(true);
      } catch {
        localStorage.removeItem("token");
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}