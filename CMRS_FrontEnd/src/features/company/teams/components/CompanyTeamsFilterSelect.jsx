import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

function CompanyTeamsFilterSelect({
  value,
  options = [],
  onChange,
  ariaLabel,
  placeholder = 'اختر...',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function handleSelect(optionValue) {
    onChange(optionValue);
    setIsOpen(false);
  }

  return (
    <div
      className={`company-teams-filter-select ${isOpen ? 'is-open' : ''}`}
      ref={selectRef}
    >
      <button
        type="button"
        className={`company-teams-filter-select__button ${
          isOpen ? 'is-open' : ''
        }`}
        onClick={() => setIsOpen((current) => !current)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <FiChevronDown />
      </button>

      {isOpen ? (
        <ul className="company-teams-filter-select__menu" role="listbox">
          {options.map((option) => {
            const isActive = option.value === value;

            return (
              <li key={option.value}>
                <button
                  type="button"
                  className={`company-teams-filter-select__option ${
                    isActive ? 'is-active' : ''
                  }`}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={isActive}
                >
                  <span>{option.label}</span>
                  {isActive ? <FiCheck /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default CompanyTeamsFilterSelect;