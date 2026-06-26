import {
  FiEdit3,
  FiEye,
  FiPauseCircle,
  FiPlayCircle,
  FiRefreshCw,
  FiUsers,
} from 'react-icons/fi';

function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}

function getPerformanceTone(performance) {
  if (!hasValue(performance)) return 'neutral';
  if (performance >= 85) return 'success';
  if (performance >= 70) return 'warning';
  return 'danger';
}

function getAccountStatusLabel(status) {
  if (status === 'active') return 'مفعل';
  if (status === 'expired') return 'الدعوة منتهية';
  return 'بانتظار التفعيل';
}

function AdminCompaniesTable({
  companies = [],
  onView,
  onEdit,
  onToggleStatus,
  onResendInvitation,
}) {
  return (
    <div className="admin-companies-table-wrap">
      <table className="admin-companies-table">
        <thead>
          <tr>
            <th>اسم الشركة</th>
            <th>نوع الخدمة</th>
            <th>المحافظات</th>
            <th>حالة حساب الدخول</th>
            <th>المهام النشطة</th>
            <th>المهام المكتملة</th>
            <th>متوسط وقت الحل</th>
            <th>الأداء</th>
            <th>حالة التشغيل</th>
            <th>الإجراءات</th>
          </tr>
        </thead>

        <tbody>
          {companies.length ? (
            companies.map((company) => {
              const performanceTone = getPerformanceTone(company.performance);
              const isActive = company.status === 'active';
              const governorates = company.governorates?.length
                ? company.governorates.join('، ')
                : company.governorate;

              const canResendInvite =
                company.accountStatus === 'invited' ||
                company.accountStatus === 'expired';

              return (
                <tr key={company.id}>
                  <td>
                    <div className="admin-company-name-cell">
                      <span>
                        <FiUsers />
                      </span>

                      <div>
                        <strong>{company.name}</strong>
                        <small>{company.code}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="admin-company-service-pill">
                      {company.specialization}
                    </span>
                  </td>

                  <td>{governorates}</td>

                  <td>
                    <span
                      className={`admin-company-account-status admin-company-account-status--${company.accountStatus}`}
                    >
                      {getAccountStatusLabel(company.accountStatus)}
                    </span>
                  </td>

                  <td>
                    <strong className="admin-company-number">
                      {company.activeTasks}
                    </strong>
                  </td>

                  <td>
                    <strong className="admin-company-number">
                      {company.completedTasks}
                    </strong>
                  </td>

                  <td>
                    {hasValue(company.avgResponseHours) ? (
                      <>
                        <strong>{company.avgResponseHours}</strong>
                        <small className="admin-company-muted"> ساعة</small>
                      </>
                    ) : (
                      <span className="admin-company-no-data">لا توجد بيانات بعد</span>
                    )}
                  </td>

                  <td>
                    {hasValue(company.performance) ? (
                      <div className={`admin-company-performance admin-company-performance--${performanceTone}`}>
                        <div>
                          <strong>{company.performance}%</strong>
                          <span>
                            {performanceTone === 'success'
                              ? 'ممتاز'
                              : performanceTone === 'warning'
                                ? 'جيد'
                                : 'ضعيف'}
                          </span>
                        </div>

                        <div className="admin-company-performance__bar">
                          <span style={{ width: `${company.performance}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="admin-company-no-data">لا توجد بيانات بعد</span>
                    )}
                  </td>

                  <td>
                    <span
                      className={`admin-company-status admin-company-status--${
                        isActive ? 'active' : 'disabled'
                      }`}
                    >
                      {isActive ? 'نشطة' : 'غير نشطة'}
                    </span>
                  </td>

                  <td>
                    <div className="admin-company-actions">
                      <button
                        type="button"
                        className="admin-company-action-btn admin-company-action-btn--view"
                        onClick={() => onView(company)}
                      >
                        <FiEye />
                        عرض
                      </button>

                      <button
                        type="button"
                        className="admin-company-action-btn admin-company-action-btn--edit"
                        onClick={() => onEdit(company)}
                      >
                        <FiEdit3 />
                        تعديل
                      </button>

                      {canResendInvite ? (
                        <button
                          type="button"
                          className="admin-company-action-btn admin-company-action-btn--invite"
                          onClick={() => onResendInvitation(company)}
                        >
                          <FiRefreshCw />
                          دعوة
                        </button>
                      ) : null}

                      <button
                        type="button"
                        className={`admin-company-action-btn ${
                          isActive
                            ? 'admin-company-action-btn--disable'
                            : 'admin-company-action-btn--activate'
                        }`}
                        onClick={() => onToggleStatus(company)}
                      >
                        {isActive ? <FiPauseCircle /> : <FiPlayCircle />}
                        {isActive ? 'تعطيل' : 'تفعيل'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="10">
                <div className="admin-companies-empty">
                  لا توجد شركات مطابقة للبحث أو الفلاتر الحالية.
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminCompaniesTable;