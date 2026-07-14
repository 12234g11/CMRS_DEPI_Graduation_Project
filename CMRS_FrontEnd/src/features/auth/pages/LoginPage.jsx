import { motion } from 'motion/react';
import LoginForm from '../components/LoginForm';
import authImage from '../images/auth.webp'

function LoginPage() {
  return (
    <main className="auth-page auth-page--login">
      <div className="auth-page__content">
        <motion.section
          className="auth-page__panel"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-page__panel-inner">
            <LoginForm />
          </div>
        </motion.section>

        <motion.aside
          className="auth-page__visual"
          aria-hidden="true"
          initial={{ opacity: 0, x: -32, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={authImage} alt="" className="auth-page__image" />
          <div className="auth-page__visual-overlay" />
        </motion.aside>
      </div>
    </main>
  );
}

export default LoginPage;