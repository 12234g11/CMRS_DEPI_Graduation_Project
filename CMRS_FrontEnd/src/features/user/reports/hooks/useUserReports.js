import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getUserReports,
  getUserReportStats,
} from '../api/userReportsApi';

const EMPTY_REPORT_STATS = {
  totalReports: 0,
  statusCards: [],
};

function buildMapMarkers(reports = []) {
  return reports
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
  const [reportStats, setReportStats] = useState(EMPTY_REPORT_STATS);

  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statsErrorMessage, setStatsErrorMessage] = useState('');

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

  const loadStats = useCallback(async () => {
    if (!userId) {
      setReportStats(EMPTY_REPORT_STATS);
      setStatsErrorMessage('');
      return;
    }

    try {
      setIsStatsLoading(true);
      setStatsErrorMessage('');

      const stats = await getUserReportStats();
      setReportStats(stats || EMPTY_REPORT_STATS);
    } catch (error) {
      setReportStats(EMPTY_REPORT_STATS);
      setStatsErrorMessage(
        error?.message || 'تعذر تحميل إحصائيات البلاغات حاليًا.'
      );
    } finally {
      setIsStatsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const recentReports = useMemo(() => {
    return reports.slice(0, 3);
  }, [reports]);

  const mapMarkers = useMemo(() => {
    return buildMapMarkers(reports);
  }, [reports]);

  const refreshReports = useCallback(async () => {
    await Promise.all([loadReports(), loadStats()]);
  }, [loadReports, loadStats]);

  return {
    reports,
    recentReports,
    reportStats,
    mapMarkers,
    pagination,
    isLoading,
    isStatsLoading,
    errorMessage,
    statsErrorMessage,
    refreshReports,
    refreshStats: loadStats,
  };
}

export default useUserReports;
