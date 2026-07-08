import { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiSearch, FiX } from 'react-icons/fi';
import {
  assignCompanyToReport,
  getAssignmentCompaniesForReport,
} from '../api/adminReportsApi';
import AdminCompanyRecommendationCard from './AdminCompanyRecommendationCard';

const ISSUE_CATEGORY_LABELS = {
  1: 'الطرق والرصف',
  2: 'الإنارة والكهرباء',
  3: 'النظافة والمخلفات',
  4: 'المياه والصرف',
  5: 'الإشارات والمرور',
  6: 'الأشجار والحدائق',
  7: 'السلامة العامة',
  8: 'الغاز',
  9: 'الشبكات',
  10: 'صيانة عامة',
};

function getReportCategoryId(report = {}) {
  const directCategoryId = report.issueCategoryId || report.categoryId;

  if (directCategoryId) {
    return String(directCategoryId);
  }

  const reportCategoryName = report.issueCategoryName || report.type || '';
  const matchedCategory = Object.entries(ISSUE_CATEGORY_LABELS).find(([, label]) => (
    label === reportCategoryName
  ));

  return matchedCategory?.[0] || '';
}

function getReportCategoryLabel(report = {}, categoryId = '') {
  return (
    report.issueCategoryName ||
    report.type ||
    ISSUE_CATEGORY_LABELS[categoryId] ||
    'هذا النوع من البلاغات'
  );
}

function normalizeMatchValue(value) {
  return String(value || '').trim();
}

function doesCompanyMatchReportCategory(company = {}, categoryId = '', categoryLabel = '') {
  const acceptedValues = new Set([
    normalizeMatchValue(categoryId),
    normalizeMatchValue(categoryLabel),
  ].filter(Boolean));

  const companyValues = [
    company.specialization,
    ...(company.specializations || []),
    ...(company.problemTypes || []),
  ].map(normalizeMatchValue).filter(Boolean);

  if (!companyValues.length) {
    return true;
  }

  return companyValues.some((value) => acceptedValues.has(value));
}

