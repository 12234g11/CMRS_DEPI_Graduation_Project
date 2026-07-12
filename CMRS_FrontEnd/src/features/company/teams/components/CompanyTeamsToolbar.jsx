import { FiFilter, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import CompanyTeamsFilterSelect from './CompanyTeamsFilterSelect';
import {
  companyTeamAvailabilityOptions,
  companyTeamStatusOptions,
} from '../mocks/companyTeamsMockData';

function CompanyTeamsToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  availabilityFilter,
  onAvailabilityChange,
  onReset,
  onAddTeam,
  isDisabled = false,
}) {
  return (
    <div className="company-teams-toolbar company-teams-toolbar--desktop">
      <div className="company-teams-search">
        <FiSearch />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ابحث باسم الفرقة أو القائد..."
          aria-label="البحث في فرق الصيانة"
        />
      </div>

      <CompanyTeamsFilterSelect
        value={statusFilter}
        options={companyTeamStatusOptions}
        onChange={onStatusChange}
        ariaLabel="فلترة حسب الحالة"
      />

      <CompanyTeamsFilterSelect
        value={availabilityFilter}
        options={companyTeamAvailabilityOptions}
        onChange={onAvailabilityChange}
        ariaLabel="فلترة حسب التوفر"
      />

      <button
        type="button"
        className="company-teams-toolbar__filter-btn"
        aria-label="الفلاتر"
      >
        <FiFilter />
      </button>

      <button
        type="button"
        className="company-teams-toolbar__reset-btn"
        onClick={onReset}
      >
        <FiX />
        مسح
      </button>

      <button
        type="button"
        className="company-teams-toolbar__add-btn"
        onClick={onAddTeam}
        disabled={isDisabled}
      >
        <FiPlus />
        إضافة فرقة
      </button>
    </div>
  );
}

export default CompanyTeamsToolbar;