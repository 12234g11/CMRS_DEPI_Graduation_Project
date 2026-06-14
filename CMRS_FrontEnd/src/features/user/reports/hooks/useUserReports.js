import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  USER_REPORTS_UPDATED_EVENT,
  getStoredUserReports,
} from '../api/mockUserReportsStore';

function buildDashboardStats(reports = []) {
  const pendingReports = reports.filter((report) => report.status === 'pending').length;
  const inProgressReports = reports.filter((report) => report.status === 'in-progress').length;
  const solvedReports = reports.filter((report) => report.status === 'solved').length;

  return [
    {
      id: 'total',
      title: 'البلاغات المقدمة',
      subtitle: 'Total Reports',
      value: reports.length,
      tone: 'primary',
    },
    {
      id: 'pending',
      title: 'قيد المراجعة',
      subtitle: 'Pending',
      value: pendingReports,
      tone: 'warning',
    },
    {
      id: 'in-progress',
      title: 'جاري الحل',
      subtitle: 'In Progress',
      value: inProgressReports,
      tone: 'info',
    },
    {
      id: 'solved',
      title: 'تم الحل',
      subtitle: 'Solved',
      value: solvedReports,
      tone: 'success',
    },
  ];
}

function buildMapMarkers(reports = []) {
  return reports.map((report) => ({
    id: `user-report-${report.id}`,
    title: report.title,
    subtitle: report.categoryLabel,
    area: report.area,
    statusLabel: report.statusLabel,
    tone: report.statusTone,
    address: report.locationText || report.address,
    position: report.position,
  }));
}

export function useUserReports(userId) {
  const readReports = useCallback(() => getStoredUserReports(userId), [userId]);
  const [reports, setReports] = useState(() => readReports());

  useEffect(() => {
    setReports(readReports());

    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleReportsUpdated = (event) => {
      const updatedUserId = String(event?.detail?.userId ?? 'guest');
      const currentUserId = String(userId ?? 'guest');

      if (updatedUserId === currentUserId) {
        setReports(readReports());
      }
    };

    const handleStorageChange = (event) => {
      if (!event.key || event.key === 'cmrs:user-reports:v1') {
        setReports(readReports());
      }
    };

    window.addEventListener(USER_REPORTS_UPDATED_EVENT, handleReportsUpdated);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(USER_REPORTS_UPDATED_EVENT, handleReportsUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [readReports, userId]);

  const recentReports = useMemo(() => reports.slice(0, 3), [reports]);
  const dashboardStats = useMemo(() => buildDashboardStats(reports), [reports]);
  const mapMarkers = useMemo(() => buildMapMarkers(reports), [reports]);

  return {
    reports,
    recentReports,
    dashboardStats,
    mapMarkers,
  };
}

export default useUserReports;
