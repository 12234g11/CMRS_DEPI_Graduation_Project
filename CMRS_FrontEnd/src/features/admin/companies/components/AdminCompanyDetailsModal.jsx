import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiStar,
  FiUser,
  FiX,
} from 'react-icons/fi';

function getAccountStatusLabel(status) {
  if (status === 'active') return 'مفعل';
  if (status === 'expired') return 'الدعوة منتهية';
  return 'بانتظار التفعيل';
}

function AdminCompanyDetailsModal({ company, onClose, onEdit }) {
  if (!company) return null;

  const isActive = company.status === 'active';
  const governorates = company.governorates?.length
    ? company.governorates
    : [company.governorate].filter(Boolean);
  const specializations = company.specializations || [];
  const problemTypes = company.problemTypes || [];

  return (
    <div className="admin-company-modal-backdrop" role="presentation">
      <div className="admin-company-details-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="admin-company-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <header className="admin-company-details-header">
          <div>
            <h2>{company.name}</h2>
            <p>{company.specialization}</p>
          </div>

          <div className="admin-company-details-statuses">
            <span
              className={`admin-company-status admin-company-status--${
                isActive ? 'active' : 'disabled'
              }`}
            >
              {isActive ? 'نشطة' : 'غير نشطة'}
            </span>

            <span
              className={`admin-company-account-status admin-company-account-status--${company.accountStatus}`}
            >
              {getAccountStatusLabel(company.accountStatus)}
            </span>
          </div>
        </header>

        <div className="admin-company-details-metrics">
          <article>
            <FiBriefcase />
            <span>المهام النشطة</span>
            <strong>{company.activeTasks}</strong>
          </article>

          <article>
            <FiCheckCircle />
            <span>المهام المكتملة</span>
            <strong>{company.completedTasks}</strong>
          </article>

          <article>
            <FiClock />
            <span>متوسط الاستجابة</span>
            <strong>{company.avgResponseTime || 'لا توجد بيانات'}</strong>
          </article>

          <article>
            <FiStar />
            <span>التقييم</span>
            <strong>{company.rating || 'لا توجد بيانات'}</strong>
          </article>
        </div>

        <div className="admin-company-details-grid">
          <section>
            <h3>بيانات التواصل والدخول</h3>

            <p>
              <FiUser />
              <span>{company.managerName}</span>
            </p>

            <p>
              <FiPhone />
              <span>{company.managerPhone}</span>
            </p>

            <p>
              <FiMail />
              <span>{company.email}</span>
            </p>
          </section>

          <section>
            <h3>نطاق العمل</h3>

            <p>
              <FiMapPin />
              <span>{governorates.join('، ')}</span>
            </p>

            <div className="admin-company-details-tags">
              {governorates.map((governorate) => (
                <span key={governorate}>{governorate}</span>
              ))}
            </div>
          </section>
        </div>

        {company.accountStatus !== 'active' ? (
          <section className="admin-company-details-section admin-company-details-warning">
            <h3>حالة حساب الدخول</h3>
            <p>
              حساب الشركة لم يتم تفعيله بعد. يجب إرسال رابط الدعوة للشركة حتى تقوم بتعيين كلمة المرور.
            </p>

            {company.invitationExpiresAt ? (
              <p>تاريخ انتهاء الدعوة: {company.invitationExpiresAt}</p>
            ) : null}
          </section>
        ) : null}

        <section className="admin-company-details-section">
          <h3>الخدمات</h3>

          <div className="admin-company-details-tags">
            {specializations.length ? (
              specializations.map((service) => (
                <span key={service}>{service}</span>
              ))
            ) : (
              <span>{company.specialization}</span>
            )}
          </div>
        </section>

        {problemTypes.length ? (
          <section className="admin-company-details-section">
            <h3>أنواع البلاغات التي تتعامل معها</h3>

            <div className="admin-company-details-tags">
              {problemTypes.map((type) => (
                <span key={type}>{type}</span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="admin-company-details-section">
          <h3>وصف الشركة</h3>
          <p>{company.description || 'لا يوجد وصف مسجل لهذه الشركة.'}</p>
        </section>

        {company.lastStatusReason ? (
          <section className="admin-company-details-section admin-company-details-warning">
            <h3>آخر سبب لتغيير حالة التشغيل</h3>
            <p>{company.lastStatusReason}</p>
          </section>
        ) : null}

        <div className="admin-company-details-actions">
          <button type="button" onClick={onClose}>
            إغلاق
          </button>

          <button type="button" onClick={() => onEdit(company)}>
            تعديل الشركة
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminCompanyDetailsModal;