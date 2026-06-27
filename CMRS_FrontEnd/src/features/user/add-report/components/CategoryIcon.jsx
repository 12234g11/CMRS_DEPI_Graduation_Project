import {
  FiAlertCircle,
  FiDroplet,
  FiHelpCircle,
  FiMap,
  FiShield,
  FiSun,
  FiTool,
  FiTrash2,
  FiWifi,
  FiZap,
} from 'react-icons/fi';
import {
  FaFire,
  FaTrafficLight,
  FaTree,
} from 'react-icons/fa';

const ICONS = {
  trash: FiTrash2,
  droplet: FiDroplet,
  sun: FiSun,
  zap: FiZap,
  shield: FiShield,
  map: FiMap,
  tree: FaTree,
  help: FiHelpCircle,
  traffic: FaTrafficLight,
  fire: FaFire,
  wifi: FiWifi,
  tool: FiTool,
};

function CategoryIcon({ iconKey }) {
  const Icon = ICONS[iconKey] || FiAlertCircle;

  return <Icon />;
}

export default CategoryIcon;