import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { ROUTES } from '../../../shared/navigation';
import { useAuth } from '../hooks/useAuth';
import { registerUser } from '../api/authApi';
import { authMockCities } from '../mocks/authMockData';

const initialValues = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
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
  const { login } = useAuth();

  const [formData, setFormData] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationText, setLocationText] = useState('استخدم موقعي الحالي');

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

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setErrorMessage('المتصفح الحالي لا يدعم تحديد الموقع.');
      return;
    }

    setIsLocating(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        console.log('Location success:', latitude, longitude);

        setLocationText('تم تحديد موقعك بنجاح');
        setFormData((prev) => ({
          ...prev,
          location: {
            lat: latitude,
            lng: longitude,
          },
        }));
        setIsLocating(false);
      },
      (error) => {
        console.log('Location error:', error);
        setErrorMessage('تعذر الوصول إلى موقعك الحالي.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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

    if (!formData.acceptTerms) {
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

      login({
        token: response.token,
        userData: response.user,
      });

      navigate(ROUTES.HOME, { replace: true });
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
            <label htmlFor="city">المدينة</label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
            >
              <option value="">اختر المدينة</option>
              {authMockCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div className="signup-form__field" variants={itemVariants}>
            <label htmlFor="password">كلمة المرور</label>
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

          <motion.div className="signup-form__field" variants={itemVariants}>
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
        </motion.div>

        <motion.button
          type="button"
          className="signup-form__location-btn"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          variants={itemVariants}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
        >
          <FaMapMarkerAlt />
          <span>{isLocating ? 'جاري تحديد الموقع...' : locationText}</span>
        </motion.button>

        <motion.label className="signup-form__checkbox" variants={itemVariants}>
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
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