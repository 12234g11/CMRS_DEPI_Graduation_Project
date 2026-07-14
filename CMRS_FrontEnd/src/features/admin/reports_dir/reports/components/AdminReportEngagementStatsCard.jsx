import { FiThumbsDown, FiThumbsUp, FiUsers } from 'react-icons/fi';

const ENGAGEMENT_STATS = [
  {
    key: 'followersCount',
    label: 'عدد المتابعين',
    subtitle: 'Followers',
    icon: FiUsers,
    tone: 'followers',
  },
  {
    key: 'upvoteCount',
    label: 'عدد المصدقين',
    subtitle: 'True Reports',
    icon: FiThumbsUp,
    tone: 'upvotes',
  },
  {
    key: 'downvoteCount',
    label: 'عدد المكذبين',
    subtitle: 'False Reports',
    icon: FiThumbsDown,
    tone: 'downvotes',
  },
];

function AdminReportEngagementStatsCard({ report }) {
  return (
    <section className="admin-report-details-card admin-report-engagement-stats-card">
      <header className="admin-report-card-header">
        <div>
          <h2>تفاعل المواطنين مع البلاغ</h2>
          <p>Report Engagement</p>
        </div>
      </header>

      <div className="admin-report-engagement-stats-grid">
        {ENGAGEMENT_STATS.map((stat) => {
          const Icon = stat.icon;
          const value = Number(report?.[stat.key] ?? 0);

          return (
            <article
              key={stat.key}
              className={`admin-report-engagement-stat admin-report-engagement-stat--${stat.tone}`}
            >
              <span className="admin-report-engagement-stat__icon" aria-hidden="true">
                <Icon />
              </span>

              <div className="admin-report-engagement-stat__content">
                <span>{stat.label}</span>
                <strong>{Number.isFinite(value) ? value : 0}</strong>
                <small>{stat.subtitle}</small>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default AdminReportEngagementStatsCard;
