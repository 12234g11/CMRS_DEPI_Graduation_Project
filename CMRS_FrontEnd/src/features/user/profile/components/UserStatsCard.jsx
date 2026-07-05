import {
  FiActivity,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiShield,
} from 'react-icons/fi';

function clampPercent(value) {
  const numberValue = Number(value) || 0;

  return Math.max(0, Math.min(100, numberValue));
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

function UserStatsCard({
  profile,
  achievements = [],
  recentActivity = [],
}) {
  const stats = profile?.stats || {};
  const trustScore = clampPercent(profile?.trustScore);

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
          <article>
            <strong>{stats.totalReports ?? 0}</strong>
            <span>إجمالي البلاغات</span>
          </article>

          <article>
            <strong>{stats.solvedReports ?? 0}</strong>
            <span>بلاغات محلولة</span>
          </article>

          <article>
            <strong>{stats.pendingReports ?? 0}</strong>
            <span>بلاغات قيد المراجعة</span>
          </article>

          <article>
            <strong>{stats.rejectedReports ?? 0}</strong>
            <span>بلاغات مرفوضة</span>
          </article>

          <article>
            <strong>{stats.helpfulVotes ?? 0}</strong>
            <span>تأكيدات مفيدة</span>
          </article>
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