import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

function AdminReportFilterSelect({
  value,
  options = [],
  onChange,
  ariaLabel,
  placeholder = 'اختر...',
  variant = 'overlay',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const selectRef = useRef(null);
  const buttonRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);

  function updateMenuPosition() {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setMenuStyle({
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 999999,
    });
  }

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedInsideSelect = selectRef.current?.contains(event.target);
      const clickedInsideMenu = event.target.closest(
        '.admin-report-filter-select__menu--portal',
      );

      if (!clickedInsideSelect && !clickedInsideMenu) {
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

  useEffect(() => {
    if (!isOpen) return undefined;

    updateMenuPosition();

    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isOpen]);

  function handleSelect(optionValue) {
    onChange(optionValue);
    setIsOpen(false);
  }

  const menu = isOpen ? (
    <ul
      className="admin-report-filter-select__menu admin-report-filter-select__menu--portal"
      role="listbox"
      style={menuStyle}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <li key={option.value}>
            <button
              type="button"
              className={`admin-report-filter-select__option ${
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
  ) : null;

  return (
    <div
      className={`admin-report-filter-select admin-report-filter-select--${variant} ${
        isOpen ? 'is-open' : ''
      }`}
      ref={selectRef}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`admin-report-filter-select__button ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((current) => !current)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <FiChevronDown />
      </button>

      {typeof document !== 'undefined'
        ? createPortal(menu, document.body)
        : menu}
    </div>
  );
}

export default AdminReportFilterSelect;