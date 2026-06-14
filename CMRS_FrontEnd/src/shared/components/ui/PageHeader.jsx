function PageHeader({ title, subtitle, action = null, className = '' }) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div className="page-header__content">
        <h1 className="page-header__title">{title}</h1>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>

      {action ? <div className="page-header__action">{action}</div> : null}
    </header>
  );
}

export default PageHeader;