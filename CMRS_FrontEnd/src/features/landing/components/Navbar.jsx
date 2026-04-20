import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    const navbar = document.querySelector('.landing-navbar');

    if (!section) return;

    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const extraOffset = 14;
    const sectionTop =
      section.getBoundingClientRect().top + window.pageYOffset - navbarHeight - extraOffset;

    window.scrollTo({
      top: sectionTop,
      behavior: 'smooth',
    });
  };

  const handleNavClick = (event, sectionId) => {
    event.preventDefault();

    if (isMenuOpen) {
      closeMenu();
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 260);
      return;
    }

    scrollToSection(sectionId);
  };

  return (
    <header className="landing-navbar">
      <div className="container landing-navbar__inner">
        <Link to="/" className="landing-navbar__brand" aria-label="CMRS Home" onClick={closeMenu}>
          <div className="landing-navbar__logo-mark">CM</div>

          <div className="landing-navbar__brand-text">
            <strong>CMRS</strong>
            <span>نظام البلاغات الذكي</span>
          </div>
        </Link>

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
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`landing-navbar__mobile-menu ${isMenuOpen ? 'is-open' : ''}`}>
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
    </header>
  );
}

export default Navbar;