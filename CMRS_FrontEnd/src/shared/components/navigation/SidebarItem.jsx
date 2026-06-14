import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiPlus,
  FiMapPin,
  FiFileText,
  FiBell,
  FiUser,
  FiGrid,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiTool,
} from 'react-icons/fi';

const ICONS = {
  home: FiHome,
  plus: FiPlus,
  'map-pin': FiMapPin,
  'file-text': FiFileText,
  bell: FiBell,
  user: FiUser,
  grid: FiGrid,
  users: FiUsers,
  'bar-chart': FiBarChart2,
  settings: FiSettings,
  tool: FiTool,
};

function SidebarItem({ item, collapsed = false, onNavigate }) {
  const location = useLocation();
  const Icon = ICONS[item.icon] || FiHome;

  const isActive = location.pathname === item.path;

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