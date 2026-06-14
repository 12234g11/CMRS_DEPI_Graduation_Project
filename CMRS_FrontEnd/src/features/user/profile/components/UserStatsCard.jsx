import {
  FiActivity,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiTrendingUp,
} from 'react-icons/fi';

function MetricBar({ label, value, helper, icon }) {
  return (
    <article className="user-profile-metric">
      <div className="user-profile-metric__top">
        <span>
          {icon}
          {label}
        </span>

        <strong>{value}%</strong>
      </div>

      <div className="user-profile-metric__bar">
        <span style={{ width: `${value}%` }} />
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

  return (
    <section className="user-profile-card user-profile-stats-card">
      <div className="user-profile-card__header">
        <div>
          <h2>درجة الموثوقية</h2>
          <p>Trust Score — بناءً على دقة البلاغات وتفاعل المجتمع.</p>
        </div>

        <span className="user-profile-card__icon">
          <FiShield />
        </span>
      </div>

      <div className="user-profile-trust">
        <div
          className="user-profile-trust__circle"
          style={{
            background: `conic-gradient(var(--color-primary) ${profile.trustScore * 3.6}deg, rgba(2, 95, 72, 0.08) 0deg)`,
          }}
        >
          <div>
            <strong>{profile.trustScore}</strong>
            <span>/100</span>
          </div>
        </div>

        <div className="user-profile-trust__summary">
          <article>
            <strong>{stats.totalReports}</strong>
            <span>إجمالي البلاغات</span>
          </article>

          <article>
            <strong>{stats.solvedReports}</strong>
            <span>بلاغات محلولة</span>
          </article>

          <article>
            <strong>{stats.helpfulVotes}</strong>
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
          label="الاستمرارية"
          value={stats.consistency}
          helper="معدل نشاطك المنتظم داخل النظام"
          icon={<FiTrendingUp />}
        />

        <MetricBar
          label="معدل الحل"
          value={stats.resolutionRate}
          helper="نسبة البلاغات التي وصلت إلى حل فعلي"
          icon={<FiClock />}
        />
      </div>

      <div className="user-profile-extra-grid">
        <div className="user-profile-achievements">
          <h3>
            <FiAward />
            الشارات المكتسبة
          </h3>

          <div>
            {achievements.map((achievement) => (
              <article
                key={achievement.id}
                className={`user-profile-achievement user-profile-achievement--${achievement.tone}`}
              >
                <strong>{achievement.title}</strong>
                <p>{achievement.description}</p>
              </article>
            ))}
          </div>
        </div>

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
      </div>
    </section>
  );
}

export default UserStatsCard;