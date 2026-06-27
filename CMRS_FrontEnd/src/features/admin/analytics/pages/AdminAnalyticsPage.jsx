import { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { getAdminAnalytics } from '../api/adminAnalyticsApi';
import AdminAnalyticsStatsCards from '../components/AdminAnalyticsStatsCards';
import AnalyticsReportsLineChart from '../components/AnalyticsReportsLineChart';
import AnalyticsReportTypesChart from '../components/AnalyticsReportTypesChart';
import { adminAnalyticsMockData } from '../mocks/adminAnalyticsMockData';
import '../admin-analytics.css';

function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(adminAnalyticsMockData);
  const [isLoading, setIsLoading] = useState(false);

  async function loadAnalytics() {
    setIsLoading(true);

    try {
      const data = await getAdminAnalytics();
      setAnalyticsData(data);
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
          <FiRefreshCw />
          {isLoading ? 'جاري التحديث...' : 'تحديث البيانات'}
        </button>
      </section>

      <AdminAnalyticsStatsCards cards={analyticsData.summaryCards} />

      <div className="admin-analytics-charts-grid">
        <AnalyticsReportsLineChart data={analyticsData.reportsOverTime} />
        <AnalyticsReportTypesChart data={analyticsData.reportTypes} />
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;