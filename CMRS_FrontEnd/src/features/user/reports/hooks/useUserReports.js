import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getUserReports,
  REPORT_STATUS_API_VALUES,
} from '../api/userReportsApi';

function buildDashboardStats(reports = [], totalCount = reports.length) {
  const pendingReports = reports.filter((report) => {
    return [
      REPORT_STATUS_API_VALUES.underReview,
      REPORT_STATUS_API_VALUES.pendingAdminApproval,
      REPORT_STATUS_API_VALUES.needsCompletion,
    ].includes(report.statusKey);
  }).length;

  const inProgressReports = reports.filter((report) => {
    return [
      REPORT_STATUS_API_VALUES.accepted,
      REPORT_STATUS_API_VALUES.assigned,
      REPORT_STATUS_API_VALUES.inProgress,
      REPORT_STATUS_API_VALUES.unableToExecute,
    ].includes(report.statusKey);
  }).length;

  const solvedReports = reports.filter((report) => {
    return report.statusKey === REPORT_STATUS_API_VALUES.resolved;
  }).length;

  return [
    {
      id: 'total',
      title: 'البلاغات المقدمة',
      subtitle: 'Total Reports',
      value: totalCount,
      tone: 'primary',
    },
    {
      id: 'pending',
      title: 'قيد المراجعة',
      subtitle: 'Under Review / Needs Action',
      value: pendingReports,
      tone: 'warning',
    },
    {
      id: 'in-progress',
      title: 'جاري التنفيذ',
      subtitle: 'Accepted / Assigned / In Progress',
      value: inProgressReports,
      tone: 'info',
    },
    {
      id: 'solved',
      title: 'تم الحل',
      subtitle: 'Resolved',
      value: solvedReports,
      tone: 'success',
    },
  ];
}

function isRejectedReport(report = {}) {
  return (
    report.statusKey === REPORT_STATUS_API_VALUES.rejected ||
    report.statusTone === 'danger'
  );
}

function buildMapMarkers(reports = []) {
  return reports
    .filter((report) => !isRejectedReport(report))
    .filter((report) => report.position?.lat && report.position?.lng)
    .map((report) => ({
      id: `mine-${report.reportId || report.id}`,
      reportId: report.reportId || report.id,
      originalId: report.reportId || report.id,
      source: 'mine',

      title: report.title,
      subtitle: report.issueCategoryName || report.categoryLabel,

      area:
        typeof report.area === 'string'
          ? report.area
          : report.area?.city || report.areaText || '',

      statusLabel: report.statusLabel,
      tone: report.statusTone,

      address: report.locationText,
      position: report.position,

      report,
    }));
}

export function useUserReports(userId, pageNumberOrOptions = 1) {
  const options =
    typeof pageNumberOrOptions === 'object'
      ? pageNumberOrOptions
      : { pageNumber: pageNumberOrOptions };

  const { pageNumber = 1, pageSize = 10 } = options;

  const [reports, setReports] = useState([]);

  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadReports = useCallback(async () => {
    if (!userId) {
      setReports([]);
      setPagination({
        totalCount: 0,
        pageNumber: 1,
        pageSize,
        totalPages: 1,
      });
      setErrorMessage('');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await getUserReports({
        userId,
        pageNumber,
        pageSize,
      });

      setReports(response.items || []);
      setPagination({
        totalCount: response.totalCount || 0,
        pageNumber: response.pageNumber || pageNumber,
        pageSize: response.pageSize || pageSize,
        totalPages: response.totalPages || 1,
      });
    } catch (error) {
      setReports([]);
      setPagination({
        totalCount: 0,
        pageNumber: 1,
        pageSize,
        totalPages: 1,
      });
      setErrorMessage(error?.message || 'تعذر تحميل بلاغاتك حاليًا.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, pageNumber, pageSize]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const recentReports = useMemo(() => {
    return reports.slice(0, 3);
  }, [reports]);

  const dashboardStats = useMemo(() => {
    return buildDashboardStats(reports, pagination.totalCount);
  }, [reports, pagination.totalCount]);

  const mapMarkers = useMemo(() => {
    return buildMapMarkers(reports);
  }, [reports]);

  return {
    reports,
    recentReports,
    dashboardStats,
    mapMarkers,
    pagination,
    isLoading,
    errorMessage,
    refreshReports: loadReports,
  };
}

export default useUserReports;