import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
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

function getRequestedPath(locationState) {
  if (!locationState?.from) return undefined;

  if (typeof locationState.from === 'string') {
    return locationState.from;
  }

  return locationState.from.pathname;
}

function getLoginPayload(response) {
  if (response?.data?.token && response?.data?.user) {
    return response.data;
  }

  if (response?.data?.data?.token && response?.data?.data?.user) {
    return response.data.data;
  }

  return null;
}

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState(() => ({
    ...initialValues,
    email: location.state?.email || '',
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );

  const from = getRequestedPath(location.state);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage('');
    }

    if (successMessage) {
      setSuccessMessage('');
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
      setSuccessMessage('');

      const response = await loginUser(formData);
      const loginPayload = getLoginPayload(response);

      if (!loginPayload?.token || !loginPayload?.user) {
        throw new Error('استجابة تسجيل الدخول غير صحيحة من الخادم.');
      }

      const { token, user } = loginPayload;

      const role = String(user.role || '').trim().toLowerCase();

      if (!role) {
        throw new Error('لم يتم تحديد صلاحية المستخدم من الخادم.');
      }

      login({
        token,
        userData: {
          ...user,
          role,
        },
      });

      const redirectPath = getPostLoginRedirectPath({
        role,
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

      <motion.div variants={itemVariants}>
        <Link to={ROUTES.HOME} className="auth-back-home-btn">
          <FiHome />
          الرجوع للصفحة الرئيسية
        </Link>
      </motion.div>

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

        {successMessage ? (
          <motion.p
            className="login-form__success"
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {successMessage}
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