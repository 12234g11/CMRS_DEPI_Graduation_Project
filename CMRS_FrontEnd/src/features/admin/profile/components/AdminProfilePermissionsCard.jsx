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
    </section>
  );
}

export default AdminProfilePermissionsCard;