import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../../shared/navigation';
import PasswordInput from './PasswordInput';
import AuthErrorList from './AuthErrorList';
import { acceptCompanyInvitation } from '../api/authApi';
import {
  getApiErrorMessages,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '../utils/authValidation';

const initialValues = {
  email: '',
  password: '',
  confirmPassword: '',
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function CompanySetupPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('token');

  const [formData, setFormData] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
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

    if (!invitationToken) {
      errors.push('رابط الدعوة غير صحيح أو منتهي الصلاحية.');
    }

    errors.push(
      ...validateEmail(formData.email, {
        requiredMessage: 'البريد الإلكتروني للشركة مطلوب.',
      })
    );
    errors.push(...validatePassword(formData.password));
    errors.push(
      ...validatePasswordConfirmation(
        formData.password,
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

      await acceptCompanyInvitation({
        token: invitationToken,
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      const successText =
        'تم تفعيل حساب الشركة بنجاح. يمكنك الآن تسجيل الدخول.';

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
          'تعذر تفعيل حساب الشركة. راجع البيانات أو اطلب دعوة جديدة.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      className="company-form"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.12 }}
    >
      <motion.header className="company-form__header" variants={itemVariants}>
        <h1 className="company-form__title">تفعيل حساب الشركة</h1>
        <p className="company-form__lead">تمت دعوتك للانضمام إلى منصة CMRS</p>
        <p className="company-form__subtitle">
          أدخل البريد الإلكتروني الذي تم إرسال الدعوة عليه، ثم قم بتعيين كلمة
          المرور الخاصة بحساب الشركة.
        </p>
      </motion.header>

      <motion.form
        className="company-form__body"
        onSubmit={handleSubmit}
        noValidate
        variants={containerVariants}
      >
        <motion.div className="company-form__grid" variants={containerVariants}>
          <motion.div
            className="company-form__field company-form__field--full"
            variants={itemVariants}
          >
            <label htmlFor="email">البريد الإلكتروني للشركة</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="company@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </motion.div>

          <motion.div className="company-form__field" variants={itemVariants}>
            <label htmlFor="password">كلمة المرور</label>
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              isVisible={visiblePasswords.password}
              onToggleVisibility={() =>
                setVisiblePasswords((prev) => ({
                  ...prev,
                  password: !prev.password,
                }))
              }
            />
          </motion.div>

          <motion.div className="company-form__field" variants={itemVariants}>
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
        </motion.div>

        <AuthErrorList messages={errorMessages} />

        {successMessage ? (
          <motion.p
            className="company-form__success"
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {successMessage}
          </motion.p>
        ) : null}

        <motion.button
          type="submit"
          className="company-form__submit"
          disabled={isSubmitting}
          variants={itemVariants}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
        >
          {isSubmitting ? 'جاري تفعيل الحساب...' : 'تفعيل الحساب'}
        </motion.button>

        <motion.div className="company-form__links" variants={itemVariants}>
          <Link to={ROUTES.LOGIN} className="company-form__link">
            الرجوع لتسجيل الدخول
          </Link>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}

export default CompanySetupPasswordForm;
