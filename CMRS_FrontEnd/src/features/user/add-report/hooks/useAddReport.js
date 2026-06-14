import { useCallback, useState } from 'react';
import { createAddReportSubmission } from '../api/addReportApi';

export function useAddReport() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitReport = useCallback(async (payload) => {
    try {
      setIsSubmitting(true);
      setError('');

      const createdReport = await createAddReportSubmission(payload);
      return createdReport;
    } catch (submissionError) {
      console.error(submissionError);
      setError('تعذر إرسال البلاغ الآن. حاول مرة أخرى بعد قليل.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    submitReport,
    isSubmitting,
    error,
  };
}

export default useAddReport;
