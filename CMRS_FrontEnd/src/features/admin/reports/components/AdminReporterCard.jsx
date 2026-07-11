import { FiFileText, FiInfo, FiPhone } from 'react-icons/fi';

function AdminReporterCard({ reporter }) {
  return (
    <section className="admin-report-details-card admin-reporter-card">
      <header className="admin-report-card-header">
        <div>
          <h2>معلومات المبلغ</h2>
          <p>Reporter</p>
        </div>

        <span className="admin-reporter-card__avatar">
          <FiInfo />
        </span>
      </header>

      <div className="admin-reporter-card__body">
        <div className="admin-reporter-card__identity">
          <strong>{reporter.name}</strong>
          <span>{reporter.email}</span>
        </div>

        <div className="admin-reporter-card__contacts">
          <span>
            <FiPhone />
            {reporter.phone}
          </span>

          <span>
            <FiFileText />
            {reporter.reportsCount} بلاغاً مقدماً
          </span>
        </div>

        <div className="admin-reporter-trust">
          <div className="admin-reporter-trust__circle">
            <strong>{reporter.trustScore}</strong>
          </div>

          <div className="admin-reporter-trust__content">
            <span>درجة الموثوقية</span>
            <b>{reporter.verified ? 'موثوق' : 'غير موثق'}</b>

            <div className="admin-reporter-trust__bar">
              <span style={{ width: `${reporter.trustScore}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminReporterCard;