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
    </section>
  );
}

export default AdminProfileActivityCard;