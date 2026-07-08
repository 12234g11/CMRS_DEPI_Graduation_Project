import { FiCheckCircle } from 'react-icons/fi';

function AdminProfilePermissionsCard({ permissions = [] }) {
  return (
    <section className="admin-profile-card">
      <header className="admin-profile-card__header">
        <div>
          <h2>صلاحيات الأدمن</h2>
          <p>Admin Permissions</p>
        </div>
      </header>

      {permissions.length > 0 ? (
        <div className="admin-profile-permissions-list">
          {permissions.map((permission) => (
            <article key={permission.id}>
              <span>
                <FiCheckCircle />
              </span>

              <div>
                <h3>{permission.label}</h3>
                <p>{permission.description}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="admin-profile-empty-text">لا توجد صلاحيات متاحة لهذا الحساب.</p>
      )}
    </section>
  );
}

export default AdminProfilePermissionsCard;
