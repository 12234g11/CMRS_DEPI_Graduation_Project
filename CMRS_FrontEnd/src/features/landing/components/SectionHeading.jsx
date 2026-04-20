function SectionHeading({ title, subtitle, centered = true }) {
  return (
    <div className={`landing-section-heading ${centered ? 'is-centered' : ''}`}>
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}

export default SectionHeading;