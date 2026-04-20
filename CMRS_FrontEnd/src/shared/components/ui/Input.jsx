function Input({ label, error, id, ...props }) {
  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} className={`input ${error ? 'input--error' : ''}`} {...props} />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export default Input;