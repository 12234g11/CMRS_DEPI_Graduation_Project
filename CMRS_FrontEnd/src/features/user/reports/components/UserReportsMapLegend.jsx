import { FiInfo } from 'react-icons/fi';
import { IN_PROGRESS_INCLUDED_STATUSES } from '../api/userReportsApi';

const MAP_STATUS_ITEMS = [
  {
    id: 'under-review',
    label: 'قيد المراجعة',
    tone: 'warning',
  },
  {
    id: 'in-progress',
    label: 'جاري التنفيذ',
    tone: 'info',
  },
  {
    id: 'resolved',
    label: 'تم الحل',
    tone: 'success',
  },
  {
    id: 'unable-to-execute',
    label: 'متعذر التنفيذ',
    tone: 'secondary',
  },
  {
    id: 'rejected',
    label: 'مرفوض',
    tone: 'danger',
  },
];

function UserReportsMapLegend() {
  return (
    <div className="user-reports-map-legend" dir="rtl">
      <div className="user-reports-map-legend__items" aria-label="دليل ألوان حالات البلاغات">
        {MAP_STATUS_ITEMS.map((item) => (
          <span
            key={item.id}
            className={`user-reports-map-legend__item user-reports-map-legend__item--${item.tone}`}
          >
            <i aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>

      <div className="user-reports-map-legend__note">
        <FiInfo aria-hidden="true" />
        <p>
          <strong>لون جاري التنفيذ</strong> يشمل:{' '}
          {IN_PROGRESS_INCLUDED_STATUSES.map((status) => status.label).join('، ')}.
        </p>
      </div>
    </div>
  );
}

export default UserReportsMapLegend;
