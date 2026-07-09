import { useEffect, useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useAuth } from '../../../auth/hooks/useAuth';
import {
  changeAdminCompanyStatus,
  createAdminCompany,
  getAdminCompanies,
  getAdminCompanyById,
  getAdminCompanyOptions,
  resendCompanyInvitation,
  updateAdminCompany,
} from '../api/adminCompaniesApi';
import AdminCompaniesStatsCards from '../components/AdminCompaniesStatsCards';
import AdminCompaniesTable from '../components/AdminCompaniesTable';
import AdminCompaniesToolbar from '../components/AdminCompaniesToolbar';
import AdminCompanyDetailsModal from '../components/AdminCompanyDetailsModal';
import AdminCompanyFormModal from '../components/AdminCompanyFormModal';
import AdminCompanyInviteModal from '../components/AdminCompanyInviteModal';
import AdminCompanyStatusModal from '../components/AdminCompanyStatusModal';
import '../admin-companies.css';

const DEFAULT_ADMIN_GOVERNORATE = 'القاهرة';

const DEFAULT_COMPANY_OPTIONS = {
  statuses: [{ value: 'all', label: 'كل الحالات' }],
  accountStatuses: [{ value: 'all', label: 'كل حالات الحساب' }],
  governorates: [{ value: 'all', label: 'كل المحافظات' }],
  specializations: [{ value: 'all', label: 'كل الخدمات' }],
};

const GOVERNORATE_VALUE_TO_LABEL = {
  cairo: 'القاهرة',
  giza: 'الجيزة',
  qalyubia: 'القليوبية',
  القاهره: 'القاهرة',
  القاهرة: 'القاهرة',
  الجيزة: 'الجيزة',
  الجيزه: 'الجيزة',
  القليوبية: 'القليوبية',
  القليوبيه: 'القليوبية',
};

function getAdminGovernorate(user) {
  const rawGovernorate =
    user?.governorateLabel ||
    user?.governorate ||
    user?.assignedGovernorate ||
    user?.city ||
    DEFAULT_ADMIN_GOVERNORATE;

  return GOVERNORATE_VALUE_TO_LABEL[rawGovernorate] || rawGovernorate;
}

