import { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { getAdminAnalytics } from '../api/adminAnalyticsApi';
import AdminAnalyticsStatsCards from '../components/AdminAnalyticsStatsCards';
import AnalyticsReportsLineChart from '../components/AnalyticsReportsLineChart';
import AnalyticsReportTypesChart from '../components/AnalyticsReportTypesChart';
import '../admin-analytics.css';

const EMPTY_ANALYTICS_DATA = {
  summaryCards: [],
  reportsOverTime: [],
  reportTypes: [],
};

function getErrorMessage(error) {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string') return responseData;

  return (
    responseData?.message ||
    responseData?.Message ||
    error?.message ||
    'حدث خطأ أثناء تحميل بيانات الإحصائيات.'
  );
}

function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(EMPTY_ANALYTICS_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadAnalytics() {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getAdminAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="dashboard-page admin-analytics-page">
      <section className="admin-analytics-hero">
        <div>
          <h1>التقارير والإحصائيات</h1>
          <p>Analytics & Insights - مراقبة أداء الصيانة البلدية والاتجاهات</p>
        </div>

        <button
          type="button"
          className="admin-analytics-refresh-btn"
          onClick={loadAnalytics}
          disabled={isLoading}
        >
          <FiRefreshCw className={isLoading ? 'admin-analytics-spin' : ''} />
          {isLoading ? 'جاري التحديث...' : 'تحديث البيانات'}
        </button>
      </section>

      {errorMessage ? (
        <div className="admin-analytics-alert" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <AdminAnalyticsStatsCards cards={analyticsData.summaryCards} />

      <div className="admin-analytics-charts-grid">
        <AnalyticsReportsLineChart data={analyticsData.reportsOverTime} />
        <AnalyticsReportTypesChart data={analyticsData.reportTypes} />
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;
