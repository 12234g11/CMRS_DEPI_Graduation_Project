import { motion } from 'motion/react';
import SectionHeading from './SectionHeading';
import { VISION_ITEMS } from '../constants/landingContent';

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function VisionSection() {
  return (
    <section id="vision" className="page-section">
      <div className="container">
        <SectionHeading title="رؤيتنا" subtitle="معًا نحو مدينة أفضل" />

        <motion.div
          className="vision-grid"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
        >
          {VISION_ITEMS.map((item) => (
            <motion.article
              key={item.id}
              className="vision-card"
              variants={cardVariants}
              whileHover={{ y: -4 }}
            >
              <motion.span
                className="vision-card__badge"
                initial={{ scale: 0.85, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false, amount: 0.6 }}
                transition={{ duration: 0.4, delay: item.id * 0.04 }}
              >
                {item.id}
              </motion.span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default VisionSection;