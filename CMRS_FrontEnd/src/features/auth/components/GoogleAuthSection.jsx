import { useRef, useState } from 'react';
import GoogleAuthButton from './GoogleAuthButton';
import { googleLoginUser } from '../api/authApi';
import { useAuthenticationFlow } from '../hooks/useAuthenticationFlow';

function GoogleAuthSection({ dividerText = 'أو أكمل باستخدام البريد الإلكتروني' }) {
  const { completeAuthentication } = useAuthenticationFlow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isSubmittingRef = useRef(false);

  async function handleCredential(idToken) {
    if (isSubmittingRef.current) return;

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setErrorMessage('');

      const response = await googleLoginUser(idToken);
      completeAuthentication(response);
    } catch (error) {
      setErrorMessage(
        error?.message || 'حدث خطأ أثناء تسجيل الدخول باستخدام Google.'
      );
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function handleGoogleError(error) {
    setErrorMessage(
      error?.message || 'تعذر تسجيل الدخول باستخدام Google. حاول مرة أخرى.'
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

      {errorMessage ? (
        <p className="google-auth-section__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}

export default GoogleAuthSection;
