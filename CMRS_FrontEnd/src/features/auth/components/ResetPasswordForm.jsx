import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../../shared/navigation';
import { resetPassword } from '../api/authApi';

const initialValues = {
  password: '',
  confirmPassword: '',
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

function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resetToken = searchParams.get('token');

  const [formData, setFormData] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    if (!formData.password.trim() || !formData.confirmPassword.trim()) {
      return 'من فضلك املأ كلمة المرور وتأكيد كلمة المرور.';
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

      const response = await resetPassword({
        token: resetToken,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMessage(response.message || 'تم تغيير كلمة المرور بنجاح.');
      setFormData(initialValues);

      window.setTimeout(() => {
        navigate(ROUTES.LOGIN, { replace: true });
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error?.message || 'حدث خطأ أثناء تغيير كلمة المرور.'
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
          أدخل كلمة المرور الجديدة ثم أكدها لإكمال عملية إعادة التعيين
        </p>
      </motion.header>

      <motion.form
        className="forgot-form__body"
        onSubmit={handleSubmit}
        noValidate
        variants={containerVariants}
      >
        <motion.div className="forgot-form__field" variants={itemVariants}>
          <label htmlFor="password">كلمة المرور الجديدة</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </motion.div>

        <motion.div className="forgot-form__field" variants={itemVariants}>
          <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </motion.div>

        {errorMessage ? (
          <motion.p
            className="forgot-form__error"
            role="alert"
            variants={itemVariants}
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
            variants={itemVariants}
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