function AdminCompaniesPage() {
  const { user } = useAuth();

  const adminGovernorate = getAdminGovernorate(user);

  const [companies, setCompanies] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [companyOptions, setCompanyOptions] = useState(DEFAULT_COMPANY_OPTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formMode, setFormMode] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailsCompany, setDetailsCompany] = useState(null);
  const [statusCompany, setStatusCompany] = useState(null);
  const [inviteData, setInviteData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getAdminCompanyOptions()
      .then((options) => {
        if (isMounted) {
          setCompanyOptions(options);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCompanyOptions(DEFAULT_COMPANY_OPTIONS);
        }
      })
      .finally(() => {
        if (isMounted) {
          setOptionsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, specializationFilter]);

  useEffect(() => {
    if (!optionsLoaded) {
      return;
    }

    let isMounted = true;

    setIsLoading(true);
    setErrorMessage('');

    getAdminCompanies({
      governorate: adminGovernorate,
      status: statusFilter,
      specialization: specializationFilter,
      search: searchTerm.trim(),
      page,
      pageSize,
    })
      .then((payload) => {
        if (!isMounted) return;

        setCompanies(payload.items);
        setSummary(payload.summary);
        setPagination(payload.pagination);
      })
      .catch(() => {
        if (!isMounted) return;

        setCompanies([]);
        setSummary(null);
        setPagination({ page: 1, pageSize, totalItems: 0, totalPages: 1 });
        setErrorMessage('تعذر تحميل الشركات من الخادم. برجاء المحاولة مرة أخرى.');
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
    adminGovernorate,
    optionsLoaded,
    page,
    pageSize,
    refreshKey,
    searchTerm,
    specializationFilter,
    statusFilter,
  ]);

  const formGovernorateOptions = useMemo(() => {
    return companyOptions.governorates?.filter((option) => option.value !== 'all') || [];
  }, [companyOptions.governorates]);

  const formSpecializationOptions = useMemo(() => {
    return companyOptions.specializations?.filter((option) => option.value !== 'all') || [];
  }, [companyOptions.specializations]);

  const filterSpecializationOptions = useMemo(() => {
    const options = companyOptions.specializations || [];

    return options.map((option) =>
      option.value === 'all'
        ? option
        : {
            ...option,
            value: option.label,
          },
    );
  }, [companyOptions.specializations]);

  function handleOpenAddModal() {
    setSelectedCompany(null);
    setFormMode('add');
    setSuccessMessage('');
  }

  async function handleOpenEditModal(company) {
    setDetailsCompany(null);
    setSuccessMessage('');

    try {
      const fullCompany = await getAdminCompanyById(company.id);
      setSelectedCompany(fullCompany);
    } catch {
      setSelectedCompany(company);
    }

    setFormMode('edit');
  }

  async function handleOpenDetailsModal(company) {
    setSuccessMessage('');

    try {
      const fullCompany = await getAdminCompanyById(company.id);
      setDetailsCompany(fullCompany);
    } catch {
      setDetailsCompany(company);
    }
  }

  async function handleSubmitCompany(payload) {
    const payloadWithAdminGovernorate = {
      ...payload,
      governorates: payload.governorates?.length
        ? payload.governorates
        : [adminGovernorate],
      governorate: payload.governorate || adminGovernorate,
      coverageAreas: payload.coverageAreas?.length
        ? payload.coverageAreas
        : [adminGovernorate],
    };

    if (formMode === 'add') {
      const result = await createAdminCompany(payloadWithAdminGovernorate);

      setSuccessMessage(
        result?.message || 'تم إنشاء حساب الشركة وإرسال دعوة التفعيل بنجاح.',
      );

      if (result?.inviteUrl) {
        setInviteData({
          company: result.company,
          account: result.account,
          inviteUrl: result.inviteUrl,
          invitationExpiresAt: result.invitationExpiresAt,
        });
      }

      setRefreshKey((current) => current + 1);
    }

    if (formMode === 'edit' && selectedCompany) {
      const updatedCompany = await updateAdminCompany(selectedCompany.id, {
        ...selectedCompany,
        ...payloadWithAdminGovernorate,
      });

      setCompanies((currentCompanies) =>
        currentCompanies.map((company) =>
          company.id === selectedCompany.id
            ? {
                ...company,
                ...updatedCompany,
              }
            : company,
        ),
      );

      setSuccessMessage('تم تحديث بيانات الشركة بنجاح.');
    }

    setFormMode(null);
    setSelectedCompany(null);
  }

  async function handleConfirmStatusChange({ company, reason, nextStatus }) {
    const result = await changeAdminCompanyStatus(company.id, {
      status: nextStatus,
      reason,
    });

    setCompanies((currentCompanies) =>
      currentCompanies.map((item) =>
        item.id === company.id
          ? {
              ...item,
              status: result.status,
              lastStatusReason: result.lastStatusReason,
            }
          : item,
      ),
    );

    setStatusCompany(null);
    setSuccessMessage('تم تغيير حالة الشركة بنجاح.');
  }

  async function handleResendInvitation(company) {
    const result = await resendCompanyInvitation(company.id);

    setCompanies((currentCompanies) =>
      currentCompanies.map((item) =>
        item.id === company.id
          ? {
              ...item,
              accountStatus: result.accountStatus,
              inviteUrl: result.inviteUrl,
              invitationExpiresAt: result.invitationExpiresAt,
            }
          : item,
      ),
    );

    setInviteData({
      company: {
        ...company,
        accountStatus: result.accountStatus,
        inviteUrl: result.inviteUrl,
        invitationExpiresAt: result.invitationExpiresAt,
      },
      account: {
        id: `account-${company.id}`,
        companyId: company.id,
        email: company.email,
        role: 'company',
        accountStatus: result.accountStatus,
        mustSetPassword: true,
      },
      inviteUrl: result.inviteUrl,
      invitationExpiresAt: result.invitationExpiresAt,
    });
  }

  return (
    <div className="dashboard-page admin-companies-page">
      <section className="admin-companies-hero">
        <div>
          <h1>الشركات</h1>
          <p>
            Maintenance Companies - إدارة شركات الصيانة داخل محافظة {adminGovernorate}
          </p>
        </div>

        <button
          type="button"
          className="admin-add-company-btn"
          onClick={handleOpenAddModal}
        >
          <FiPlus />
          إضافة شركة
        </button>
      </section>

      {successMessage ? (
        <div className="admin-company-page-message admin-company-page-message--success">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="admin-company-page-message admin-company-page-message--error">
          {errorMessage}
        </div>
      ) : null}

      <AdminCompaniesStatsCards companies={companies} summary={summary} />

      <section className="admin-companies-card">
        <AdminCompaniesToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          specializationFilter={specializationFilter}
          onSpecializationChange={setSpecializationFilter}
          statusOptions={companyOptions.statuses}
          specializationOptions={filterSpecializationOptions}
        />

        {isLoading ? (
          <div className="admin-companies-empty">جاري تحميل الشركات...</div>
        ) : (
          <AdminCompaniesTable
            companies={companies}
            onView={handleOpenDetailsModal}
            onEdit={handleOpenEditModal}
            onToggleStatus={setStatusCompany}
            onResendInvitation={handleResendInvitation}
          />
        )}

        <div className="admin-companies-pagination">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            disabled={page <= 1 || isLoading}
          >
            السابق
          </button>

          <span>
            صفحة {pagination.page || page} من {pagination.totalPages || 1} - إجمالي{' '}
            {pagination.totalItems || 0} شركة
          </span>

          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(current + 1, pagination.totalPages || 1))
            }
            disabled={page >= (pagination.totalPages || 1) || isLoading}
          >
            التالي
          </button>
        </div>
      </section>

      {formMode ? (
        <AdminCompanyFormModal
          mode={formMode}
          company={selectedCompany}
          governorateOptions={formGovernorateOptions}
          specializationOptions={formSpecializationOptions}
          defaultGovernorate={adminGovernorate}
          onClose={() => {
            setFormMode(null);
            setSelectedCompany(null);
          }}
          onSubmit={handleSubmitCompany}
        />
      ) : null}

      {detailsCompany ? (
        <AdminCompanyDetailsModal
          company={detailsCompany}
          onClose={() => setDetailsCompany(null)}
          onEdit={handleOpenEditModal}
        />
      ) : null}

      {statusCompany ? (
        <AdminCompanyStatusModal
          company={statusCompany}
          onClose={() => setStatusCompany(null)}
          onConfirm={handleConfirmStatusChange}
        />
      ) : null}

      {inviteData ? (
        <AdminCompanyInviteModal
          inviteData={inviteData}
          onClose={() => setInviteData(null)}
        />
      ) : null}
    </div>
  );
}

export default AdminCompaniesPage;
