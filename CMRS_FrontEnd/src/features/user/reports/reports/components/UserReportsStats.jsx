import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiTool,
  FiXCircle,
} from 'react-icons/fi';
import {
  IN_PROGRESS_INCLUDED_STATUSES,
  REPORT_STATUS_API_VALUES,
  USER_REPORT_STATS_STATUS_DEFINITIONS,
} from '../api/userReportsApi';

const STAT_META = {
  total: {
    title: 'إجمالي البلاغات',
    description: 'كل البلاغات التي قمت بإرسالها',
    color: 'total',
    icon: FiFileText,
  },
  [REPORT_STATUS_API_VALUES.underReview]: {
    description: 'بلاغات ما زالت تحت المراجعة الأولية',
    icon: FiClock,
  },
  [REPORT_STATUS_API_VALUES.inProgress]: {
    description: 'بلاغات دخلت مسار القبول والتنفيذ والمتابعة',
    icon: FiTool,
  },
  [REPORT_STATUS_API_VALUES.resolved]: {
    description: 'بلاغات تم تنفيذها وإغلاقها بنجاح',
    icon: FiCheckCircle,
  },
  [REPORT_STATUS_API_VALUES.unableToExecute]: {
    description: 'بلاغات تعذر استكمال تنفيذها',
    icon: FiAlertCircle,
  },
  [REPORT_STATUS_API_VALUES.rejected]: {
    description: 'بلاغات لم يتم قبولها',
    icon: FiXCircle,
  },
};

function getStatusCards(stats = {}) {
  const apiCards = Array.isArray(stats.statusCards) ? stats.statusCards : [];

  return USER_REPORT_STATS_STATUS_DEFINITIONS.map((definition) => {
    const card = apiCards.find(
      (item = {}) => item.statusKey === definition.statusKey
    );

    return {
      ...definition,
      ...card,
      count: Number(card?.count || 0),
    };
  });
}

function LoadingValue() {
  return (
    <span
      className="user-reports-stat-card__loading"
      aria-label="جاري تحميل الإحصائية"
    />
  );
}

function StatCard({ card, isLoading = false, isWide = false }) {
  const { id, title, description, count, color, Icon } = card;
  const isProgress = id === REPORT_STATUS_API_VALUES.inProgress;

  return (
    <article
      className={`user-reports-stat-card user-reports-stat-card--${color} ${
        isProgress ? 'user-reports-stat-card--with-stages' : ''
      } ${isWide ? 'user-reports-stat-card--wide' : ''}`.trim()}
    >
      <div className="user-reports-stat-card__summary">
        <div className="user-reports-stat-card__top">
          <span className="user-reports-stat-card__icon" aria-hidden="true">
            <Icon />
          </span>

          <div className="user-reports-stat-card__heading">
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>

        <div className="user-reports-stat-card__value-row">
          <strong>{isLoading ? <LoadingValue /> : count}</strong>
          <span>بلاغ</span>
        </div>
      </div>

      {isProgress ? (
        <div className="user-reports-stat-card__stages">
          <span className="user-reports-stat-card__stages-title">
            يتضمن الحالات التالية:
          </span>

          <div className="user-reports-stat-card__stage-list">
            {IN_PROGRESS_INCLUDED_STATUSES.map((status) => (
              <span key={status.statusKey}>{status.label}</span>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function UserReportsStats({ stats = {}, isLoading = false }) {
  const statusCards = getStatusCards(stats);
  const totalReports = Number(stats.totalReports || 0);

  const cards = [
    {
      id: 'total',
      title: STAT_META.total.title,
      description: STAT_META.total.description,
      count: totalReports,
      color: STAT_META.total.color,
      Icon: STAT_META.total.icon,
    },
    ...statusCards.map((card) => {
      const meta = STAT_META[card.statusKey] || {};

      return {
        id: card.statusKey,
        title: card.displayName,
        description: meta.description,
        count: card.count,
        color: card.color,
        Icon: meta.icon || FiFileText,
      };
    }),
  ];

  const progressCard = cards.find(
    (card) => card.id === REPORT_STATUS_API_VALUES.inProgress
  );
  const compactCards = cards.filter(
    (card) => card.id !== REPORT_STATUS_API_VALUES.inProgress
  );

  return (
    <section className="user-reports-stats" aria-labelledby="user-reports-stats-title">
      <div className="user-reports-stats__header">
        <div>
          <h2 id="user-reports-stats-title">ملخص بلاغاتك</h2>
          <p>
            الإحصائيات التالية مأخوذة مباشرة من حالات جميع بلاغاتك، وليست من الصفحة الحالية فقط.
          </p>
        </div>

        <span className="user-reports-stats__badge">6 مؤشرات</span>
      </div>

      <div className="user-reports-stats__grid" aria-live="polite">
        {compactCards.map((card) => (
          <StatCard key={card.id} card={card} isLoading={isLoading} />
        ))}
      </div>

      {progressCard ? (
        <StatCard
          card={progressCard}
          isLoading={isLoading}
          isWide
        />
      ) : null}
    </section>
  );
}

export default UserReportsStats;
