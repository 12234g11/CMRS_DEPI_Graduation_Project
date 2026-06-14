import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  House,
  CircleAlert,
  Eye,
  Settings,
  Wrench,
  Phone,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'hero', label: 'الرئيسية', Icon: House },
  { id: 'about', label: 'من نحن', Icon: CircleAlert },
  { id: 'vision', label: 'رؤيتنا', Icon: Eye },
  { id: 'services', label: 'الخدمات', Icon: Settings },
  { id: 'how-it-works', label: 'كيف يعمل', Icon: Wrench },
  { id: 'contact', label: 'اتصل بنا', Icon: Phone },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navbarRef = useRef(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const navbarHeight = navbarRef.current?.offsetHeight || 0;
    const extraOffset = 14;

    const sectionTop =
      section.getBoundingClientRect().top +
      window.pageYOffset -
      navbarHeight -
      extraOffset;

    window.scrollTo({
      top: sectionTop,
      behavior: 'smooth',
    });
  }, []);

  const handleNavClick = useCallback(
    (event, sectionId) => {
      event.preventDefault();

      if (isMenuOpen) {
        closeMenu();
        requestAnimationFrame(() => {
          scrollToSection(sectionId);
        });
        return;
      }

      scrollToSection(sectionId);
    },
    [isMenuOpen, closeMenu, scrollToSection]
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header ref={navbarRef} className="landing-navbar">
      <div className="container landing-navbar__inner">
        <div>
          <Link
            to="/"
            className="landing-navbar__brand"
            aria-label="CMRS Home"
            onClick={closeMenu}
          >
            <div className="landing-navbar__logo-wrap">
              <img
                src="/images/AppLogo.webp"
                alt="CMRS Logo"
                className="landing-navbar__logo-image"
              />
            </div>
          </Link>
        </div>

        <nav className="landing-navbar__nav" aria-label="Primary Navigation">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="landing-navbar__nav-link"
              onClick={(event) => handleNavClick(event, id)}
            >
              <span className="landing-navbar__nav-icon">
                <Icon size={21} strokeWidth={1.8} />
              </span>
              <span className="landing-navbar__nav-label">{label}</span>
            </a>
          ))}
        </nav>

        <div className="landing-navbar__actions">
          <Link to="/signup" className="landing-btn landing-btn--ghost">
            حساب جديد
          </Link>

          <Link to="/login" className="landing-btn landing-btn--primary">
            تسجيل دخول
          </Link>
        </div>

        <button
          type="button"
          className={`landing-navbar__toggle ${isMenuOpen ? 'is-active' : ''}`}
          aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {isMenuOpen && (
        <div id="mobile-navigation" className="landing-navbar__mobile-menu">
          <div className="container landing-navbar__mobile-inner">
            <nav className="landing-navbar__mobile-nav" aria-label="Mobile Navigation">
              {NAV_ITEMS.map(({ id, label, Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="landing-navbar__mobile-link"
                  onClick={(event) => handleNavClick(event, id)}
                >
                  <span className="landing-navbar__mobile-link-icon">
                    <Icon size={18} strokeWidth={1.9} />
                  </span>
                  <span>{label}</span>
                </a>
              ))}
            </nav>

            <div className="landing-navbar__mobile-actions">
              <Link
                to="/login"
                className="landing-btn landing-btn--primary"
                onClick={closeMenu}
              >
                تسجيل دخول
              </Link>

              <Link
                to="/signup"
                className="landing-btn landing-btn--ghost"
                onClick={closeMenu}
              >
                حساب جديد
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default memo(Navbar);