function AdminCompanyAssignmentPanel({ report, onAssigned }) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const reportCategoryId = useMemo(() => getReportCategoryId(report), [report]);
  const reportCategoryLabel = useMemo(
    () => getReportCategoryLabel(report, reportCategoryId),
    [report, reportCategoryId],
  );

  const excludedCompanyIds = useMemo(
    () => report.excludedCompanyIds || [],
    [report.excludedCompanyIds],
  );

  const excludedCompanyNames = useMemo(
    () => report.excludedCompanyNames || [],
    [report.excludedCompanyNames],
  );

  const excludedCompanyKey = useMemo(
    () => [...excludedCompanyIds, ...excludedCompanyNames].join('|'),
    [excludedCompanyIds, excludedCompanyNames],
  );

  function isCompanyExcluded(company) {
    return (
      excludedCompanyIds.includes(company.id) ||
      excludedCompanyNames.includes(company.name)
    );
  }

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setErrorMessage('');

    if (!reportCategoryId) {
      setCompanies([]);
      setSelectedCompany(null);
      setErrorMessage('لا يمكن تحديد نوع المشكلة لهذا البلاغ، لذلك لا يمكن تحميل الشركات المتاحة.');
      setIsLoading(false);

      return () => {
        isMounted = false;
      };
    }

    getAssignmentCompaniesForReport(report.id, {
      search: searchTerm.trim(),
      specialization: reportCategoryId,
    })
      .then((data) => {
        if (!isMounted) return;

        const availableCompanies = data.filter((company) => (
          !isCompanyExcluded(company) &&
          doesCompanyMatchReportCategory(company, reportCategoryId, reportCategoryLabel)
        ));

        setCompanies(availableCompanies);
        setSelectedCompany((currentCompany) => {
          if (currentCompany && availableCompanies.some((item) => item.id === currentCompany.id)) {
            return currentCompany;
          }

          return availableCompanies[0] || null;
        });
      })
      .catch(() => {
        if (!isMounted) return;

        setCompanies([]);
        setSelectedCompany(null);
        setErrorMessage('تعذر تحميل الشركات المتاحة لهذا البلاغ.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [report.id, reportCategoryId, searchTerm, excludedCompanyKey]);

  const currentCompanyLabel =
    report.assignedCompany === 'غير معين'
      ? 'لم يتم التعيين بعد'
      : report.assignedCompany;

  function handleCloseConfirmModal() {
    if (isAssigning) return;

    setIsConfirmOpen(false);
  }

  async function handleConfirmAssign(event) {
    event.preventDefault();

    if (!selectedCompany) return;

    setIsAssigning(true);

    const result = await assignCompanyToReport(report.id, {
      companyId: selectedCompany.id,
      adminNote,
      assignmentSource: 'manual',
    });

    onAssigned?.(result);

    setIsConfirmOpen(false);
    setIsAssigning(false);
  }

  return (
    <section
      id="company-assignment"
      className="admin-report-details-card admin-company-assignment-panel"
    >
      <header className="admin-report-card-header">
        <div>
          <h2>تعيين شركة صيانة</h2>
          <p>الشركات المتاحة حسب نوع المشكلة: {reportCategoryLabel}</p>
        </div>
      </header>

      <div className="admin-company-assignment-current">
        <span>الشركة الحالية</span>
        <strong>{currentCompanyLabel}</strong>
      </div>

      {excludedCompanyNames.length ? (
        <div className="admin-company-excluded-warning">
          <FiAlertCircle />
          <span>
            تم استبعاد {excludedCompanyNames.join('، ')} من إعادة التعيين لأنها
            أرسلت تعذر التنفيذ لهذا البلاغ.
          </span>
        </div>
      ) : null}

      <div className="admin-company-assignment-toolbar admin-company-assignment-toolbar--search-only">
        <div className="admin-company-assignment-search">
          <FiSearch />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="ابحث باسم الشركة..."
            aria-label="البحث في الشركات"
          />
        </div>
      </div>

      <div className="admin-company-assignment-hint">
        <FiAlertCircle />
        <span>
          القائمة تعرض فقط الشركات التي أرجعها الباك لهذا البلاغ حسب نوع المشكلة ({reportCategoryLabel}). استخدم البحث للوصول لشركة محددة بسرعة.
        </span>
      </div>

      <div className="admin-company-recommendations">
        <div className="admin-company-recommendations__title">
          <h3>الشركات المتاحة لهذا البلاغ</h3>
          <span>{companies.length} شركة</span>
        </div>

        {errorMessage ? (
          <p className="admin-company-empty-state">{errorMessage}</p>
        ) : null}

        {isLoading ? (
          <p className="admin-company-empty-state">جاري تحميل الشركات...</p>
        ) : companies.length ? (
          <div className="admin-company-recommendations__grid">
            {companies.map((company) => (
              <AdminCompanyRecommendationCard
                key={company.id}
                company={company}
                isSelected={selectedCompany?.id === company.id}
                onSelect={setSelectedCompany}
              />
            ))}
          </div>
        ) : !errorMessage ? (
          <p className="admin-company-empty-state">
            {searchTerm.trim()
              ? `لا توجد شركات باسم "${searchTerm.trim()}" ضمن الشركات المؤهلة لتصنيف ${reportCategoryLabel}.`
              : `لا توجد شركات متاحة يمكنها حل مشكلة من نوع ${reportCategoryLabel}. برجاء التعاقد مع شركة لهذا التصنيف وإضافتها للنظام.`}
          </p>
        ) : null}
      </div>

      {selectedCompany ? (
        <div className="admin-selected-company-summary">
          <div>
            <span>الشركة المختارة</span>
            <strong>{selectedCompany.name}</strong>
            <p>{selectedCompany.specialization}</p>
          </div>

          <button
            type="button"
            className="admin-company-confirm-btn"
            onClick={() => setIsConfirmOpen(true)}
          >
            تأكيد التعيين
          </button>
        </div>
      ) : null}

      {isConfirmOpen ? (
        <div className="admin-assignment-modal-backdrop" role="presentation">
          <form
            className="admin-assignment-modal"
            role="dialog"
            aria-modal="true"
            onSubmit={handleConfirmAssign}
          >
            <button
              type="button"
              className="admin-assignment-modal__close"
              onClick={handleCloseConfirmModal}
              aria-label="إغلاق"
            >
              <FiX />
            </button>

            <header className="admin-assignment-modal__header">
              <div className="admin-assignment-modal__icon">
                <FiCheckCircle />
              </div>

              <h3>تأكيد تعيين الشركة</h3>
            </header>

            <div className="admin-assignment-modal__body">
              <div className="admin-assignment-confirm-info">
                <p>
                  <span>البلاغ</span>
                  <strong>
                    #{report.id} - {report.type}
                  </strong>
                </p>

                <p>
                  <span>الشركة</span>
                  <strong>{selectedCompany.name}</strong>
                </p>

                <p>
                  <span>طريقة الاختيار</span>
                  <strong>اختيار يدوي من الشركات المتاحة</strong>
                </p>
              </div>

              <label className="admin-assignment-note">
                <span>ملاحظات للأدمن / تعليمات للشركة</span>

                <textarea
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  placeholder="اكتب أي تعليمات أو ملاحظات مطلوبة للشركة..."
                  rows={4}
                />
              </label>
            </div>

            <footer className="admin-assignment-modal__actions">
              <button
                type="button"
                className="admin-assignment-cancel-btn"
                onClick={handleCloseConfirmModal}
                disabled={isAssigning}
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="admin-assignment-submit-btn"
                disabled={isAssigning}
              >
                {isAssigning ? 'جاري التعيين...' : 'تأكيد التعيين'}
              </button>
            </footer>
          </form>
        </div>
      ) : null}
    </section>
  );
}

export default AdminCompanyAssignmentPanel;
