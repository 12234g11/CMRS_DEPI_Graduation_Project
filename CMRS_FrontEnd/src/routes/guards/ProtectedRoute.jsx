import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../../shared/navigation';
import { useAuth } from '../../features/auth/hooks/useAuth';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;