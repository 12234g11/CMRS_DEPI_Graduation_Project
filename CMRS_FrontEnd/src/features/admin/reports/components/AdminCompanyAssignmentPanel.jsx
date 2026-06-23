import { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiSearch, FiX } from 'react-icons/fi';
import { adminCompanySpecializationOptions } from '../../companies/mocks/adminCompaniesMockData';
import {
    assignCompanyToReport,
    getAllCompaniesForReportAssignment,
    getRecommendedCompaniesForReport,
} from '../api/adminReportsApi';
import AdminReportFilterSelect from './AdminReportFilterSelect';
import AdminCompanyRecommendationCard from './AdminCompanyRecommendationCard';

const ASSIGNMENT_VIEWS = {
    RECOMMENDED: 'recommended',
    ALL: 'all',
};

function AdminCompanyAssignmentPanel({ report, onAssigned }) {
    const [recommendedCompanies, setRecommendedCompanies] = useState([]);
    const [allCompanies, setAllCompanies] = useState([]);
    const [activeView, setActiveView] = useState(ASSIGNMENT_VIEWS.RECOMMENDED);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('all');
    const [adminNote, setAdminNote] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        let isMounted = true;

        setIsLoading(true);

        Promise.all([
            getRecommendedCompaniesForReport(report.id),
            getAllCompaniesForReportAssignment(report.id),
        ]).then(([recommendedData, allData]) => {
            if (isMounted) {
                setRecommendedCompanies(recommendedData);
                setAllCompanies(allData);
                setSelectedCompany(recommendedData[0] || allData[0] || null);
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [report.id]);

    const activeCompanies =
        activeView === ASSIGNMENT_VIEWS.RECOMMENDED
            ? recommendedCompanies
            : allCompanies;

    const filteredCompanies = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return activeCompanies.filter((company) => {
            const matchesSearch = normalizedSearch
                ? [
                    company.name,
                    company.specialization,
                    company.description,
                    company.coverageAreas.join(' '),
                    company.specializations.join(' '),
                    company.problemTypes.join(' '),
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(normalizedSearch)
                : true;

            const matchesSpecialization =
                specializationFilter === 'all' || company.specialization === specializationFilter;

            return matchesSearch && matchesSpecialization;
        });
    }, [activeCompanies, searchTerm, specializationFilter]);

    const currentCompanyLabel =
        report.assignedCompany === 'غير معين'
            ? 'لم يتم التعيين بعد'
            : report.assignedCompany;

    function handleViewChange(nextView) {
        setActiveView(nextView);
        setSearchTerm('');
        setSpecializationFilter('all');

        const nextCompanies =
            nextView === ASSIGNMENT_VIEWS.RECOMMENDED
                ? recommendedCompanies
                : allCompanies;

        if (nextCompanies.length) {
            setSelectedCompany(nextCompanies[0]);
        }
    }

    async function handleConfirmAssign() {
        if (!selectedCompany) return;

        setIsAssigning(true);

        const result = await assignCompanyToReport(report.id, {
            companyId: selectedCompany.id,
            adminNote,
            assignmentSource:
                activeView === ASSIGNMENT_VIEWS.RECOMMENDED ? 'recommended' : 'manual',
        });

        onAssigned?.(result);
        setIsConfirmOpen(false);
        setIsAssigning(false);
    }

    return (
        <section
            id="company-assignment"
            className="admin-report-details-card admin-company-assignment-panel"
        >      <header className="admin-report-card-header">
                <div>
                    <h2>تعيين شركة صيانة</h2>
                    <p>Company Assignment</p>
                </div>
            </header>

            <div className="admin-company-assignment-current">
                <span>الشركة الحالية</span>
                <strong>{currentCompanyLabel}</strong>
            </div>

            <div className="admin-company-assignment-tabs">
                <button
                    type="button"
                    className={activeView === ASSIGNMENT_VIEWS.RECOMMENDED ? 'is-active' : ''}
                    onClick={() => handleViewChange(ASSIGNMENT_VIEWS.RECOMMENDED)}
                >
                    الشركات المقترحة
                    <span>{recommendedCompanies.length}</span>
                </button>

                <button
                    type="button"
                    className={activeView === ASSIGNMENT_VIEWS.ALL ? 'is-active' : ''}
                    onClick={() => handleViewChange(ASSIGNMENT_VIEWS.ALL)}
                >
                    كل الشركات
                    <span>{allCompanies.length}</span>
                </button>
            </div>

            <div className="admin-company-assignment-toolbar">
                <div className="admin-company-assignment-search">
                    <FiSearch />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="ابحث باسم الشركة أو التخصص أو المنطقة..."
                        aria-label="البحث في الشركات"
                    />
                </div>

                <AdminReportFilterSelect
                    value={specializationFilter}
                    options={adminCompanySpecializationOptions}
                    onChange={setSpecializationFilter}
                    ariaLabel="فلترة الشركات حسب التخصص"
                    variant="inline"
                />
            </div>

            <div className="admin-company-assignment-hint">
                <FiAlertCircle />

                {activeView === ASSIGNMENT_VIEWS.RECOMMENDED ? (
                    <span>
                        هذه الشركات مرشحة بناءً على نوع المشكلة، منطقة البلاغ، ضغط العمل، التقييم، وسرعة الاستجابة.
                    </span>
                ) : (
                    <span>
                        هذا الاختيار يعرض كل الشركات المتاحة. يمكن للأدمن اختيار شركة يدويًا حتى لو لم تكن ضمن الأعلى مطابقة.
                    </span>
                )}
            </div>

            <div className="admin-company-recommendations">
                <div className="admin-company-recommendations__title">
                    <h3>
                        {activeView === ASSIGNMENT_VIEWS.RECOMMENDED
                            ? 'الشركات المقترحة لهذا البلاغ'
                            : 'كل الشركات المتاحة'}
                    </h3>

                    <span>{filteredCompanies.length} شركة</span>
                </div>

                {isLoading ? (
                    <p className="admin-company-empty-state">جاري تحميل الشركات...</p>
                ) : filteredCompanies.length ? (
                    <div className="admin-company-recommendations__grid">
                        {filteredCompanies.map((company, index) => (
                            <AdminCompanyRecommendationCard
                                key={company.id}
                                company={company}
                                isTopRecommended={
                                    activeView === ASSIGNMENT_VIEWS.RECOMMENDED &&
                                    index === 0 &&
                                    company.matchScore >= 80
                                }
                                isSelected={selectedCompany?.id === company.id}
                                onSelect={setSelectedCompany}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="admin-company-empty-state">
                        لا توجد شركات مطابقة للبحث أو الفلترة الحالية.
                    </p>
                )}
            </div>

            {selectedCompany ? (
                <div className="admin-selected-company-summary">
                    <div>
                        <span>
                            {activeView === ASSIGNMENT_VIEWS.RECOMMENDED
                                ? 'الشركة المختارة من المقترحات'
                                : 'الشركة المختارة يدويًا'}
                        </span>

                        <strong>{selectedCompany.name}</strong>

                        <p>
                            {selectedCompany.specialization} - مطابقة {selectedCompany.matchScore}%
                        </p>
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
                    <div className="admin-assignment-modal" role="dialog" aria-modal="true">
                        <button
                            type="button"
                            className="admin-assignment-modal__close"
                            onClick={() => setIsConfirmOpen(false)}
                            aria-label="إغلاق"
                        >
                            <FiX />
                        </button>

                        <div className="admin-assignment-modal__icon">
                            <FiCheckCircle />
                        </div>

                        <h3>تأكيد تعيين الشركة</h3>

                        <div className="admin-assignment-confirm-info">
                            <p>
                                <span>البلاغ</span>
                                <strong>#{report.id} - {report.type}</strong>
                            </p>

                            <p>
                                <span>الشركة</span>
                                <strong>{selectedCompany.name}</strong>
                            </p>

                            <p>
                                <span>طريقة الاختيار</span>
                                <strong>
                                    {activeView === ASSIGNMENT_VIEWS.RECOMMENDED
                                        ? 'اختيار من الشركات المقترحة'
                                        : 'اختيار يدوي من كل الشركات'}
                                </strong>
                            </p>

                            <p>
                                <span>نسبة المطابقة</span>
                                <strong>{selectedCompany.matchScore}%</strong>
                            </p>

                            <p>
                                <span>سبب الترشيح / الملاحظة</span>
                                <strong>{selectedCompany.matchReasons[0]}</strong>
                            </p>
                        </div>

                        {activeView === ASSIGNMENT_VIEWS.ALL && selectedCompany.matchScore < 70 ? (
                            <div className="admin-assignment-warning">
                                <FiAlertCircle />
                                <span>
                                    الشركة المختارة ليست من أعلى الشركات مطابقة لهذا البلاغ. يفضل إضافة سبب واضح في الملاحظات.
                                </span>
                            </div>
                        ) : null}

                        <label className="admin-assignment-note">
                            ملاحظات للأدمن / تعليمات للشركة
                            <textarea
                                value={adminNote}
                                onChange={(event) => setAdminNote(event.target.value)}
                                placeholder="مثال: تم اختيار هذه الشركة يدويًا لأنها متاحة حاليًا أو بناءً على توجيه الإدارة..."
                                rows={4}
                            />
                        </label>

                        <div className="admin-assignment-modal__actions">
                            <button
                                type="button"
                                className="admin-assignment-cancel-btn"
                                onClick={() => setIsConfirmOpen(false)}
                            >
                                إلغاء
                            </button>

                            <button
                                type="button"
                                className="admin-assignment-submit-btn"
                                onClick={handleConfirmAssign}
                                disabled={isAssigning}
                            >
                                {isAssigning ? 'جاري التعيين...' : 'تأكيد التعيين'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

export default AdminCompanyAssignmentPanel;