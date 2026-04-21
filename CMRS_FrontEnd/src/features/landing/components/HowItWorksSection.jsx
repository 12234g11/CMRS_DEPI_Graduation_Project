import { motion } from 'motion/react';
import SectionHeading from './SectionHeading';
import { HOW_IT_WORKS_STEPS } from '../constants/landingContent';

const flowVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: 26 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="page-section">
      <div className="container">
        <SectionHeading
          title="كيف يعمل النظام"
          subtitle="بلّغ عن أي مشكلة في ثوانٍ وساهم في تحسين مدينتك بسهولة"
        />

        <div className="how-section">
          <motion.div
            className="how-section__image"
            aria-hidden="true"
            initial={{ opacity: 0, x: -30, scale: 0.97 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="how-section__image-overlay"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.6 }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              صورة المشكلة
            </motion.div>
          </motion.div>

          <motion.div
            className="how-section__flow"
            variants={flowVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
          >
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <motion.div key={step} className="how-step-wrap" variants={stepVariants}>
                <motion.article
                  className={`how-step ${index % 2 === 0 ? 'is-solid' : 'is-light'}`}
                  whileHover={{ y: -3, scale: 1.01 }}
                >
                  <p>{step}</p>
                </motion.article>

                <motion.span
                  className="how-step__arrow"
                  initial={{ opacity: 0, y: -6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.8 }}
                  transition={{ duration: 0.35 }}
                >
                  ↓
                </motion.span>
              </motion.div>
            ))}

            <motion.article
              className="how-step how-step--wide is-solid"
              variants={stepVariants}
              whileHover={{ y: -3, scale: 1.01 }}
            >
              <p>يستقبل المستخدم إشعارات بكل تحديثات البلاغ.</p>
            </motion.article>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;