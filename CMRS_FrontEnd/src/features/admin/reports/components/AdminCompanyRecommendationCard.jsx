import {
  FiBriefcase,
  FiCheck,
  FiClock,
  FiMapPin,
  FiStar,
} from 'react-icons/fi';

function AdminCompanyRecommendationCard({ company, isSelected, onSelect }) {
  return (
    <article
      className={`admin-company-recommendation-card ${
        isSelected ? 'is-selected' : ''
      }`}
    >
      <div className="admin-company-recommendation-card__header">
        <div>
          <div className="admin-company-recommendation-card__title-row">
            <h3>{company.name}</h3>
          </div>

          <p>{company.specialization}</p>
        </div>
      </div>

      <p className="admin-company-description">
        {company.description || 'لا يوجد وصف متاح لهذه الشركة.'}
      </p>

      <div className="admin-company-metrics">
        <span>
          <FiBriefcase />
          {company.workloadLabel}
        </span>

        <span>
          <FiClock />
          {company.avgResponseTime}
        </span>

        <span>
          <FiStar />
          {company.rating}
        </span>

        <span>
          <FiCheck />
          {company.successRate}%
        </span>
      </div>

      <div className="admin-company-capacity">
        <div>
          <span>ضغط العمل</span>
          <b>{company.workloadLabel}</b>
        </div>

        <div className="admin-company-capacity__bar">
          <span
            className={`admin-company-capacity__fill admin-company-capacity__fill--${company.workloadTone}`}
            style={{ width: `${Math.min(company.capacityRatio * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="admin-company-coverage">
        <FiMapPin />
        <span>
          {company.coverageAreas?.length
            ? company.coverageAreas.slice(0, 4).join('، ')
            : 'لا توجد مناطق تغطية مسجلة'}
        </span>
      </div>

      {company.problemTypes?.length ? (
        <div className="admin-company-details-tags admin-company-assignment-tags">
          {company.problemTypes.slice(0, 4).map((type) => (
            <span key={type}>{type}</span>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="admin-company-select-btn"
        onClick={() => onSelect(company)}
      >
        {isSelected ? 'تم اختيار الشركة' : 'اختيار الشركة'}
      </button>
    </article>
  );
}

export default AdminCompanyRecommendationCard;
