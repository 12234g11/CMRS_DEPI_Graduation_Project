import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiRefreshCw,
  FiTool,
  FiUser,
} from 'react-icons/fi';

const ICONS = {
  user: FiUser,
  admin: FiCheckCircle,
  company: FiTool,
  system: FiRefreshCw,
};

function AdminReportTimelineCard({ timeline = [] }) {
  return (
    <section className="admin-report-details-card admin-report-timeline-card">
      <header className="admin-report-card-header">
        <div>
          <h2>سجل تحديثات البلاغ</h2>
          <p>Report Timeline</p>
        </div>

        <span className="admin-report-timeline-count">
          <FiFileText />
          {timeline.length} تحديث
        </span>
      </header>

      <div className="admin-report-timeline-list">
        {timeline.map((item) => {
          const Icon = ICONS[item.actorType] || FiClock;

          return (
            <article key={item.id} className="admin-report-timeline-item">
              <span className={`admin-report-timeline-item__icon is-${item.actorType}`}>
                <Icon />
              </span>

              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>

                <small>
                  {item.actor} - {item.date}
                </small>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default AdminReportTimelineCard;