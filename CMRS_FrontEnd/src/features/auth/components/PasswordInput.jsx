import { FiEye, FiEyeOff } from 'react-icons/fi';

function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete,
  isVisible,
  onToggleVisibility,
}) {
  return (
    <div className="auth-password-input">
      <input
        id={id}
        name={name}
        className="auth-password-input__control"
        type={isVisible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        spellCheck="false"
        autoCorrect="off"
        autoCapitalize="off"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
        }}
      />

      <button
        type="button"
        className="auth-password-input__toggle"
        onClick={(event) => {
          event.stopPropagation();
          onToggleVisibility();
        }}
        aria-label={isVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        title={isVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
      >
        {isVisible ? <FiEyeOff size={19} /> : <FiEye size={19} />}
      </button>
    </div>
  );
}

export default PasswordInput;