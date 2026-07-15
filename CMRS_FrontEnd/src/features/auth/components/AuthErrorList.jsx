import { motion } from 'motion/react';

function normalizeMessages(messages) {
  const values = Array.isArray(messages) ? messages : [messages];

  return values
    .flatMap((message) => String(message || '').split(/\r?\n/))
    .map((message) => message.trim())
    .filter(Boolean)
    .filter((message, index, array) => array.indexOf(message) === index);
}

function AuthErrorList({ messages = [], className = '' }) {
  const errorMessages = normalizeMessages(messages);

  if (errorMessages.length === 0) return null;

  return (
    <motion.div
      className={`auth-error-list ${className}`.trim()}
      role="alert"
      aria-live="polite"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <ul className="auth-error-list__items">
        {errorMessages.map((message, index) => (
          <li
            key={`${message}-${index}`}
            className="auth-error-list__item"
          >
            {message}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default AuthErrorList;
