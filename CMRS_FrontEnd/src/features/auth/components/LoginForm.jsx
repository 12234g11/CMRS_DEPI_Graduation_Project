import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, getPostLoginRedirectPath } from '../../../shared/navigation';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../api/authApi';

const initialValues = {
  email: '',
  password: '',
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
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

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname;

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMessage('من فضلك املأ البريد الإلكتروني وكلمة المرور.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const response = await loginUser(formData);

      login({
        token: response.token,
        userData: response.user,
      });

      const redirectPath = getPostLoginRedirectPath({
        role: response.user.role,
        requestedPath: from,
      });

      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء تسجيل الدخول.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      className="login-form"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
    >
      <motion.header className="login-form__header" variants={itemVariants}>
        <h1 className="login-form__title">تسجيل الدخول</h1>
        <p className="login-form__subtitle">
          مرحباً بك، قم بتسجيل الدخول للوصول إلى حسابك
        </p>
      </motion.header>

      <motion.form
        className="login-form__body"
        onSubmit={handleSubmit}
        noValidate
        variants={containerVariants}
      >
        <motion.div className="login-form__field" variants={itemVariants}>
          <label htmlFor="email">البريد الالكتروني</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="مثال : example@mail.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </motion.div>

        <motion.div className="login-form__field" variants={itemVariants}>
          <label htmlFor="password">كلمة المرور</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </motion.div>

        <motion.div className="login-form__meta" variants={itemVariants}>
          <Link to={ROUTES.FORGOT_PASSWORD} className="login-form__forgot-link">
            هل نسيت كلمة المرور؟
          </Link>
        </motion.div>

        {errorMessage ? (
          <motion.p
            className="login-form__error"
            role="alert"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errorMessage}
          </motion.p>
        ) : null}

        <motion.button
          type="submit"
          className="login-form__submit"
          disabled={isSubmitting}
          variants={itemVariants}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
        >
          {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </motion.button>

        <motion.p className="login-form__footer" variants={itemVariants}>
          ليس لديك حساب؟{' '}
          <Link to={ROUTES.SIGNUP} className="login-form__footer-link">
            سجل الآن
          </Link>
        </motion.p>
      </motion.form>
    </motion.div>
  );
}

export default LoginForm;