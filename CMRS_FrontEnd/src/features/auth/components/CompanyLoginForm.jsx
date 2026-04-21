import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/routePaths';
import { useAuth } from '../hooks/useAuth';
import { loginCompany } from '../api/authApi';
import {
  authMockGovernorates,
  authMockServiceOptions,
} from '../mocks/authMockData';

const initialValues = {
  companyName: '',
  officialEmail: '',
  commercialRegistration: '',
  serviceType: '',
  governorate: '',
  password: '',
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

function CompanyLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  function validateForm() {
    if (
      !formData.companyName.trim() ||
      !formData.officialEmail.trim() ||
      !formData.commercialRegistration.trim() ||
      !formData.serviceType.trim() ||
      !formData.governorate.trim() ||
      !formData.password.trim()
    ) {
      return 'من فضلك املأ جميع الحقول المطلوبة.';
    }

    if (formData.password.length < 8) {
      return 'كلمة المرور يجب ألا تقل عن 8 أحرف.';
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

      const response = await loginCompany(formData);

      login({
        token: response.token,
        userData: response.user,
      });

      navigate(ROUTES.COMPANY_DASHBOARD, { replace: true });
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء تسجيل دخول الشركة.');
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
        <h1 className="company-form__title">دخول الشركات</h1>
        <p className="company-form__lead">لوحة الشركات ومقدمي الخدمات</p>
        <p className="company-form__subtitle">
          قم بتسجيل الدخول للوصول إلى لوحة التحكم الخاصة بشركتك ومتابعة البلاغات
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
            <label htmlFor="companyName">اسم الشركة</label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="مثال: شركة كهرباء القاهرة"
              value={formData.companyName}
              onChange={handleChange}
              autoComplete="organization"
            />
          </motion.div>

          <motion.div className="company-form__field" variants={itemVariants}>
            <label htmlFor="officialEmail">البريد الإلكتروني الرسمي</label>
            <input
              id="officialEmail"
              name="officialEmail"
              type="email"
              placeholder="مثال: company@mail.com"
              value={formData.officialEmail}
              onChange={handleChange}
              autoComplete="email"
            />
          </motion.div>

          <motion.div className="company-form__field" variants={itemVariants}>
            <label htmlFor="commercialRegistration">رقم السجل التجاري</label>
            <input
              id="commercialRegistration"
              name="commercialRegistration"
              type="text"
              placeholder="مثال: CR-100200"
              value={formData.commercialRegistration}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div className="company-form__field" variants={itemVariants}>
            <label htmlFor="serviceType">نوع الخدمة</label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
            >
              <option value="">اختر نوع الخدمة</option>
              {authMockServiceOptions.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div className="company-form__field" variants={itemVariants}>
            <label htmlFor="governorate">المحافظة</label>
            <select
              id="governorate"
              name="governorate"
              value={formData.governorate}
              onChange={handleChange}
            >
              <option value="">اختر المحافظة</option>
              {authMockGovernorates.map((governorate) => (
                <option key={governorate} value={governorate}>
                  {governorate}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div
            className="company-form__field company-form__field--full"
            variants={itemVariants}
          >
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

        <motion.button
          type="submit"
          className="company-form__submit"
          disabled={isSubmitting}
          variants={itemVariants}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
        >
          {isSubmitting ? 'جاري تسجيل الدخول...' : 'دخول الشركة'}
        </motion.button>

        <motion.div className="company-form__links" variants={itemVariants}>
          <Link to={ROUTES.FORGOT_PASSWORD} className="company-form__link">
            نسيت كلمة المرور؟
          </Link>

          <span className="company-form__divider">|</span>

          <Link to={ROUTES.LOGIN} className="company-form__link">
            تسجيل دخول المستخدمين
          </Link>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}

export default CompanyLoginForm;