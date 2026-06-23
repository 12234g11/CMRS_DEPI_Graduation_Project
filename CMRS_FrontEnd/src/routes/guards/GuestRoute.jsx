import { Navigate, Outlet } from 'react-router-dom';
import { getDefaultRouteByRole } from '../../shared/navigation';
import { useAuth } from '../../features/auth/hooks/useAuth';

function GuestRoute() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.role) {
    return <Navigate to={getDefaultRouteByRole(user.role)} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;