import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { DASHBOARD_LAYOUT_CONFIG } from '../../shared/navigation';
import DashboardSidebar from './DashboardSidebar';
import './dashboard-layout.css';

function DashboardLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 992 : false
  );

  const config = useMemo(() => {
    if (!user?.role) return null;
    return DASHBOARD_LAYOUT_CONFIG[user.role] || null;
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 992;
      setIsMobile(mobileView);

      if (mobileView) {
        setIsCollapsed(false);
      } else {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
      return;
    }

    setIsCollapsed((prev) => !prev);
  };

  const displayName =
    user?.name ||
    user?.fullName ||
    user?.companyName ||
    'مستخدم النظام';

  const roleLabel =
    user?.role === 'admin'
      ? 'أدمن النظام'
      : user?.role === 'company'
      ? 'حساب شركة'
      : 'حساب مستخدم';

  if (!user || !config) return null;

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        config={config}
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onToggleCollapse={handleSidebarToggle}
      />

      {isMobileOpen && (
        <button
          type="button"
          className="dashboard-layout__overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-label="إغلاق القائمة"
        />
      )}

      <div
        className={`dashboard-layout__main ${
          !isMobile && isCollapsed ? 'is-expanded' : ''
        }`}
      >
        {isMobile && (
          <div className="dashboard-layout__mobile-header">
            <button
              type="button"
              className="dashboard-layout__mobile-menu-btn"
              onClick={handleSidebarToggle}
              aria-label="فتح القائمة"
            >
              <FiMenu />
            </button>

            <div className="dashboard-layout__mobile-user-card">
              <span className="dashboard-layout__mobile-user-role">
                {roleLabel}
              </span>
              <strong className="dashboard-layout__mobile-user-name">
                أهلاً، {displayName}
              </strong>
            </div>
          </div>
        )}

        <main className="dashboard-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;