import { motion } from 'motion/react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const QUICK_LINKS = [
  { label: 'الرئيسية', href: '#hero' },
  { label: 'رؤيتنا', href: '#vision' },
  { label: 'الخدمات', href: '#services' },
  { label: 'من نحن', href: '#about' },
];

const CONTACT_ITEMS = [
  { icon: FaEnvelope, text: 'info@cmrsapp.com', href: 'mailto:info@cmrsapp.com' },
  { icon: FaPhoneAlt, text: '0123456789', href: 'tel:0123456789' },
  { icon: FaMapMarkerAlt, text: 'القاهرة الكبرى، مصر', href: '#' },
];

const SOCIAL_LINKS = [
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
];

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const columnVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function Footer() {
  return (
    <motion.footer
      className="landing-footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15 }}
    >
      <motion.div className="container landing-footer__grid" variants={gridVariants}>
        <motion.div className="landing-footer__brand" variants={columnVariants}>
          <motion.div
            className="landing-footer__logo-wrap"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.45 }}
          >
            <img
              src="/images/AppLogo2.webp"
              alt="CMRS Programs Logo"
              className="landing-footer__logo-image"
            />
          </motion.div>

          <p>
            نحن نقدم أفضل الحلول والخدمات المبتكرة لعملائنا، هدفنا هو تحقيق
            التميز والجودة في كل ما نقدمه.
          </p>
        </motion.div>

        <motion.div className="landing-footer__column" variants={columnVariants}>
          <h3>روابط سريعة</h3>

          <ul className="landing-footer__links">
            {QUICK_LINKS.map((item, index) => (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <a href={item.href}>{item.label}</a>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="landing-footer__column" variants={columnVariants}>
          <h3>معلومات التواصل</h3>

          <ul className="landing-footer__contact-list">
            {CONTACT_ITEMS.map(({ icon: Icon, text, href }, index) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
              >
                <a href={href} className="landing-footer__contact-item">
                  <span className="landing-footer__contact-icon">
                    <Icon size={16} />
                  </span>
                  <span>{text}</span>
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="landing-footer__column" variants={columnVariants}>
          <h3>تابعنا على</h3>

          <p>تواصل معنا عبر منصات التواصل الاجتماعي</p>

          <div className="landing-footer__socials">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }, index) => (
              <motion.a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <Icon size={18} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="landing-footer__bottom"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.7 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        جميع الحقوق محفوظة. CMRS 2026
      </motion.div>
    </motion.footer>
  );
}

export default Footer;