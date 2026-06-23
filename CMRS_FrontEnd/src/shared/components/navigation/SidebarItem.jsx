import { Link, useLocation } from 'react-router-dom';
import { SIDEBAR_ICONS } from '../../navigation';

function SidebarItem({ item, collapsed = false, onNavigate }) {
  const location = useLocation();
  const Icon = SIDEBAR_ICONS[item.icon] || SIDEBAR_ICONS.home;

  const currentPath = location.pathname;
  const isActive = item.end
    ? currentPath === item.path
    : currentPath === item.path || currentPath.startsWith(`${item.path}/`);

  const handleClick = (event) => {
    event.currentTarget.blur();
    onNavigate?.();
  };

  return (
    <Link
      to={item.path}
      onClick={handleClick}
      className={`dashboard-sidebar__item ${
        isActive ? 'is-active' : ''
      } ${collapsed ? 'is-collapsed' : ''}`.trim()}
    >
      <span className="dashboard-sidebar__item-icon">
        <Icon />
      </span>

      {!collapsed && (
        <span className="dashboard-sidebar__item-text">
          <strong>{item.label}</strong>
        </span>
      )}
    </Link>
  );
}

export default SidebarItem;