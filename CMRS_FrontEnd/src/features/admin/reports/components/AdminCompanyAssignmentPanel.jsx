import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertCircle, FiCheckCircle, FiSearch, FiX } from 'react-icons/fi';
import {
  assignCompanyToReport,
  getAdminCompanyForAssignment,
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

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

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

function getAssignedCompanyName(report = {}) {
  const assignedName =
    report.assignedCompanyName ||
    report.assignedCompany ||
    report.concernedCompanyName ||
    report.concernedCompany ||
    '';

  return assignedName && assignedName !== 'غير معين' ? assignedName : '';
}

function hasExistingAssignment(report = {}) {
  return Boolean(report.assignedCompanyId || getAssignedCompanyName(report));
}

function isActiveStatus(value) {
  const normalized = normalizeText(value);

  if (!normalized) return true;

  return normalized === 'active' || normalized === 'نشطة' || normalized === 'مفعل' || normalized === 'مفعلة';
}

function isActiveAccountStatus(value) {
  const normalized = normalizeText(value);

  if (!normalized) return true;

  return normalized === 'active' || normalized === 'مفعل' || normalized === 'مفعلة';
}

function getCompanyAvailability(company = {}) {
  const accountStatus = company.accountStatus ?? company.accountState ?? company.activationStatus ?? '';
  const operationStatus = company.status ?? company.companyStatus ?? '';
  const activeTasks = Number(company.activeTasks ?? company.currentTasks ?? 0);
  const maxCapacity = Number(company.maxCapacity ?? 0);

  if (!isActiveAccountStatus(accountStatus)) {
    const accountStatusText = normalizeText(accountStatus);

    return {
      canAssign: false,
      reason:
        accountStatusText === 'expired'
          ? 'لا يمكن تعيين البلاغ لهذه الشركة لأن دعوة التفعيل منتهية. يجب إعادة إرسال الدعوة وتفعيل الحساب أولًا.'
          : 'لا يمكن تعيين البلاغ لهذه الشركة قبل تفعيل حسابها وقبول دعوة التفعيل.',
    };
  }

  if (!isActiveStatus(operationStatus)) {
    return {
      canAssign: false,
      reason: 'لا يمكن تعيين البلاغ لشركة غير نشطة أو معطلة.',
    };
  }

  if (maxCapacity > 0 && activeTasks >= maxCapacity) {
    return {
      canAssign: false,
      reason: `لا يمكن تعيين البلاغ لهذه الشركة لأن الحد الأقصى للمهام مكتمل (${activeTasks}/${maxCapacity}).`,
    };
  }

  return {
    canAssign: true,
    reason: '',
  };
}

function AdminCompanyAssignmentPanel({ report, onAssigned, allowReassignment = false }) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCheckingCompany, setIsCheckingCompany] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    if (!isConfirmOpen || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isConfirmOpen]);

  const reportCategoryId = useMemo(() => getReportCategoryId(report), [report]);
  const reportCategoryLabel = useMemo(
    () => getReportCategoryLabel(report, reportCategoryId),
    [report, reportCategoryId],
  );

  const assignedCompanyName = getAssignedCompanyName(report);
  const previousCompanyId =
    report.adminDecision?.previousCompanyId ||
    report.previousCompanyId ||
    report.assignedCompanyId ||
    '';
  const previousCompanyName =
    report.adminDecision?.previousCompanyName ||
    report.previousCompanyName ||
    assignedCompanyName ||
    '';
  const reportHasExistingAssignment = hasExistingAssignment(report);
  const canReassign = allowReassignment;
  const reassignmentCompanyMessage = String(
    report.adminDecision?.adminNote ||
      report.adminDecision?.companyMessage ||
      report.reassignmentMessage ||
      '',
  ).trim();
  const isAssignmentLocked = reportHasExistingAssignment && !canReassign;

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
      excludedCompanyNames.includes(company.name) ||
      (canReassign &&
        (
          String(company.id) === String(previousCompanyId || '') ||
          company.name === previousCompanyName ||
          String(company.id) === String(report.assignedCompanyId || '') ||
          company.name === assignedCompanyName
        ))
    );
  }

  useEffect(() => {
    let isMounted = true;

    setValidationMessage('');

    if (isAssignmentLocked) {
      setCompanies([]);
      setSelectedCompany(null);
      setErrorMessage('');
      setIsLoading(false);

      return () => {
        isMounted = false;
      };
    }

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

          return null;
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
  }, [
    assignedCompanyName,
    canReassign,
    previousCompanyId,
    previousCompanyName,
    excludedCompanyKey,
    isAssignmentLocked,
    report.assignedCompanyId,
    report.id,
    reportCategoryId,
    reportCategoryLabel,
    searchTerm,
  ]);

  const currentCompanyLabel = assignedCompanyName || 'لم يتم التعيين بعد';

  function handleSelectCompany(company) {
    setValidationMessage('');
    setSelectedCompany(company);
  }

  async function validateSelectedCompanyBeforeAssignment() {
    if (!selectedCompany) {
      return {
        canAssign: false,
        reason: 'برجاء اختيار شركة أولًا قبل تأكيد التعيين.',
      };
    }

    const localAvailability = getCompanyAvailability(selectedCompany);

    if (!localAvailability.canAssign) {
      return localAvailability;
    }

    try {
      const latestCompanyData = await getAdminCompanyForAssignment(selectedCompany.id);
      const latestAvailability = getCompanyAvailability(latestCompanyData);

      setCompanies((currentCompanies) => currentCompanies.map((company) => (
        company.id === latestCompanyData.id ? { ...company, ...latestCompanyData } : company
      )));
      setSelectedCompany((currentCompany) => (
        currentCompany ? { ...currentCompany, ...latestCompanyData } : latestCompanyData
      ));

      return latestAvailability;
    } catch {
      return localAvailability;
    }
  }

  function handleCloseConfirmModal() {
    if (isAssigning) return;

    setIsConfirmOpen(false);
  }

  async function handleOpenConfirmModal() {
    if (isCheckingCompany) return;

    setIsCheckingCompany(true);
    setValidationMessage('');

    const availability = await validateSelectedCompanyBeforeAssignment();

    setIsCheckingCompany(false);

    if (!availability.canAssign) {
      setValidationMessage(availability.reason);
      return;
    }

    setIsConfirmOpen(true);
  }

  async function handleConfirmAssign(event) {
    event.preventDefault();

    if (!selectedCompany) return;

    setIsAssigning(true);
    setValidationMessage('');

    const availability = await validateSelectedCompanyBeforeAssignment();

    if (!availability.canAssign) {
      setValidationMessage(availability.reason);
      setIsAssigning(false);
      setIsConfirmOpen(false);
      return;
    }

    try {
      const result = await assignCompanyToReport(report.id, {
        companyId: selectedCompany.id,
        adminNote: canReassign ? reassignmentCompanyMessage || null : adminNote,
        assignmentSource: canReassign ? 'reassignment' : 'manual',
        isReassignment: canReassign,
        previousCompanyId: previousCompanyId || null,
        companyResponseId:
          report.adminDecision?.companyResponseId ||
          report.companyResponse?.submissionId ||
          report.companyResponse?.id ||
          null,
      });

      onAssigned?.(result);
      setIsConfirmOpen(false);
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'تعذر تعيين الشركة. برجاء مراجعة حالة الشركة والمحاولة مرة أخرى.';

      setValidationMessage(apiMessage);
    } finally {
      setIsAssigning(false);
    }
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

      {isAssignmentLocked ? (
        <div className="admin-company-assignment-locked">
          <FiCheckCircle />
          <div>
            <strong>تم تعيين شركة بالفعل لهذا البلاغ.</strong>
            <p>
              الشركة المعينة حاليًا: {currentCompanyLabel}. اختيار شركة أخرى لا يُفتح إلا بعد اعتماد الأدمن لقرار إعادة الإسناد.
            </p>
          </div>
        </div>
      ) : null}

      {!isAssignmentLocked && excludedCompanyNames.length ? (
        <div className="admin-company-excluded-warning">
          <FiAlertCircle />
          <span>
            تم استبعاد {excludedCompanyNames.join('، ')} من إعادة التعيين لأنها
            أرسلت تعذر التنفيذ لهذا البلاغ.
          </span>
        </div>
      ) : null}

      {!isAssignmentLocked ? (
        <>
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
              القائمة تعرض فقط الشركات المناسبة لهذا البلاغ حسب نوع المشكلة ({reportCategoryLabel}). استخدم البحث للوصول إلى شركة محددة بسرعة.
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
                {companies.map((company) => {
                  const availability = getCompanyAvailability(company);

                  return (
                    <AdminCompanyRecommendationCard
                      key={company.id}
                      company={company}
                      availability={availability}
                      isSelected={selectedCompany?.id === company.id}
                      onSelect={handleSelectCompany}
                    />
                  );
                })}
              </div>
            ) : !errorMessage ? (
              <p className="admin-company-empty-state">
                {searchTerm.trim()
                  ? `لا توجد شركات باسم "${searchTerm.trim()}" ضمن الشركات المؤهلة لتصنيف ${reportCategoryLabel}.`
                  : `لا توجد شركات متاحة يمكنها حل مشكلة من نوع ${reportCategoryLabel}. برجاء التعاقد مع شركة لهذا التصنيف وإضافتها للنظام.`}
              </p>
            ) : null}
          </div>

          {validationMessage ? (
            <div className="admin-assignment-validation-message">
              <FiAlertCircle />
              <span>{validationMessage}</span>
            </div>
          ) : null}

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
                onClick={handleOpenConfirmModal}
                disabled={isCheckingCompany}
              >
                {isCheckingCompany ? 'جاري التحقق...' : 'تأكيد التعيين'}
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {isConfirmOpen && selectedCompany && typeof document !== 'undefined'
        ? createPortal(
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

                  {canReassign ? (
                    <div className="admin-assignment-reassignment-note">
                      <strong>ما الذي سيحدث بعد التأكيد؟</strong>
                      <p>
                        ستصل رسالة إعادة الإسناد إلى الشركة الجديدة مع البلاغ، وسيُحذف البلاغ
                        نهائيًا من قائمة وتفاصيل الشركة القديمة، ولن تُرسل أي رسالة للمستخدمين.
                      </p>
                      <p>
                        <b>الرسالة المرسلة للشركة الجديدة:</b>{' '}
                        {reassignmentCompanyMessage || 'لا توجد بيانات للعرض'}
                      </p>
                    </div>
                  ) : (
                    <label className="admin-assignment-note">
                      <span>ملاحظات للأدمن / تعليمات للشركة</span>

                      <textarea
                        value={adminNote}
                        onChange={(event) => setAdminNote(event.target.value)}
                        placeholder="اكتب أي تعليمات أو ملاحظات مطلوبة للشركة..."
                        rows={4}
                      />
                    </label>
                  )}
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
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}

export default AdminCompanyAssignmentPanel;
