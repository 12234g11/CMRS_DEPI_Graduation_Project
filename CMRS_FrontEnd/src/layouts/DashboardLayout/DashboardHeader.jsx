import { Link } from 'react-router-dom';
import { FiMenu, FiPlus } from 'react-icons/fi';

function DashboardHeader({
  title,
  subtitle,
  action,
  user,
  isMobile,
  isMobileOpen,
  onToggleSidebar,
}) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header__start">
        <div className="dashboard-header__titles">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {isMobile && !isMobileOpen && (
          <button
            type="button"
            className="dashboard-header__mobile-toggle"
            onClick={onToggleSidebar}
            aria-label="فتح القائمة"
          >
            <FiMenu />
          </button>
        )}
      </div>

      <div className="dashboard-header__end">
        <div className="dashboard-header__user">
          <span>مرحبًا</span>
          <strong>{user?.name || 'مستخدم النظام'}</strong>
        </div>

        {action && (
          <Link to={action.to} className="dashboard-header__action-btn">
            <FiPlus />
            <span>{action.label}</span>
          </Link>
        )}
      </div>
    </header>
  );
}

export default DashboardHeader;