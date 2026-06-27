import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../../shared/navigation';
import { useAuth } from '../../features/auth/hooks/useAuth';

function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;