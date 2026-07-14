import { useState } from 'react';
import { motion } from 'motion/react';
import SectionHeading from './SectionHeading';

const EMAILJS_SERVICE_ID = 'service_kwg1lel';
const EMAILJS_TEMPLATE_ID = 'template_aafdast';
const EMAILJS_PUBLIC_KEY = 'v_u7cYsBapUk7fBLj';
const EMAILJS_SEND_URL = 'https://api.emailjs.com/api/v1.0/email/send';

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
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !email || !message) {
      setFeedback({
        type: 'error',
        message: 'من فضلك أكمل جميع الحقول المطلوبة.',
      });
      return;
    }

    setIsSending(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await fetch(EMAILJS_SEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            name,
            email,
            message,
          },
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'EmailJS request failed');
      }

      form.reset();
      setFeedback({
        type: 'success',
        message: 'تم إرسال رسالتك بنجاح، وسنتواصل معك في أقرب وقت.',
      });
    } catch (error) {
      console.error('Failed to send contact message:', error);
      setFeedback({
        type: 'error',
        message: 'تعذر إرسال الرسالة حاليًا. حاول مرة أخرى بعد قليل.',
      });
    } finally {
      setIsSending(false);
    }
  };

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
          <motion.form
            className="contact-form"
            variants={fieldsContainerVariants}
            onSubmit={handleSubmit}
          >
            <motion.div className="contact-form__grid" variants={fieldsContainerVariants}>
              <motion.div className="contact-field" variants={fieldVariants}>
                <label htmlFor="contact-name">الاسم</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="مثال: أحمد محمد"
                  autoComplete="name"
                  minLength="3"
                  maxLength="100"
                  required
                />
              </motion.div>

              <motion.div className="contact-field" variants={fieldVariants}>
                <label htmlFor="contact-email">البريد الإلكتروني</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="example@mail.com"
                  autoComplete="email"
                  maxLength="150"
                  required
                />
              </motion.div>
            </motion.div>

            <motion.div className="contact-field" variants={fieldVariants}>
              <label htmlFor="contact-message">تفاصيل البلاغ أو الاستفسار</label>
              <textarea
                id="contact-message"
                name="message"
                rows="5"
                placeholder="اكتب رسالتك هنا..."
                minLength="10"
                maxLength="1000"
                required
              />
            </motion.div>

            {feedback.message && (
              <motion.div
                className={`contact-form__status contact-form__status--${feedback.type}`}
                role="alert"
                aria-live="polite"
                variants={fieldVariants}
              >
                {feedback.message}
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="landing-btn landing-btn--primary landing-btn--submit"
              variants={fieldVariants}
              whileHover={isSending ? undefined : { y: -2, scale: 1.01 }}
              whileTap={isSending ? undefined : { scale: 0.985 }}
              disabled={isSending}
            >
              {isSending ? 'جارٍ الإرسال...' : 'إرسال'}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}

export default ContactSection;
