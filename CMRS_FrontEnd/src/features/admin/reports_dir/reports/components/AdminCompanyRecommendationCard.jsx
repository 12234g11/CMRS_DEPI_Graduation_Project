import {
  FiAlertCircle,
  FiBriefcase,
  FiMapPin,
} from 'react-icons/fi';

function AdminCompanyRecommendationCard({ company, availability, isSelected, onSelect }) {
  const canAssign = availability?.canAssign !== false;
  const unavailableReason = availability?.reason || '';

  return (
    <article
      className={`admin-company-recommendation-card ${
        isSelected ? 'is-selected' : ''
      } ${!canAssign ? 'is-disabled' : ''}`}
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

      {!canAssign ? (
        <div className="admin-company-unavailable-reason">
          <FiAlertCircle />
          <span>{unavailableReason}</span>
        </div>
      ) : null}

      <div className="admin-company-metrics">
        <span>
          <FiBriefcase />
          {company.workloadLabel}
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
        disabled={!canAssign}
      >
        {!canAssign ? 'غير متاحة للتعيين' : isSelected ? 'تم اختيار الشركة' : 'اختيار الشركة'}
      </button>
    </article>
  );
}

export default AdminCompanyRecommendationCard;
