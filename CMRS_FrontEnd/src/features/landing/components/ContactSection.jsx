import { motion } from 'motion/react';
import SectionHeading from './SectionHeading';

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fieldsContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function ContactSection() {
  return (
    <section id="contact" className="page-section landing-contact-section">
      <div className="container">
        <SectionHeading
          title="اتصل بنا"
          subtitle="أي استفسار أو اقتراح، املأ النموذج أدناه وسنعاود الاتصال بك في أقرب وقت ممكن"
        />

        <motion.div
          className="contact-card"
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <motion.form className="contact-form" variants={fieldsContainerVariants}>
            <motion.div className="contact-form__grid" variants={fieldsContainerVariants}>
              <motion.div className="contact-field" variants={fieldVariants}>
                <label htmlFor="name">الاسم</label>
                <input id="name" type="text" placeholder="مثال: أحمد محمد" />
              </motion.div>

              <motion.div className="contact-field" variants={fieldVariants}>
                <label htmlFor="phone">رقم الهاتف</label>
                <input id="phone" type="tel" placeholder="مثال: 0123456789" />
              </motion.div>

              <motion.div className="contact-field" variants={fieldVariants}>
                <label htmlFor="email">البريد الإلكتروني</label>
                <input id="email" type="email" placeholder="example@mail.com" />
              </motion.div>

              <motion.div className="contact-field" variants={fieldVariants}>
                <label htmlFor="subject">الموضوع</label>
                <input id="subject" type="text" placeholder="مثال: استفسار عن التطبيق" />
              </motion.div>
            </motion.div>

            <motion.div className="contact-field" variants={fieldVariants}>
              <label htmlFor="message">تفاصيل البلاغ أو الاستفسار</label>
              <textarea id="message" rows="5" placeholder="... اكتب رسالتك هنا" />
            </motion.div>

            <motion.button
              type="submit"
              className="landing-btn landing-btn--primary landing-btn--submit"
              variants={fieldVariants}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
            >
              ارسال
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}

export default ContactSection;