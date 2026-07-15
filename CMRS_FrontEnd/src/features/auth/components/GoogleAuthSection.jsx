import { useRef, useState } from 'react';
import GoogleAuthButton from './GoogleAuthButton';
import AuthErrorList from './AuthErrorList';
import { googleLoginUser } from '../api/authApi';
import { useAuthenticationFlow } from '../hooks/useAuthenticationFlow';
import { getApiErrorMessages } from '../utils/authValidation';

function GoogleAuthSection({ dividerText = 'أو أكمل باستخدام البريد الإلكتروني' }) {
  const { completeAuthentication } = useAuthenticationFlow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const isSubmittingRef = useRef(false);

  async function handleCredential(idToken) {
    if (isSubmittingRef.current) return;

    if (!idToken) {
      setErrorMessages(['لم يتم استلام بيانات تسجيل الدخول من Google.']);
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setErrorMessages([]);

      const response = await googleLoginUser(idToken);
      completeAuthentication(response);
    } catch (error) {
      setErrorMessages(
        getApiErrorMessages(
          error,
          'تعذر تسجيل الدخول باستخدام Google. حاول مرة أخرى.'
        )
      );
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function handleGoogleError(error) {
    setErrorMessages(
      getApiErrorMessages(
        error,
        'تعذر تشغيل تسجيل الدخول باستخدام Google. حاول مرة أخرى.'
      )
    );
  }

  return (
    <section
      className="google-auth-section"
      aria-label="تسجيل الدخول باستخدام Google"
    >
      <div className="google-auth-divider" aria-hidden="true">
        <span>{dividerText}</span>
      </div>

      <GoogleAuthButton
        onCredential={handleCredential}
        onError={handleGoogleError}
        isLoading={isSubmitting}
      />

      <AuthErrorList
        messages={errorMessages}
        className="auth-error-list--google"
      />
    </section>
  );
}

export default GoogleAuthSection;
