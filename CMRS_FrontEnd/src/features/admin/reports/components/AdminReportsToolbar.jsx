import { FiFilter, FiSearch } from 'react-icons/fi';
import AdminReportFilterSelect from './AdminReportFilterSelect';

const statusOptions = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'قيد المراجعة', label: 'قيد المراجعة' },
  { value: 'مقبول', label: 'مقبول' },
  { value: 'تم التعيين', label: 'تم التعيين' },
  { value: 'جاري الحل', label: 'جاري الحل' },
  { value: 'بانتظار مراجعة الأدمن', label: 'بانتظار مراجعة الأدمن' },
  { value: 'مطلوب استكمال', label: 'مطلوب استكمال' },
  { value: 'بانتظار إعادة التعيين', label: 'بانتظار إعادة التعيين' },
  { value: 'متعذر التنفيذ', label: 'متعذر التنفيذ' },
  { value: 'مرفوض', label: 'مرفوض' },
  { value: 'تم الحل', label: 'تم الحل' },
];

const priorityOptions = [
  { value: 'all', label: 'كل الأولويات' },
  { value: 'عالية', label: 'عالية' },
  { value: 'متوسطة', label: 'متوسطة' },
  { value: 'منخفضة', label: 'منخفضة' },
];

function AdminReportsToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
}) {
  return (
    <div className="admin-reports-toolbar admin-manage-reports-toolbar">
      <div className="admin-reports-search admin-manage-reports-search">
        <FiSearch />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ابحث عن بلاغ أو شركة أو منطقة..."
          aria-label="البحث في البلاغات"
        />
      </div>

      <AdminReportFilterSelect
        value={statusFilter}
        options={statusOptions}
        onChange={onStatusChange}
        ariaLabel="فلترة البلاغات حسب الحالة"
      />

      <AdminReportFilterSelect
        value={priorityFilter}
        options={priorityOptions}
        onChange={onPriorityChange}
        ariaLabel="فلترة البلاغات حسب الأولوية"
      />

      <button
        type="button"
        className="admin-filter-btn admin-manage-reports-filter-btn"
        aria-label="تطبيق الفلاتر"
      >
        <FiFilter />
      </button>
    </div>
  );
}

export default AdminReportsToolbar;