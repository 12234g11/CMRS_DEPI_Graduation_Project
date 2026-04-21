import { motion } from 'motion/react';

const headingVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function SectionHeading({ title, subtitle, centered = true }) {
  return (
    <motion.div
      className={`landing-section-heading ${centered ? 'is-centered' : ''}`}
      variants={headingVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.55 }}
    >
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </motion.div>
  );
}

export default SectionHeading;