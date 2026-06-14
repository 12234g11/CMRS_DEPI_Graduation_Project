import { FiAlertTriangle } from 'react-icons/fi';
import CategoryIcon from './CategoryIcon';

function CategorySelectionStep({
  categories = [],
  selectedCategoryId = '',
  onSelect,
  onNext,
}) {
  return (
    <section className="add-report-step">
      <div className="add-report-step__header">
        <div className="add-report-step__header-icon">
          <FiAlertTriangle />
        </div>

        <div className="add-report-step__heading">
          <h2>نوع المشكلة</h2>
          <p>Issue Category</p>
        </div>
      </div>

      <div className="add-report-category-grid">
        {categories.map((category) => {
          const isActive = selectedCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              className={`add-report-category-card ${isActive ? 'is-active' : ''}`.trim()}
              onClick={() => onSelect(category.id)}
            >
              <span className={`add-report-category-card__icon is-${category.tone}`.trim()}>
                <CategoryIcon iconKey={category.iconKey} />
              </span>

              <span className="add-report-category-card__label">{category.label}</span>
              <span className="add-report-category-card__subtitle">{category.subtitle}</span>
            </button>
          );
        })}
      </div>

      <div className="add-report-step__actions add-report-step__actions--end">
        <button
          type="button"
          className="add-report-btn add-report-btn--primary"
          onClick={onNext}
          disabled={!selectedCategoryId}
        >
          التالي
        </button>
      </div>
    </section>
  );
}

export default CategorySelectionStep;