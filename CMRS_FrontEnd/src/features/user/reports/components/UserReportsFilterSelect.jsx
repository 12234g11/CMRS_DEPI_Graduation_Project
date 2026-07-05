import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

function UserReportsFilterSelect({
  value,
  options = [],
  onChange,
  ariaLabel = 'اختيار الفلتر',
}) {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  function updateMenuPosition() {
    const button = buttonRef.current;

    if (!button) return;

    const rect = button.getBoundingClientRect();

    const gap = 8;
    const estimatedItemHeight = 54;
    const estimatedMenuHeight = Math.min(
      280,
      options.length * estimatedItemHeight + 16
    );

    const availableBelow = window.innerHeight - rect.bottom - gap;
    const availableAbove = rect.top - gap;

    const shouldOpenUp =
      availableBelow < estimatedMenuHeight && availableAbove > availableBelow;

    const maxHeight = shouldOpenUp
      ? Math.max(160, availableAbove - gap)
      : Math.max(160, availableBelow - gap);

    setMenuStyle({
      position: 'fixed',
      top: shouldOpenUp
        ? `${Math.max(
            12,
            rect.top - Math.min(estimatedMenuHeight, maxHeight) - gap
          )}px`
        : `${rect.bottom + gap}px`,
      left: `${rect.left}px`,
      right: 'auto',
      width: `${rect.width}px`,
      maxHeight: `${Math.min(estimatedMenuHeight, maxHeight)}px`,
      zIndex: 99999,
    });
  }

  function handleSelect(optionValue) {
    onChange?.(optionValue);
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return undefined;

    updateMenuPosition();

    function handleClickOutside(event) {
      const clickedButton = buttonRef.current?.contains(event.target);
      const clickedMenu = menuRef.current?.contains(event.target);

      if (!clickedButton && !clickedMenu) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    function handleReposition() {
      updateMenuPosition();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, options.length]);

  return (
    <div className={`user-reports-filter-dropdown ${isOpen ? 'is-open' : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className="user-reports-filter-dropdown__button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span>{selectedOption?.label || 'اختر'}</span>
        <FiChevronDown />
      </button>

      {isOpen
        ? createPortal(
            <div
              ref={menuRef}
              className="user-reports-filter-dropdown__menu-portal"
              style={menuStyle}
              dir="rtl"
            >
              {options.map((option) => {
                const isActive = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`user-reports-filter-dropdown__item ${
                      isActive ? 'is-active' : ''
                    }`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span>{option.label}</span>
                    {isActive ? <FiCheck /> : null}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default UserReportsFilterSelect;