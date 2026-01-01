import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { authService } from "../../services/authService";

export const ResetEmailPage = () => {
  const [isLoading, setLoading] = useState(true);
  const { securityToken } = useParams();

  useEffect(() => {
    authService.changeEmail(securityToken)
      .then(() => setLoading(false))
      .catch(error => console.error(error))
  }, []);

  if (isLoading) {
    return <Loader />
  }

  return (
    <Navigate to='/login' replace />
  );
}