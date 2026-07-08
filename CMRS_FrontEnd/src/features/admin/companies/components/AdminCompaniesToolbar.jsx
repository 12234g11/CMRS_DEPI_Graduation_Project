import { FiSearch } from 'react-icons/fi';
import AdminReportFilterSelect from '../../reports/components/AdminReportFilterSelect';

function AdminCompaniesToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  specializationFilter,
  onSpecializationChange,
  statusOptions = [],
  specializationOptions = [],
}) {
  return (
    <div className="admin-companies-toolbar">
      <div className="admin-companies-search">
        <FiSearch />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ابحث باسم الشركة أو الخدمة..."
          aria-label="البحث في الشركات"
        />
      </div>

      <AdminReportFilterSelect
        value={specializationFilter}
        options={specializationOptions}
        onChange={onSpecializationChange}
        ariaLabel="فلترة حسب الخدمة"
        variant="overlay"
      />

      <AdminReportFilterSelect
        value={statusFilter}
        options={statusOptions}
        onChange={onStatusChange}
        ariaLabel="فلترة حسب الحالة"
        variant="overlay"
      />
    </div>
  );
}

export default AdminCompaniesToolbar;
