import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../shared/navigation';
import { requestPasswordReset } from '../api/authApi';
import AuthErrorList from './AuthErrorList';
import { getApiErrorMessages, validateEmail } from '../utils/authValidation';

const initialValues = {
  email: '',
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

function ForgotPasswordForm() {
  const [formData, setFormData] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessages.length > 0) setErrorMessages([]);
    if (successMessage) setSuccessMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateEmail(formData.email, {
      requiredMessage: 'اكتب البريد الإلكتروني أولًا.',
    });

    if (validationErrors.length > 0) {
      setErrorMessages(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessages([]);
      setSuccessMessage('');

      const response = await requestPasswordReset(formData.email.trim());

      setSuccessMessage(
        response?.message ||
          'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.'
      );
    } catch (error) {
      setErrorMessages(
        getApiErrorMessages(
          error,
          'تعذر إرسال رابط إعادة تعيين كلمة المرور. حاول مرة أخرى.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      className="forgot-form"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
    >
      <motion.header className="forgot-form__header" variants={itemVariants}>
        <h1 className="forgot-form__title">نسيت كلمة المرور؟</h1>
        <p className="forgot-form__subtitle">
          أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
        </p>
      </motion.header>

      <motion.form
        className="forgot-form__body"
        onSubmit={handleSubmit}
        noValidate
        variants={containerVariants}
      >
        <motion.div className="forgot-form__field" variants={itemVariants}>
          <label htmlFor="email">البريد الإلكتروني</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="example@mail.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </motion.div>

        <AuthErrorList
          messages={errorMessages}
          className="auth-error-list--compact"
        />

        {successMessage ? (
          <motion.p
            className="forgot-form__success"
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {successMessage}
          </motion.p>
        ) : null}

        <motion.button
          type="submit"
          className="forgot-form__submit"
          disabled={isSubmitting}
          variants={itemVariants}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
        >
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
        </motion.button>

        <motion.div className="forgot-form__links" variants={itemVariants}>
          <Link to={ROUTES.LOGIN} className="forgot-form__link">
            العودة لتسجيل الدخول
          </Link>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}

export default ForgotPasswordForm;
