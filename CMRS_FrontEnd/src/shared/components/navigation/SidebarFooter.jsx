import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { ROUTES } from '../../../shared/navigation';

function SidebarFooter({ collapsed = false }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      await logout();

      navigate(ROUTES.LOGIN, { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div
      className={`dashboard-sidebar__footer ${
        collapsed ? 'is-collapsed' : ''
      }`}
    >
      <button
        type="button"
        className="dashboard-sidebar__logout"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <span className="dashboard-sidebar__logout-icon">
          <FiLogOut />
        </span>

        {!collapsed && (
          <span className="dashboard-sidebar__logout-text">
            <strong>
              {isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل خروج'}
            </strong>
            <small>log out</small>
          </span>
        )}
      </button>
    </div>
  );
}

export default SidebarFooter;