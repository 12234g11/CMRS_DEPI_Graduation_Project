import { FiInfo } from 'react-icons/fi';

const LEGEND_ITEMS = [
  { id: 'accepted', label: 'مقبول', tone: 'accepted' },
  { id: 'assigned', label: 'تم التعيين', tone: 'assigned' },
  { id: 'in-progress', label: 'جاري التنفيذ', tone: 'in-progress' },
  { id: 'pending-admin', label: 'بانتظار مراجعة الأدمن', tone: 'pending-admin-approval' },
  { id: 'needs-completion', label: 'مطلوب استكمال', tone: 'needs-completion' },
  { id: 'resolved', label: 'تم الحل', tone: 'resolved' },
  { id: 'unable', label: 'متعذر التنفيذ', tone: 'unable-to-execute' },
];

function FollowedReportsMapLegend() {
  return (
    <div className="user-reports-map-legend followed-reports-map-legend" dir="rtl">
      <div
        className="user-reports-map-legend__items"
        aria-label="دليل ألوان حالات البلاغات المتابَعة"
      >
        {LEGEND_ITEMS.map((item) => (
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
          لا تظهر هنا إلا البلاغات التي تابعتها وما زالت في حالة مسموح بعرضها.
        </p>
      </div>
    </div>
  );
}

export default FollowedReportsMapLegend;
