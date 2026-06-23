import {
  FiAward,
  FiBriefcase,
  FiCheck,
  FiClock,
  FiMapPin,
  FiStar,
  FiTarget,
} from 'react-icons/fi';

function AdminCompanyRecommendationCard({
  company,
  isSelected,
  isTopRecommended,
  onSelect,
}) {
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

            {isTopRecommended ? (
              <span className="admin-company-recommended-badge">
                <FiAward />
                موصى بها
              </span>
            ) : null}
          </div>

          <p>{company.specialization}</p>
        </div>

        <div className="admin-company-match-score">
          <strong>{company.matchScore}%</strong>
          <span>مطابقة</span>
        </div>
      </div>

      <p className="admin-company-description">{company.description}</p>

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
        <span>{company.coverageAreas.slice(0, 4).join('، ')}</span>
      </div>

      <div className="admin-company-reasons">
        <strong>
          <FiTarget />
          أسباب الترشيح
        </strong>

        <ul>
          {company.matchReasons.slice(0, 3).map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>

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