import { useState } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

function UserDashboardFilterSelect({
  value,
  options = [],
  onChange,
  ariaLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  function handleSelect(optionValue) {
    onChange?.(optionValue);
    setIsOpen(false);
  }

  return (
    <div className={`user-dashboard-filter-dropdown ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="user-dashboard-filter-dropdown__button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span>{selectedOption?.label}</span>
        <FiChevronDown />
      </button>

      {isOpen ? (
        <div className="user-dashboard-filter-dropdown__menu">
          {options.map((option) => {
            const isActive = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                className={`user-dashboard-filter-dropdown__item ${
                  isActive ? 'is-active' : ''
                }`}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
                {isActive ? <FiCheck /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default UserDashboardFilterSelect;