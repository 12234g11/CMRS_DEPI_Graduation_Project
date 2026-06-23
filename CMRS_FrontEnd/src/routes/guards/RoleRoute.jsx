import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../../shared/navigation';
import { useAuth } from '../../features/auth/hooks/useAuth';

function RoleRoute({ allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}

export default RoleRoute;