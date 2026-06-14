import {
  FiAlertCircle,
  FiDroplet,
  FiHelpCircle,
  FiMap,
  FiShield,
  FiSun,
  FiTrash2,
  FiZap,
} from 'react-icons/fi';
import { FaTree } from 'react-icons/fa';

const ICONS = {
  trash: FiTrash2,
  droplet: FiDroplet,
  sun: FiSun,
  zap: FiZap,
  shield: FiShield,
  map: FiMap,
  tree: FaTree,
  help: FiHelpCircle,
};

function CategoryIcon({ iconKey }) {
  const Icon = ICONS[iconKey] || FiAlertCircle;
  return <Icon />;
}

export default CategoryIcon;