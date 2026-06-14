import { useCallback, useState } from 'react';

function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const requestLocation = useCallback(() => {
    if (!window.isSecureContext) {
      setError('تحديد الموقع يحتاج رابط آمن HTTPS.');
      return;
    }

    if (!navigator.geolocation) {
      setError('المتصفح الحالي لا يدعم تحديد الموقع.');
      return;
    }

    setIsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (geoError) => {
        if (geoError?.code === 1) {
          setError('تم رفض إذن الوصول للموقع. اسمح بالوصول للموقع ثم أعد المحاولة.');
        } else if (geoError?.code === 2) {
          setError('تعذر تحديد موقعك الحالي. تأكد من تشغيل خدمة الموقع والـ GPS.');
        } else if (geoError?.code === 3) {
          setError('انتهت مهلة تحديد الموقع. حاول مرة أخرى في مكان إشارة أفضل.');
        } else {
          setError('تعذر الوصول إلى موقعك الحالي.');
        }

        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  }, []);

  return {
    location,
    isLoading,
    error,
    requestLocation,
  };
}

export default useCurrentLocation;