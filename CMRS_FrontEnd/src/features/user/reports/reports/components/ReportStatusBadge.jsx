function ReportStatusBadge({ tone = 'info', children }) {
  return <span className={`dashboard-badge dashboard-badge--${tone}`}>{children}</span>;
}

export default ReportStatusBadge;