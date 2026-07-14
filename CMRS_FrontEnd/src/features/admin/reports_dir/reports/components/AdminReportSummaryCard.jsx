import { FiAlertTriangle, FiCalendar, FiHash, FiMapPin, FiTag } from 'react-icons/fi';

function AdminReportSummaryCard({ report }) {
  const items = [
    {
      icon: <FiHash />,
      label: 'رقم البلاغ',
      subtitle: 'Report ID',
      value: `#${report.id}`,
    },
    {
      icon: <FiTag />,
      label: 'نوع المشكلة',
      subtitle: 'Problem Type',
      value: report.type,
      badgeClassName: 'admin-report-type-pill',
    },
    {
      icon: <FiCalendar />,
      label: 'تاريخ البلاغ',
      subtitle: 'Report Date',
      value: report.date,
    },
    {
      icon: <FiAlertTriangle />,
      label: 'الأولوية',
      subtitle: 'Priority',
      value: report.priority,
      badgeClassName: `admin-report-priority admin-report-priority--${report.priorityTone}`,
    },
    {
      icon: <FiMapPin />,
      label: 'الموقع',
      subtitle: 'Location',
      value: report.location,
    },
  ];

  return (
    <section className="admin-report-details-card admin-report-summary-card">
      {items.map((item) => (
        <div key={item.label} className="admin-report-summary-row">
          <span className="admin-report-summary-row__icon">{item.icon}</span>

          <div className="admin-report-summary-row__label">
            <strong>{item.label}</strong>
            <span>{item.subtitle}</span>
          </div>

          <div className="admin-report-summary-row__value">
            {item.badgeClassName ? (
              <span className={item.badgeClassName}>{item.value}</span>
            ) : (
              <strong>{item.value}</strong>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

export default AdminReportSummaryCard;