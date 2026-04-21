import { motion } from 'motion/react';
import SectionHeading from './SectionHeading';
import { ABOUT_CARDS } from '../constants/landingContent';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function AboutSection() {
  return (
    <section id="about" className="page-section landing-soft-section">
      <div className="container">
        <SectionHeading title="من نحن" subtitle="نبني مجتمعًا أفضل معًا" />

        <motion.div
          className="about-section__cards"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          {ABOUT_CARDS.map((item) => (
            <motion.article
              key={item}
              className="about-section__card"
              variants={cardVariants}
              whileHover={{ y: -4 }}
            >
              <p>{item}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default AboutSection;