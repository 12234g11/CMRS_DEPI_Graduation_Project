import { useEffect, useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useAuth } from '../../../auth/hooks/useAuth';
import {
  changeAdminCompanyStatus,
  createAdminCompany,
  getAdminCompanies,
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
import { adminCompanies } from '../mocks/adminCompaniesMockData';
import '../admin-companies.css';

const DEFAULT_ADMIN_GOVERNORATE = 'القاهرة';

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

  const [companies, setCompanies] = useState(adminCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');

  const [formMode, setFormMode] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailsCompany, setDetailsCompany] = useState(null);
  const [statusCompany, setStatusCompany] = useState(null);
  const [inviteData, setInviteData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getAdminCompanies().then((data) => {
      if (isMounted) {
        setCompanies(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const adminGovernorateCompanies = useMemo(() => {
    return companies.filter((company) => {
      const governorates = company.governorates?.length
        ? company.governorates
        : [company.governorate].filter(Boolean);

      return governorates.includes(adminGovernorate);
    });
  }, [adminGovernorate, companies]);

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return adminGovernorateCompanies.filter((company) => {
      const governorates = company.governorates?.length
        ? company.governorates
        : [company.governorate].filter(Boolean);

      const searchTarget = [
        company.name,
        company.code,
        company.email,
        company.specialization,
        governorates.join(' '),
        company.specializations?.join(' '),
        company.managerName,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = normalizedSearch
        ? searchTarget.includes(normalizedSearch)
        : true;

      const matchesStatus =
        statusFilter === 'all' || company.status === statusFilter;

      const matchesSpecialization =
        specializationFilter === 'all' ||
        company.specialization === specializationFilter;

      return matchesSearch && matchesStatus && matchesSpecialization;
    });
  }, [
    adminGovernorateCompanies,
    searchTerm,
    specializationFilter,
    statusFilter,
  ]);

  function handleOpenAddModal() {
    setSelectedCompany(null);
    setFormMode('add');
  }

  function handleOpenEditModal(company) {
    setSelectedCompany(company);
    setDetailsCompany(null);
    setFormMode('edit');
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

      setCompanies((currentCompanies) => [
        result.company,
        ...currentCompanies,
      ]);

      setInviteData(result);
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
  }

  async function handleResendInvitation(company) {
    const result = await resendCompanyInvitation(company);

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

      <AdminCompaniesStatsCards companies={adminGovernorateCompanies} />

      <section className="admin-companies-card">
        <AdminCompaniesToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          specializationFilter={specializationFilter}
          onSpecializationChange={setSpecializationFilter}
        />

        <AdminCompaniesTable
          companies={filteredCompanies}
          onView={setDetailsCompany}
          onEdit={handleOpenEditModal}
          onToggleStatus={setStatusCompany}
          onResendInvitation={handleResendInvitation}
        />
      </section>

      {formMode ? (
        <AdminCompanyFormModal
          mode={formMode}
          company={selectedCompany}
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