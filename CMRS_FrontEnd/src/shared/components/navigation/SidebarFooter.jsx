import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { ROUTES } from '../../../shared/navigation';

function SidebarFooter({ collapsed = false }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className={`dashboard-sidebar__footer ${collapsed ? 'is-collapsed' : ''}`}>
      <button type="button" className="dashboard-sidebar__logout" onClick={handleLogout}>
        <span className="dashboard-sidebar__logout-icon">
          <FiLogOut />
        </span>

        {!collapsed && (
          <span className="dashboard-sidebar__logout-text">
            <strong>تسجيل خروج</strong>
            <small>log out</small>
          </span>
        )}
      </button>
    </div>
  );
}

export default SidebarFooter;