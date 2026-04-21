import { motion } from 'motion/react';
import CompanyLoginForm from '../components/CompanyLoginForm';
import authImage from '../images/auth.webp'

function CompanyLoginPage() {
  return (
    <main className="auth-page auth-page--company">
      <div className="auth-page__content">
        <motion.aside
          className="auth-page__visual"
          aria-hidden="true"
          initial={{ opacity: 0, x: -32, scale: 0.98 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={authImage} alt="" className="auth-page__image" />
          <div className="auth-page__visual-overlay" />
        </motion.aside>

        <motion.section
          className="auth-page__panel"
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-page__panel-inner auth-page__panel-inner--wide">
            <CompanyLoginForm />
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default CompanyLoginPage;