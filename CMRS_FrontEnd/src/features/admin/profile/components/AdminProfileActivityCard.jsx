import { FiActivity } from 'react-icons/fi';

function AdminProfileActivityCard({ activities = [] }) {
  return (
    <section className="admin-profile-card">
      <header className="admin-profile-card__header">
        <div>
          <h2>آخر الأنشطة</h2>
          <p>Recent Activity</p>
        </div>
      </header>

      {activities.length > 0 ? (
        <div className="admin-profile-activity-list">
          {activities.map((activity) => (
            <article key={activity.id}>
              <span>
                <FiActivity />
              </span>

              <div>
                <h3>{activity.title}</h3>
                <p>{activity.description}</p>
                <small>{activity.time}</small>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="admin-profile-empty-text">لا توجد أنشطة حديثة حاليًا.</p>
      )}
    </section>
  );
}

export default AdminProfileActivityCard;
