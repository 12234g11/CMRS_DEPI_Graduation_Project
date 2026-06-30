import { useEffect, useMemo, useState } from 'react';
import {
  FiFilter,
  FiPlus,
  FiSearch,
  FiSliders,
  FiX,
} from 'react-icons/fi';
import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import {
  createCompanyTeam,
  getCompanyTeamsData,
  updateCompanyTeam,
  updateCompanyTeamStatus,
} from '../api/companyTeamsApi';
import CompanyTeamDetailsModal from '../components/CompanyTeamDetailsModal';
import CompanyTeamFormModal from '../components/CompanyTeamFormModal';
import CompanyTeamsFilterSelect from '../components/CompanyTeamsFilterSelect';
import CompanyTeamsStatsCards from '../components/CompanyTeamsStatsCards';
import CompanyTeamsTable from '../components/CompanyTeamsTable';
import CompanyTeamsToolbar from '../components/CompanyTeamsToolbar';
import CompanyTeamStatusModal from '../components/CompanyTeamStatusModal';
import {
  companyTeamAvailabilityOptions,
  companyTeams,
  companyTeamStatusOptions,
  getCompanyTeamsStats,
} from '../mocks/companyTeamsMockData';
import '../company-teams.css';

function CompanyTeamsPage() {
  const [teams, setTeams] = useState(companyTeams);
  const [stats, setStats] = useState(getCompanyTeamsStats(companyTeams));

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [formMode, setFormMode] = useState(null);
  const [formTeam, setFormTeam] = useState(null);
  const [detailsTeam, setDetailsTeam] = useState(null);
  const [statusTeam, setStatusTeam] = useState(null);

  const isFormModalOpen = formMode === 'create' || formMode === 'edit';

  useEffect(() => {
    let isMounted = true;

    getCompanyTeamsData().then((data) => {
      if (!isMounted) return;

      setTeams(data.teams);
      setStats(data.stats);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (searchTerm.trim()) count += 1;
    if (statusFilter !== 'all') count += 1;
    if (availabilityFilter !== 'all') count += 1;

    return count;
  }, [availabilityFilter, searchTerm, statusFilter]);

  const filteredTeams = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return teams.filter((team) => {
      const matchesSearch = normalizedSearch
        ? [
            team.name,
            team.leadName,
            team.phone,
            team.statusLabel,
            team.availabilityLabel,
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      const matchesStatus =
        statusFilter === 'all' || team.status === statusFilter;

      const matchesAvailability =
        availabilityFilter === 'all' || team.availability === availabilityFilter;

      return matchesSearch && matchesStatus && matchesAvailability;
    });
  }, [availabilityFilter, searchTerm, statusFilter, teams]);

  function syncTeamsData(data) {
    setTeams(data.teams);
    setStats(data.stats);
  }

  function handleResetFilters() {
    setSearchTerm('');
    setStatusFilter('all');
    setAvailabilityFilter('all');
  }

  function handleApplyFilters() {
    setIsFiltersOpen(false);
  }

  function handleAddTeam() {
    setFormMode('create');
    setFormTeam(null);
    setDetailsTeam(null);
  }

  function handleEditTeam(team) {
    setFormMode('edit');
    setFormTeam(team);
    setDetailsTeam(null);
  }

  function handleCloseFormModal() {
    setFormMode(null);
    setFormTeam(null);
  }

  async function handleSaveTeam(payload) {
    if (formMode === 'edit' && formTeam) {
      const data = await updateCompanyTeam(formTeam.id, payload);
      syncTeamsData(data);
    } else {
      const data = await createCompanyTeam(payload);
      syncTeamsData(data);
    }

    handleCloseFormModal();
  }

  async function handleConfirmStatus(team, nextStatus) {
    const data = await updateCompanyTeamStatus(team.id, nextStatus);
    syncTeamsData(data);
    setStatusTeam(null);
  }

  return (
    <div className="dashboard-page company-teams-page">
      <PageHeader
        title="فرق الصيانة"
        subtitle="Company Teams - إدارة فرق الصيانة التابعة للشركة"
      />

      <CompanyTeamsStatsCards stats={stats} />

      <section className="company-teams-filter-card">
        <div className="company-teams-filter-card__header">
          <div>
            <h2>فلترة فرق الصيانة</h2>
            <p>
              يتم عرض {filteredTeams.length} فرقة من إجمالي {teams.length} فرقة.
            </p>
          </div>

          <div className="company-teams-filter-card__actions">
            <button
              type="button"
              className="company-teams-filter-card__reset-btn"
              onClick={handleResetFilters}
            >
              <FiX />
              مسح الفلاتر
            </button>

            <button
              type="button"
              className="company-teams-filter-card__add-btn"
              onClick={handleAddTeam}
            >
              <FiPlus />
              إضافة فرقة
            </button>
          </div>
        </div>

        <div className="company-teams-filter-card__body">
          <CompanyTeamsToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            availabilityFilter={availabilityFilter}
            onAvailabilityChange={setAvailabilityFilter}
            onReset={handleResetFilters}
            onAddTeam={handleAddTeam}
          />

          <div className="company-teams-filter-card__mobile-actions">
            <button
              type="button"
              className="company-teams-open-filters-btn"
              onClick={() => setIsFiltersOpen(true)}
            >
              <FiSliders />
              الفلاتر
              {activeFiltersCount ? <span>{activeFiltersCount}</span> : null}
            </button>

            <button
              type="button"
              className="company-teams-filter-card__add-btn"
              onClick={handleAddTeam}
            >
              <FiPlus />
              إضافة فرقة
            </button>
          </div>
        </div>
      </section>

      <DashboardSectionCard
        title="فرق الصيانة"
        subtitle="Maintenance Teams"
        className="company-teams-card"
      >
        <CompanyTeamsTable
          teams={filteredTeams}
          onViewTeam={setDetailsTeam}
          onEditTeam={handleEditTeam}
          onChangeStatus={setStatusTeam}
        />
      </DashboardSectionCard>

      {isFiltersOpen ? (
        <div className="company-teams-filters-backdrop">
          <section
            className="company-teams-filters-panel"
            role="dialog"
            aria-modal="true"
          >
            <header className="company-teams-filters-panel__header">
              <button
                type="button"
                className="company-teams-filters-panel__close"
                onClick={() => setIsFiltersOpen(false)}
                aria-label="إغلاق الفلاتر"
              >
                <FiX />
              </button>

              <div>
                <h2>فلترة فرق الصيانة</h2>
                <p>ابحث أو فلتر حسب حالة التشغيل أو التوفر.</p>
              </div>
            </header>

            <div className="company-teams-filters-panel__body">
              <div className="company-teams-search company-teams-search--panel">
                <FiSearch />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ابحث باسم الفرقة أو القائد..."
                  aria-label="البحث في فرق الصيانة"
                />
              </div>

              <CompanyTeamsFilterSelect
                value={statusFilter}
                options={companyTeamStatusOptions}
                onChange={setStatusFilter}
                ariaLabel="فلترة حسب الحالة"
              />

              <CompanyTeamsFilterSelect
                value={availabilityFilter}
                options={companyTeamAvailabilityOptions}
                onChange={setAvailabilityFilter}
                ariaLabel="فلترة حسب التوفر"
              />
            </div>

            <footer className="company-teams-filters-panel__actions">
              <button
                type="button"
                className="company-teams-filter-apply-btn"
                onClick={handleApplyFilters}
              >
                <FiFilter />
                تطبيق الفلاتر
              </button>

              <button
                type="button"
                className="company-teams-filter-reset-btn"
                onClick={handleResetFilters}
              >
                <FiX />
                مسح الفلاتر
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      <CompanyTeamFormModal
        isOpen={isFormModalOpen}
        mode={formMode || 'create'}
        team={formTeam}
        onClose={handleCloseFormModal}
        onSave={handleSaveTeam}
      />

      <CompanyTeamDetailsModal
        team={detailsTeam}
        onClose={() => setDetailsTeam(null)}
        onEditTeam={handleEditTeam}
      />

      <CompanyTeamStatusModal
        team={statusTeam}
        onClose={() => setStatusTeam(null)}
        onConfirm={handleConfirmStatus}
      />
    </div>
  );
}

export default CompanyTeamsPage;