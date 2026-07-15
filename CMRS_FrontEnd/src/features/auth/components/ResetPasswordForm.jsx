import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { ROUTES } from '../../../shared/navigation';
import PasswordInput from './PasswordInput';
import AuthErrorList from './AuthErrorList';
import { resetPassword } from '../api/authApi';
import {
  getApiErrorMessages,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '../utils/authValidation';

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

function ResetPasswordForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Keep the reset token exactly as received in the URL.
  const resetToken =
    window.location.search.match(/[?&]token=([^&]*)/)?.[1] || '';

  const emailFromUrl = searchParams.get('email') || '';
  const emailFromState = location.state?.email || '';

  const [formData, setFormData] = useState(() => ({
    email: emailFromUrl || emailFromState || '',
    newPassword: '',
    confirmPassword: '',
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    newPassword: false,
    confirmPassword: false,
  });
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

  function validateForm() {
    const errors = [];

    if (!resetToken) {
      errors.push('رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية.');
    }

    errors.push(...validateEmail(formData.email));
    errors.push(
      ...validatePassword(formData.newPassword, {
        label: 'كلمة المرور الجديدة',
      })
    );
    errors.push(
      ...validatePasswordConfirmation(
        formData.newPassword,
        formData.confirmPassword
      )
    );

    return errors;
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

      const response = await resetPassword({
        email: formData.email.trim(),
        token: resetToken,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      const successText =
        response?.message ||
        'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.';

      setSuccessMessage(successText);

      window.setTimeout(() => {
        navigate(ROUTES.LOGIN, {
          replace: true,
          state: {
            email: formData.email.trim(),
            message: successText,
          },
        });
      }, 1200);
    } catch (error) {
      setErrorMessages(
        getApiErrorMessages(
          error,
          'تعذر تغيير كلمة المرور. راجع البيانات أو اطلب رابطًا جديدًا.'
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
        <h1 className="forgot-form__title">إعادة تعيين كلمة المرور</h1>

        <p className="forgot-form__subtitle">
          أدخل بريدك الإلكتروني وكلمة المرور الجديدة لإكمال عملية إعادة
          التعيين
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

        <motion.div className="forgot-form__field" variants={itemVariants}>
          <label htmlFor="newPassword">كلمة المرور الجديدة</label>

          <PasswordInput
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            autoComplete="new-password"
            isVisible={visiblePasswords.newPassword}
            onToggleVisibility={() =>
              setVisiblePasswords((prev) => ({
                ...prev,
                newPassword: !prev.newPassword,
              }))
            }
          />
        </motion.div>

        <motion.div className="forgot-form__field" variants={itemVariants}>
          <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            isVisible={visiblePasswords.confirmPassword}
            onToggleVisibility={() =>
              setVisiblePasswords((prev) => ({
                ...prev,
                confirmPassword: !prev.confirmPassword,
              }))
            }
          />
        </motion.div>

        <AuthErrorList messages={errorMessages} />

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
          {isSubmitting ? 'جاري تغيير كلمة المرور...' : 'تغيير كلمة المرور'}
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

export default ResetPasswordForm;
