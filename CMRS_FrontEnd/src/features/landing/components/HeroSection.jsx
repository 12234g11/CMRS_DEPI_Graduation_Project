import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const heroContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.18,
    },
  },
};

const titleVariants = {
  hidden: {
    opacity: 0,
    y: 34,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.95,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const highlightVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.96,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.85,
      delay: 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const subtitleLineVariants = {
  hidden: {
    opacity: 0,
    y: 22,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const actionsVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function HeroSection() {
  return (
    <section id="hero" className="hero-section">
      <motion.div
        className="hero-section__overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />

      <div className="container hero-section__content">
        <motion.div
          className="hero-section__copy"
          variants={heroContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="hero-section__title" variants={titleVariants}>
            بلّغ عن <motion.span variants={highlightVariants}>مشاكل مدينتك</motion.span> في ثواني
          </motion.h1>

          <motion.p className="hero-section__subtitle">
            <motion.span
              className="hero-section__subtitle-line hero-section__subtitle-line--first"
              variants={subtitleLineVariants}
            >
              صوّر المشكلة، حدّد موقعها، وتابع حلّها بسهولة من خلال منصة موحدة تربطك
            </motion.span>

            <motion.span
              className="hero-section__subtitle-line hero-section__subtitle-line--second"
              variants={subtitleLineVariants}
            >
              بالجهات المختصة.
            </motion.span>
          </motion.p>

          <motion.div className="hero-section__actions" variants={actionsVariants}>
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <Link to="/reports/new" className="landing-btn landing-btn--hero">
                ابدأ الإبلاغ الآن
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;