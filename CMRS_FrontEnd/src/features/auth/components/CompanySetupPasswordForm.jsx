import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../../shared/navigation';
import PasswordInput from './PasswordInput';
import { acceptCompanyInvitation } from '../api/authApi';

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
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  }

  function validateForm() {
    if (!invitationToken) {
      return 'رابط الدعوة غير صحيح أو منتهي الصلاحية.';
    }

    if (
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      return 'من فضلك املأ جميع الحقول المطلوبة.';
    }

    if (formData.password.length < 8) {
      return 'كلمة المرور يجب ألا تقل عن 8 أحرف.';
    }

    if (formData.password !== formData.confirmPassword) {
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

      await acceptCompanyInvitation({
        token: invitationToken,
        email: formData.email,
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
            email: formData.email,
            message: successText,
          },
        });
      }, 1200);
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء تفعيل حساب الشركة.');
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

        {errorMessage ? (
          <motion.p
            className="company-form__error"
            role="alert"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errorMessage}
          </motion.p>
        ) : null}

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