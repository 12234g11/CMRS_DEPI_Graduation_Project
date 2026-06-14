import { FiMenu, FiX } from 'react-icons/fi';
import SidebarItem from '../../shared/components/navigation/SidebarItem';
import SidebarFooter from '../../shared/components/navigation/SidebarFooter';

function DashboardSidebar({
  config,
  isCollapsed,
  isMobile,
  isMobileOpen,
  onCloseMobile,
  onToggleCollapse,
}) {
  const sidebarClasses = [
    'dashboard-sidebar',
    !isMobile && isCollapsed ? 'is-collapsed' : '',
    isMobile && isMobileOpen ? 'is-mobile-open' : '',
  ]
    .join(' ')
    .trim();

  return (
    <aside className={sidebarClasses}>
      <div className="dashboard-sidebar__top">
        <div className="dashboard-sidebar__brand">
          <div className="dashboard-sidebar__brand-mark">
            <img
              src="/images/AppLogo2.webp"
              alt="نظام البلاغات"
              className="dashboard-sidebar__brand-logo"
            />
          </div>

          {(!isCollapsed || isMobile) && (
            <div className="dashboard-sidebar__brand-text">
              <strong>نظام البلاغات</strong>
              <span>Report System</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className={`dashboard-sidebar__collapse-btn ${isMobile ? 'is-mobile-close' : ''}`}
          onClick={onToggleCollapse}
          aria-label={isMobile ? 'إغلاق القائمة' : 'طي القائمة'}
        >
          {isMobile ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <nav className="dashboard-sidebar__nav">
        {config?.navItems?.map((item) => (
          <SidebarItem
            key={item.key}
            item={item}
            collapsed={!isMobile && isCollapsed}
            onNavigate={isMobile ? onCloseMobile : undefined}
          />
        ))}
      </nav>

      <SidebarFooter collapsed={!isMobile && isCollapsed} />
    </aside>
  );
}

export default DashboardSidebar;