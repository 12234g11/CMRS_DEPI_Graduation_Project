import { memo, useCallback, useEffect, useRef, useState } from 'react';
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
      staggerChildren: 0.035,
      delayChildren: 0.03,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const mobileMenuVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scaleY: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scaleY: 0.98,
    transition: {
      duration: 0.16,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: 14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const mobileActionsVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      delay: 0.04,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

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
        window.setTimeout(() => {
          scrollToSection(sectionId);
        }, 180);
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
    <motion.header
      ref={navbarRef}
      className="landing-navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="container landing-navbar__inner"
        variants={navContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={navItemVariants}>
          <Link
            to="/"
            className="landing-navbar__brand"
            aria-label="CMRS Home"
            onClick={closeMenu}
          >
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
              whileTap={{ scale: 0.98 }}
            >
              <span className="landing-navbar__nav-icon">
                <Icon size={21} strokeWidth={1.8} />
              </span>
              <span className="landing-navbar__nav-label">{label}</span>
            </motion.a>
          ))}
        </motion.nav>

        <motion.div className="landing-navbar__actions" variants={navItemVariants}>
          <Link to="/signup" className="landing-btn landing-btn--ghost">
            حساب جديد
          </Link>

          <Link to="/login" className="landing-btn landing-btn--primary">
            تسجيل دخول
          </Link>
        </motion.div>

        <motion.button
          type="button"
          className={`landing-navbar__toggle ${isMenuOpen ? 'is-active' : ''}`}
          aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
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
            id="mobile-navigation"
            className="landing-navbar__mobile-menu is-open"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              transformOrigin: 'top',
              overflow: 'hidden',
              willChange: 'transform, opacity',
            }}
          >
            <motion.div
              className="container landing-navbar__mobile-inner"
              variants={navContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <nav className="landing-navbar__mobile-nav" aria-label="Mobile Navigation">
                {NAV_ITEMS.map(({ id, label, Icon }) => (
                  <motion.a
                    key={id}
                    href={`#${id}`}
                    className="landing-navbar__mobile-link"
                    onClick={(event) => handleNavClick(event, id)}
                    variants={mobileItemVariants}
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
                variants={mobileActionsVariants}
              >
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
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default memo(Navbar);