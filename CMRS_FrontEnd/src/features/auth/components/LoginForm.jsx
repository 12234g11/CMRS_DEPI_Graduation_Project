import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import PasswordInput from './PasswordInput';
import AuthErrorList from './AuthErrorList';
import { ROUTES } from '../../../shared/navigation';
import { useAuthenticationFlow } from '../hooks/useAuthenticationFlow';
import { loginUser } from '../api/authApi';
import { getApiErrorMessages, validateEmail, validatePassword } from '../utils/authValidation';
import GoogleAuthSection from './GoogleAuthSection';

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
  const location = useLocation();
  const { completeAuthentication } = useAuthenticationFlow();

  const [formData, setFormData] = useState(() => ({
    ...initialValues,
    email: location.state?.email || '',
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessages.length > 0) {
      setErrorMessages([]);
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  }

  function validateForm() {
    return [
      ...validateEmail(formData.email),
      ...validatePassword(formData.password, {
        strong: false,
        requiredMessage: 'كلمة المرور مطلوبة.',
      }),
    ];
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setErrorMessages(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessages([]);
      setSuccessMessage('');

      const response = await loginUser(formData);
      completeAuthentication(response);
    } catch (error) {
      setErrorMessages(
        getApiErrorMessages(error, 'تعذر تسجيل الدخول. راجع بياناتك وحاول مرة أخرى.')
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      className="login-form"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
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
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            isVisible={isPasswordVisible}
            onToggleVisibility={() =>
              setIsPasswordVisible((current) => !current)
            }
          />
        </motion.div>

        <motion.div className="login-form__meta" variants={itemVariants}>
          <Link to={ROUTES.FORGOT_PASSWORD} className="login-form__forgot-link">
            هل نسيت كلمة المرور؟
          </Link>
        </motion.div>

        <AuthErrorList
          messages={errorMessages}
          className="auth-error-list--compact"
        />

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

      <motion.div variants={itemVariants}>
        <GoogleAuthSection dividerText="أو تابع باستخدام Google" />
      </motion.div>
    </motion.div>
  );
}

export default LoginForm;
