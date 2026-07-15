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
import { resetPassword } from '../api/authApi';

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

function getRawQueryParam(search, paramName) {
  const queryString = search.startsWith('?') ? search.slice(1) : search;

  if (!queryString) {
    return '';
  }

  const queryParts = queryString.split('&');

  const matchingPart = queryParts.find((part) => {
    const separatorIndex = part.indexOf('=');

    const rawKey =
      separatorIndex === -1 ? part : part.slice(0, separatorIndex);

    try {
      return decodeURIComponent(rawKey) === paramName;
    } catch {
      return rawKey === paramName;
    }
  });

  if (!matchingPart) {
    return '';
  }

  const separatorIndex = matchingPart.indexOf('=');

  if (separatorIndex === -1) {
    return '';
  }

  return matchingPart.slice(separatorIndex + 1);
}

function ResetPasswordForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // قراءة التوكن من الرابط كما هو، بدون URL Decode
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

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  function validateForm() {
    if (!resetToken) {
      return 'رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية.';
    }

    if (
      !formData.email.trim() ||
      !formData.newPassword.trim() ||
      !formData.confirmPassword.trim()
    ) {
      return 'من فضلك املأ البريد الإلكتروني وكلمة المرور وتأكيد كلمة المرور.';
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(formData.newPassword)) {
      return 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص وألا تقل عن 8 أحرف.';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return 'كلمة المرور وتأكيد كلمة المرور غير متطابقين.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
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
      setErrorMessage(
        error?.message || 'حدث خطأ أثناء تغيير كلمة المرور.',
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
      <motion.header
        className="forgot-form__header"
        variants={itemVariants}
      >
        <h1 className="forgot-form__title">
          إعادة تعيين كلمة المرور
        </h1>

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
        <motion.div
          className="forgot-form__field"
          variants={itemVariants}
        >
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

        <motion.div
          className="forgot-form__field"
          variants={itemVariants}
        >
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

        <motion.div
          className="forgot-form__field"
          variants={itemVariants}
        >
          <label htmlFor="confirmPassword">
            تأكيد كلمة المرور
          </label>

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

        {errorMessage ? (
          <motion.p
            className="forgot-form__error"
            role="alert"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errorMessage}
          </motion.p>
        ) : null}

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
          {isSubmitting
            ? 'جاري تغيير كلمة المرور...'
            : 'تغيير كلمة المرور'}
        </motion.button>

        <motion.div
          className="forgot-form__links"
          variants={itemVariants}
        >
          <Link
            to={ROUTES.LOGIN}
            className="forgot-form__link"
          >
            العودة لتسجيل الدخول
          </Link>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}

export default ResetPasswordForm;   