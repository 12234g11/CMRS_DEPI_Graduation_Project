function EmptyState({ title = 'لا توجد بيانات حالياً', description = '', action = null }) {
  return (
    <div className="dashboard-empty-state">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

export default EmptyState;