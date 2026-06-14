import { FiCrosshair } from 'react-icons/fi';

function CurrentLocationButton({ onClick, isLoading = false }) {
  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.();
  };

  return (
    <button
      type="button"
      className={`reports-map__control-btn reports-map__control-btn--locate ${isLoading ? 'is-loading' : ''}`}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isLoading ? 'جارٍ تحديد موقعك الحالي' : 'تحديد موقعي الحالي'}
      title={isLoading ? 'جارٍ تحديد موقعك...' : 'تحديد موقعي الحالي'}
    >
      <span className="reports-map__control-btn-icon" aria-hidden="true">
        <FiCrosshair />
      </span>
    </button>
  );
}

export default CurrentLocationButton;