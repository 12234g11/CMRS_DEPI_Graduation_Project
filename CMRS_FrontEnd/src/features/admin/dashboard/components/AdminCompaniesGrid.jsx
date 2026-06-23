import { FiTruck } from 'react-icons/fi';

function AdminCompaniesGrid({ companies = [] }) {
  return (
    <div className="admin-companies-grid">
      {companies.map((company) => (
        <article key={company.id} className="admin-company-card">
          <div className="admin-company-card__icon" aria-hidden="true">
            <FiTruck />
          </div>

          <div className="admin-company-card__content">
            <strong>{company.name}</strong>
            <span>{company.specialization}</span>
          </div>

          <span className={`admin-company-card__badge admin-company-card__badge--${company.tone}`}>
            {company.pendingReports} مهام
          </span>
        </article>
      ))}
    </div>
  );
}

export default AdminCompaniesGrid;