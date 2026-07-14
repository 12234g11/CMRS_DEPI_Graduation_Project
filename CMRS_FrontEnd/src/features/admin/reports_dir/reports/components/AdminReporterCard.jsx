import {
  FiFileText,
  FiInfo,
  FiMail,
  FiPhone,
  FiUser,
} from 'react-icons/fi';

function AdminReporterCard({ reporter = {} }) {
  const trustScore = Math.min(100, Math.max(0, Number(reporter.trustScore) || 0));
  const reporterName = reporter.name || 'غير متوفر';
  const reporterEmail = reporter.email || 'غير متوفر';
  const reporterPhone = reporter.phone || 'غير متوفر';
  const reportsCount = Number(reporter.reportsCount) || 0;

  return (
    <section className="admin-report-details-card admin-reporter-card">
      <header className="admin-report-card-header admin-reporter-card__header">
        <div className="admin-reporter-card__heading">
          <h2>معلومات المبلغ</h2>
          <p>بيانات مقدم البلاغ ودرجة الثقة</p>
        </div>

        <span className="admin-reporter-card__avatar" aria-hidden="true">
          <FiInfo />
        </span>
      </header>

      <div className="admin-reporter-card__body">
        <article className="admin-reporter-profile">
          <div className="admin-reporter-profile__head">
            <span className="admin-reporter-profile__icon" aria-hidden="true">
              <FiUser />
            </span>

            <div className="admin-reporter-card__identity">
              <span>مقدم البلاغ</span>
              <strong>{reporterName}</strong>
            </div>
          </div>

          <div className="admin-reporter-profile__details">
            <div className="admin-reporter-detail-item">
              <span className="admin-reporter-detail-item__icon" aria-hidden="true">
                <FiPhone />
              </span>
              <div>
                <span>رقم الهاتف</span>
                <b dir="ltr">{reporterPhone}</b>
              </div>
            </div>

            <div className="admin-reporter-detail-item admin-reporter-detail-item--email">
              <span className="admin-reporter-detail-item__icon" aria-hidden="true">
                <FiMail />
              </span>
              <div>
                <span>البريد الإلكتروني</span>
                <b dir="ltr" title={reporterEmail}>{reporterEmail}</b>
              </div>
            </div>

            <div className="admin-reporter-detail-item">
              <span className="admin-reporter-detail-item__icon" aria-hidden="true">
                <FiFileText />
              </span>
              <div>
                <span>البلاغات المقدمة</span>
                <b>{reportsCount} بلاغاً</b>
              </div>
            </div>
          </div>
        </article>

        <aside className="admin-reporter-trust">
          <div className="admin-reporter-trust__score-row">
            <div
              className="admin-reporter-trust__circle"
              style={{ '--trust-progress': `${trustScore * 3.6}deg` }}
              aria-label={`درجة الثقة ${trustScore} من 100`}
            >
              <div>
                <strong>{trustScore}</strong>
                <span>/ 100</span>
              </div>
            </div>

            <div className="admin-reporter-trust__content">
              <span>درجة الثقة</span>
              <b>{trustScore} / 100</b>

              <div className="admin-reporter-trust__bar" aria-hidden="true">
                <span style={{ width: `${trustScore}%` }} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default AdminReporterCard;
