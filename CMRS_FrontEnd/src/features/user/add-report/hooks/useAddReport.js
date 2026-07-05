import { useCallback, useEffect, useState } from 'react';
import {
  confirmDuplicateReport,
  createAddReportSubmission,
  getIssueCategories,
} from '../api/addReportApi';

function useAddReport() {
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const loadCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      setCategoriesError('');

      const nextCategories = await getIssueCategories();

      setCategories(Array.isArray(nextCategories) ? nextCategories : []);
    } catch (error) {
      setCategories([]);
      setCategoriesError(
        error?.message || 'تعذر تحميل أنواع البلاغات حاليًا.'
      );
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  const submitReport = useCallback(async (payload, options) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      return await createAddReportSubmission(payload, options);
    } catch (error) {
      setSubmitError(error?.message || 'تعذر إرسال البلاغ حاليًا.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const confirmDuplicate = useCallback(async (reportId) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      return await confirmDuplicateReport(reportId);
    } catch (error) {
      setSubmitError(error?.message || 'تعذر تأكيد البلاغ الحالي.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoadingCategories,
    categoriesError,

    isSubmitting,
    submitError,

    loadCategories,
    submitReport,
    confirmDuplicate,
  };
}

export default useAddReport;