import CategoryIcon from './CategoryIcon';
import {
  CATEGORY_UI_META_BY_ID,
  DEFAULT_CATEGORY_UI_META,
} from '../constants/categoryUiMeta';

function CategorySelectionStep({
  categories = [],
  selectedCategoryId = '',
  onSelect,
  onNext,
  isLoading = false,
  errorMessage = '',
}) {
  const hasSelectedCategory = Boolean(selectedCategoryId);

  return (
    <section className="add-report-step">
      <div className="add-report-step__header">
        <div className="add-report-step__heading">
          <h2>اختر نوع المشكلة</h2>
          <p>حدد الفئة الأقرب للبلاغ حتى يتم توجيهه للجهة المختصة</p>
        </div>
      </div>

      {isLoading ? (
        <div className="add-report-categories-loading">
          <div className="add-report-categories-loading__spinner" />

          <p>جاري تحميل أنواع البلاغات...</p>

          <div className="add-report-category-grid">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="add-report-category-card add-report-category-card--skeleton"
              >
                <span className="add-report-category-card__icon" />

                <span className="add-report-category-card__content">
                  <strong />
                  <small />
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <p className="add-report-form__message add-report-form__message--error">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && !categories.length ? (
        <p className="add-report-form__message add-report-form__message--error">
          لا توجد أنواع بلاغات متاحة حاليًا.
        </p>
      ) : null}

      {!isLoading && !errorMessage && categories.length ? (
        <div className="add-report-category-grid">
          {categories.map((category) => {
            const categoryId = String(category.categoryId || '');
            const uiMeta =
              CATEGORY_UI_META_BY_ID[categoryId] || DEFAULT_CATEGORY_UI_META;

            const isActive = String(selectedCategoryId) === categoryId;

            return (
              <button
                key={categoryId}
                type="button"
                className={`add-report-category-card is-${uiMeta.tone} ${
                  isActive ? 'is-active' : ''
                }`}
                onClick={() => onSelect?.(categoryId)}
              >
                <span className="add-report-category-card__icon">
                  <CategoryIcon iconKey={uiMeta.iconKey} />
                </span>

                <span className="add-report-category-card__content">
                  <strong>{category.name}</strong>

                  {category.description ? (
                    <small>{category.description}</small>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="add-report-step__actions">
        <button
          type="button"
          className="add-report-btn add-report-btn--primary"
          onClick={onNext}
          disabled={!hasSelectedCategory || isLoading}
        >
          التالي
        </button>
      </div>
    </section>
  );
}

export default CategorySelectionStep;