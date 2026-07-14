import { useEffect, useRef } from 'react';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '783159567003-rda7qnl3qsn8r6vb1sors9mj939ititq.apps.googleusercontent.com';

const GOOGLE_SCRIPT_ID = 'google-identity-services-script';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let googleScriptPromise;

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    let script = document.getElementById(GOOGLE_SCRIPT_ID);

    const handleLoad = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
        return;
      }

      googleScriptPromise = undefined;
      reject(new Error('تعذر تهيئة خدمة تسجيل الدخول باستخدام Google.'));
    };

    const handleError = () => {
      googleScriptPromise = undefined;
      reject(new Error('تعذر تحميل خدمة تسجيل الدخول باستخدام Google.'));
    };

    if (!script) {
      script = document.createElement('script');
      script.id = GOOGLE_SCRIPT_ID;
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', handleLoad, { once: true });
      script.addEventListener('error', handleError, { once: true });
      document.head.appendChild(script);
      return;
    }

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    window.setTimeout(() => {
      if (window.google?.accounts?.id) {
        handleLoad();
      }
    }, 0);
  });

  return googleScriptPromise;
}

function GoogleAuthButton({ onCredential, onError, isLoading = false }) {
  const buttonContainerRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let isDisposed = false;
    let animationFrameId;

    loadGoogleIdentityServices()
      .then((google) => {
        if (isDisposed || !buttonContainerRef.current) return;

        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (credentialResponse) => {
            const idToken = credentialResponse?.credential;

            if (!idToken) {
              onErrorRef.current?.(
                new Error('لم يتم استلام بيانات تسجيل الدخول من Google.')
              );
              return;
            }

            onCredentialRef.current?.(idToken);
          },
        });

        animationFrameId = window.requestAnimationFrame(() => {
          const container = buttonContainerRef.current;
          if (isDisposed || !container) return;

          const measuredWidth = Math.floor(container.clientWidth);
          const buttonWidth = Math.min(
            Math.max(measuredWidth || 280, 240),
            400
          );

          google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            locale: 'ar',
            width: buttonWidth,
          });
        });
      })
      .catch((error) => {
        if (!isDisposed) {
          onErrorRef.current?.(error);
        }
      });

    return () => {
      isDisposed = true;

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div
      className={`google-auth-button ${isLoading ? 'is-loading' : ''}`}
      aria-busy={isLoading}
    >
      <div
        ref={buttonContainerRef}
        className="google-auth-button__target"
        aria-label="المتابعة باستخدام Google"
      />

      {isLoading ? (
        <span className="google-auth-button__loading" role="status">
          جاري تسجيل الدخول باستخدام Google...
        </span>
      ) : null}
    </div>
  );
}

export default GoogleAuthButton;
