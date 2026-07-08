import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiCheck, FiHome } from 'react-icons/fi';
import { ROUTES } from '../../../shared/navigation';
import PasswordInput from './PasswordInput';
import { registerUser } from '../api/authApi';

const GOVERNORATE_OPTIONS = [
  { value: 'القاهرة', label: 'القاهرة' },
  { value: 'الجيزة', label: 'الجيزة' },
  { value: 'القليوبية', label: 'القليوبية' },
];

const initialValues = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
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

function SignupForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);

  const selectedCity = GOVERNORATE_OPTIONS.find(
    (city) => city.value === formData.city
  );

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errorMessage) {
      setErrorMessage('');
    }
  }

  function handleCitySelect(city) {
    setFormData((prev) => ({
      ...prev,
      city: city.value,
    }));

    setIsCityMenuOpen(false);

    if (errorMessage) {
      setErrorMessage('');
    }
  }

  function validateForm() {
    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.city.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      return 'من فضلك املأ جميع الحقول المطلوبة.';
    }

    if (formData.password.length < 8) {
      return 'كلمة المرور يجب ألا تقل عن 8 أحرف.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'كلمتا المرور غير متطابقتين.';
    }

    if (!formData.termsAccepted) {
      return 'يجب الموافقة على الشروط والأحكام أولاً.';
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

      const response = await registerUser(formData);

      if (response?.success === false) {
        throw new Error(response.message || 'حدث خطأ أثناء إنشاء الحساب.');
      }

      navigate(ROUTES.LOGIN, {
        replace: true,
        state: {
          email: formData.email,
          message:
            response?.message ||
            'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.',
        },
      });
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء إنشاء الحساب.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      className="signup-form"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.12 }}
    >
      <motion.header className="signup-form__header" variants={itemVariants}>
        <h1 className="signup-form__title">انضم إلينا</h1>
        <p className="signup-form__lead">كن جزءًا من التغيير</p>
        <p className="signup-form__subtitle">
          سجل حسابك الآن وساهم في بناء مدينة أفضل للجميع
        </p>
      </motion.header>

      <motion.div variants={itemVariants}>
        <Link to={ROUTES.HOME} className="auth-back-home-btn">
          <FiHome />
          الرجوع للصفحة الرئيسية
        </Link>
      </motion.div>

      <motion.form
        className="signup-form__body"
        onSubmit={handleSubmit}
        noValidate
        variants={containerVariants}
      >
        <motion.div className="signup-form__grid" variants={containerVariants}>
          <motion.div className="signup-form__field" variants={itemVariants}>
            <label htmlFor="fullName">الاسم الكامل</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="مثال: أحمد محمد"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
            />
          </motion.div>

          <motion.div className="signup-form__field" variants={itemVariants}>
            <label htmlFor="phone">رقم الهاتف</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="مثال: 0123456789"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </motion.div>

          <motion.div className="signup-form__field" variants={itemVariants}>
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="مثال: example@mail.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </motion.div>

          <motion.div className="signup-form__field" variants={itemVariants}>
            <label>المحافظة</label>

            <div
              className={`signup-city-dropdown ${
                isCityMenuOpen ? 'is-open' : ''
              }`}
            >
              <button
                type="button"
                className={`signup-city-dropdown__button ${
                  selectedCity ? 'is-selected' : ''
                }`}
                onClick={() => setIsCityMenuOpen((current) => !current)}
                aria-expanded={isCityMenuOpen}
                aria-label="اختيار المحافظة"
              >
                <span>{selectedCity?.label || 'اختر المحافظة'}</span>
                <FiChevronDown />
              </button>

              {isCityMenuOpen ? (
                <div className="signup-city-dropdown__menu">
                  {GOVERNORATE_OPTIONS.map((city) => {
                    const isActive = formData.city === city.value;

                    return (
                      <button
                        key={city.value}
                        type="button"
                        className={`signup-city-dropdown__item ${
                          isActive ? 'is-active' : ''
                        }`}
                        onClick={() => handleCitySelect(city)}
                      >
                        <span>{city.label}</span>
                        {isActive ? <FiCheck /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div className="signup-form__field" variants={itemVariants}>
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

          <motion.div className="signup-form__field" variants={itemVariants}>
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

        <motion.label className="signup-form__checkbox" variants={itemVariants}>
          <input
            type="checkbox"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleChange}
          />
          <span>أوافق على الشروط والأحكام</span>
        </motion.label>

        {errorMessage ? (
          <motion.p
            className="signup-form__error"
            role="alert"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errorMessage}
          </motion.p>
        ) : null}

        <motion.button
          type="submit"
          className="signup-form__submit"
          disabled={isSubmitting}
          variants={itemVariants}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
        >
          {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
        </motion.button>

        <motion.p className="signup-form__footer" variants={itemVariants}>
          لديك حساب بالفعل؟{' '}
          <Link to={ROUTES.LOGIN} className="signup-form__footer-link">
            سجل الدخول
          </Link>
        </motion.p>
      </motion.form>
    </motion.div>
  );
}

export default SignupForm;