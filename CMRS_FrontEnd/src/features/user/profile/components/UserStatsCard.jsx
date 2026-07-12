import {
  FiActivity,
  FiAlertTriangle,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiLoader,
  FiShield,
  FiThumbsUp,
  FiXCircle,
} from 'react-icons/fi';

const STATUS_CARD_CONFIG = {
  UnableToExecute: {
    displayName: 'متعذر التنفيذ',
    color: 'secondary',
    Icon: FiAlertTriangle,
  },
  Resolved: {
    displayName: 'تم الحل',
    color: 'success',
    Icon: FiCheckCircle,
  },
  Rejected: {
    displayName: 'مرفوض',
    color: 'danger',
    Icon: FiXCircle,
  },
  UnderReview: {
    displayName: 'قيد المراجعة',
    color: 'warning',
    Icon: FiClock,
  },
  InProgress: {
    displayName: 'جاري التنفيذ',
    color: 'primary',
    Icon: FiLoader,
  },
};

const ALLOWED_STATUS_COLORS = new Set([
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
]);

function clampPercent(value) {
  const numberValue = Number(value) || 0;

  return Math.max(0, Math.min(100, numberValue));
}

function normalizeCount(value) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : 0;
}

function normalizeStatusColor(color, fallbackColor = 'primary') {
  const normalizedColor = String(color || '').trim().toLowerCase();

  return ALLOWED_STATUS_COLORS.has(normalizedColor)
    ? normalizedColor
    : fallbackColor;
}

function getStatusCards(stats = {}) {
  if (Array.isArray(stats.statusCards)) {
    return stats.statusCards.map((card, index) => {
      const statusKey = String(card?.statusKey || `status-${index}`);
      const config = STATUS_CARD_CONFIG[statusKey] || {};

      return {
        statusKey,
        displayName:
          String(card?.displayName || '').trim() ||
          config.displayName ||
          'حالة البلاغ',
        count: normalizeCount(card?.count),
        color: normalizeStatusColor(card?.color, config.color || 'primary'),
        Icon: config.Icon || FiFileText,
      };
    });
  }

  // دعم مؤقت لشكل البيانات القديم في حالة تشغيل Mock قديم.
  return [
    {
      statusKey: 'Resolved',
      displayName: 'تم الحل',
      count: normalizeCount(stats.solvedReports),
      color: 'success',
      Icon: FiCheckCircle,
    },
    {
      statusKey: 'Rejected',
      displayName: 'مرفوض',
      count: normalizeCount(stats.rejectedReports),
      color: 'danger',
      Icon: FiXCircle,
    },
    {
      statusKey: 'UnderReview',
      displayName: 'قيد المراجعة',
      count: normalizeCount(stats.pendingReports),
      color: 'warning',
      Icon: FiClock,
    },
  ];
}

function MetricBar({ label, value, helper, icon }) {
  const safeValue = clampPercent(value);

  return (
    <article className="user-profile-metric">
      <div className="user-profile-metric__top">
        <span>
          {icon}
          {label}
        </span>

        <strong>{safeValue}%</strong>
      </div>

      <div className="user-profile-metric__bar">
        <span style={{ width: `${safeValue}%` }} />
      </div>

      <p>{helper}</p>
    </article>
  );
}

function SummaryCard({ label, value, tone = 'primary', icon: Icon }) {
  return (
    <article
      className={`user-profile-trust__summary-card user-profile-trust__summary-card--${tone}`}
    >
      <span className="user-profile-trust__summary-icon">
        <Icon />
      </span>

      <strong>{normalizeCount(value)}</strong>
      <span>{label}</span>
    </article>
  );
}

function UserStatsCard({
  profile,
  achievements = [],
  recentActivity = [],
}) {
  const stats = profile?.stats || {};
  const trustScore = clampPercent(profile?.trustScore);
  const statusCards = getStatusCards(stats);

  const hasAchievements = achievements.length > 0;
  const hasRecentActivity = recentActivity.length > 0;

  return (
    <section className="user-profile-card user-profile-stats-card">
      <div className="user-profile-card__header">
        <div>
          <h2>درجة الموثوقية</h2>
          <p>بناءً على دقة البلاغات وتفاعل المجتمع.</p>
        </div>

        <span className="user-profile-card__icon">
          <FiShield />
        </span>
      </div>

      <div className="user-profile-trust">
        <div
          className="user-profile-trust__circle"
          style={{
            background: `conic-gradient(var(--color-primary) ${
              trustScore * 3.6
            }deg, rgba(2, 95, 72, 0.08) 0deg)`,
          }}
        >
          <div>
            <strong>{trustScore}</strong>
            <span>/100</span>
          </div>
        </div>

        <div className="user-profile-trust__summary">
          <SummaryCard
            label="إجمالي البلاغات"
            value={stats.totalReports}
            tone="primary"
            icon={FiFileText}
          />

          {statusCards.map((statusCard) => (
            <SummaryCard
              key={statusCard.statusKey}
              label={statusCard.displayName}
              value={statusCard.count}
              tone={statusCard.color}
              icon={statusCard.Icon}
            />
          ))}

          <SummaryCard
            label="تأكيدات مفيدة"
            value={stats.helpfulVotes}
            tone="info"
            icon={FiThumbsUp}
          />
        </div>
      </div>

      <div className="user-profile-metrics-grid">
        <MetricBar
          label="دقة البلاغات"
          value={stats.reportsAccuracy}
          helper="نسبة البلاغات التي تم التحقق منها بنجاح"
          icon={<FiCheckCircle />}
        />

        <MetricBar
          label="المشاركة المجتمعية"
          value={stats.communityParticipation}
          helper="مشاركاتك في التحقق من بلاغات الآخرين"
          icon={<FiActivity />}
        />

        <MetricBar
          label="معدل الحل"
          value={stats.resolutionRate}
          helper="نسبة البلاغات التي وصلت إلى حل فعلي"
          icon={<FiClock />}
        />
      </div>

      {hasAchievements || hasRecentActivity ? (
        <div className="user-profile-extra-grid">
          {hasAchievements ? (
            <div className="user-profile-achievements">
              <h3>
                <FiAward />
                الشارات المكتسبة
              </h3>

              <div>
                {achievements.map((achievement) => (
                  <article
                    key={achievement.id}
                    className={`user-profile-achievement user-profile-achievement--${
                      achievement.tone || 'primary'
                    }`}
                  >
                    <strong>{achievement.title}</strong>
                    <p>{achievement.description}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {hasRecentActivity ? (
            <div className="user-profile-activity">
              <h3>
                <FiActivity />
                آخر النشاط
              </h3>

              <div>
                {recentActivity.map((activity) => (
                  <article key={activity.id}>
                    <span />
                    <div>
                      <strong>{activity.title}</strong>
                      <p>{activity.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default UserStatsCard;
