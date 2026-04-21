import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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

const navContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

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
    <motion.header
      className="landing-navbar"
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="container landing-navbar__inner"
        variants={navContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={navItemVariants}>
          <Link to="/" className="landing-navbar__brand" aria-label="CMRS Home" onClick={closeMenu}>
            <div className="landing-navbar__logo-mark">CM</div>

            <div className="landing-navbar__brand-text">
              <strong>CMRS</strong>
              <span>نظام البلاغات الذكي</span>
            </div>
          </Link>
        </motion.div>

        <motion.nav
          className="landing-navbar__nav"
          aria-label="Primary Navigation"
          variants={navContainerVariants}
        >
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <motion.a
              key={id}
              href={`#${id}`}
              className="landing-navbar__nav-link"
              onClick={(event) => handleNavClick(event, id)}
              variants={navItemVariants}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="landing-navbar__nav-icon">
                <Icon size={21} strokeWidth={1.8} />
              </span>
              <span className="landing-navbar__nav-label">{label}</span>
            </motion.a>
          ))}
        </motion.nav>

        <motion.div className="landing-navbar__actions" variants={navItemVariants}>
          <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Link to="/signup" className="landing-btn landing-btn--ghost">
              حساب جديد
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Link to="/login" className="landing-btn landing-btn--primary">
              تسجيل دخول
            </Link>
          </motion.div>
        </motion.div>

        <motion.button
          type="button"
          className={`landing-navbar__toggle ${isMenuOpen ? 'is-active' : ''}`}
          aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
          variants={navItemVariants}
          whileTap={{ scale: 0.94 }}
        >
          <span />
          <span />
          <span />
        </motion.button>
      </motion.div>

      <AnimatePresence initial={false}>
        {isMenuOpen && (
          <motion.div
            className="landing-navbar__mobile-menu is-open"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <motion.div
              className="container landing-navbar__mobile-inner"
              initial="hidden"
              animate="visible"
              variants={navContainerVariants}
            >
              <nav className="landing-navbar__mobile-nav" aria-label="Mobile Navigation">
                {NAV_ITEMS.map(({ id, label, Icon }) => (
                  <motion.a
                    key={id}
                    href={`#${id}`}
                    className="landing-navbar__mobile-link"
                    onClick={(event) => handleNavClick(event, id)}
                    variants={{
                      hidden: { opacity: 0, x: 18 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: {
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="landing-navbar__mobile-link-icon">
                      <Icon size={18} strokeWidth={1.9} />
                    </span>
                    <span>{label}</span>
                  </motion.a>
                ))}
              </nav>

              <motion.div
                className="landing-navbar__mobile-actions"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.35, delay: 0.08 },
                  },
                }}
              >
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="landing-btn landing-btn--primary"
                    onClick={closeMenu}
                  >
                    تسجيل دخول
                  </Link>
                </motion.div>

                <motion.div whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/signup"
                    className="landing-btn landing-btn--ghost"
                    onClick={closeMenu}
                  >
                    حساب جديد
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;