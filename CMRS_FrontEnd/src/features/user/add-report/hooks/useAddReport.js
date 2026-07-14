import { useCallback, useEffect, useState } from 'react';
import {
  createAddReportSubmission,
  followDuplicateReport,
  getIssueCategories,
  unfollowDuplicateReport,
  unverifyDuplicateReport,
  verifyDuplicateReport,
} from '../api/addReportApi';

function useAddReport() {
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [activeDuplicateAction, setActiveDuplicateAction] = useState('');
  const [duplicateActionError, setDuplicateActionError] = useState('');
  const [duplicateActionMessage, setDuplicateActionMessage] = useState('');

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

  const resetDuplicateActionFeedback = useCallback(() => {
    setActiveDuplicateAction('');
    setDuplicateActionError('');
    setDuplicateActionMessage('');
  }, []);

  const toggleDuplicateFollow = useCallback(
    async ({ reportId, isFollowed, currentLatitude, currentLongitude }) => {
      if (!reportId || activeDuplicateAction) return null;

      setActiveDuplicateAction(`follow:${reportId}`);
      setDuplicateActionError('');
      setDuplicateActionMessage('');

      try {
        const data = isFollowed
          ? await unfollowDuplicateReport(reportId)
          : await followDuplicateReport(reportId, {
              currentLatitude,
              currentLongitude,
            });

        setDuplicateActionMessage(
          isFollowed
            ? 'تم إلغاء متابعة البلاغ بنجاح.'
            : 'تمت متابعة البلاغ بنجاح.'
        );

        return {
          data: data || {},
          requestedIsFollowed: !isFollowed,
        };
      } catch (error) {
        setDuplicateActionError(
          error?.message || 'تعذر تحديث متابعة البلاغ حاليًا.'
        );
        return null;
      } finally {
        setActiveDuplicateAction('');
      }
    },
    [activeDuplicateAction]
  );

  const toggleDuplicateVerify = useCallback(
    async ({ reportId, currentVote, vote }) => {
      if (!reportId || activeDuplicateAction) return null;

      const normalizedVote = Number(vote) === -1 ? -1 : 1;
      const shouldRemoveCurrentVote = Number(currentVote) === normalizedVote;

      setActiveDuplicateAction(`verify:${reportId}:${normalizedVote}`);
      setDuplicateActionError('');
      setDuplicateActionMessage('');

      try {
        const data = shouldRemoveCurrentVote
          ? await unverifyDuplicateReport(reportId)
          : await verifyDuplicateReport(reportId, normalizedVote);

        if (shouldRemoveCurrentVote) {
          setDuplicateActionMessage('تم إلغاء تصويتك على البلاغ.');
        } else if (normalizedVote === 1) {
          setDuplicateActionMessage('تم تسجيل أن البلاغ صحيح.');
        } else {
          setDuplicateActionMessage('تم تسجيل أن البلاغ غير صحيح.');
        }

        return {
          data: data || {},
          normalizedVote,
          shouldRemoveCurrentVote,
        };
      } catch (error) {
        setDuplicateActionError(
          error?.message || 'تعذر تحديث تصويتك على البلاغ حاليًا.'
        );
        return null;
      } finally {
        setActiveDuplicateAction('');
      }
    },
    [activeDuplicateAction]
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoadingCategories,
    categoriesError,

    isSubmitting,
    submitError,

    activeDuplicateAction,
    duplicateActionError,
    duplicateActionMessage,

    loadCategories,
    submitReport,
    toggleDuplicateFollow,
    toggleDuplicateVerify,
    resetDuplicateActionFeedback,
  };
}

export default useAddReport;
