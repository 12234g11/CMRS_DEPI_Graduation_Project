import { Link } from 'react-router-dom';
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

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="container landing-footer__grid">
        <div className="landing-footer__brand">
          <div className="landing-footer__logo-mark">CM</div>

          <p>
            منصة ذكية لتسهيل الإبلاغ عن الأعطال والخدمات العامة
            ومتابعة حالتها لحظة بلحظة.
          </p>
        </div>

        <div className="landing-footer__column">
          <h3>روابط سريعة</h3>

          <ul className="landing-footer__links">
            {QUICK_LINKS.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="landing-footer__column">
          <h3>معلومات التواصل</h3>

          <ul className="landing-footer__contact-list">
            {CONTACT_ITEMS.map(({ icon: Icon, text, href }) => (
              <li key={text}>
                <a href={href} className="landing-footer__contact-item">
                  <span className="landing-footer__contact-icon">
                    <Icon size={16} />
                  </span>
                  <span>{text}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="landing-footer__column">
          <h3>تابعنا على</h3>

          <div className="landing-footer__socials">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label} title={label}>
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="landing-footer__bottom">
        CMRS 2026. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}

export default Footer;