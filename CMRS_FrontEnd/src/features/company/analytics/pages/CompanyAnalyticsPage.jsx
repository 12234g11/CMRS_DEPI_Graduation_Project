import { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { getCompanyAnalyticsData } from '../api/companyAnalyticsApi';
import CompanyAnalyticsStatsCards from '../components/CompanyAnalyticsStatsCards';
import CompanyReportsTrendChart from '../components/CompanyReportsTrendChart';
import CompanyStatusDistributionChart from '../components/CompanyStatusDistributionChart';
import '../company-analytics.css';

const INITIAL_ANALYTICS_DATA = {
  stats: [],
  summary: {
    companyName: '',
    periodLabel: 'آخر 6 شهور',
    averageClosingTime: '0 يوم',
    completionRate: 0,
  },
  reportsTrend: [],
  statusDistribution: [],
};

function CompanyAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(INITIAL_ANALYTICS_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadAnalyticsData() {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getCompanyAnalyticsData(6);
      setAnalyticsData(data);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'تعذر تحميل بيانات الإحصائيات. برجاء المحاولة مرة أخرى.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  return (
    <div className="dashboard-page company-analytics-page">
      <PageHeader
        title="التقارير والإحصائيات"
        subtitle="Company Analytics - متابعة أداء البلاغات الخاصة بالشركة"
      />

      <section className="company-analytics-hero">
        <div>
          <h2>{analyticsData.summary.companyName || 'إحصائيات الشركة'}</h2>
          <p>
            ملخص أداء الشركة خلال {analyticsData.summary.periodLabel}. متوسط
            وقت الإغلاق {analyticsData.summary.averageClosingTime} ونسبة
            الإنجاز {analyticsData.summary.completionRate}%.
          </p>

          {errorMessage ? (
            <p className="company-analytics-error-message">{errorMessage}</p>
          ) : null}
        </div>

        <button
          type="button"
          className="company-analytics-refresh-btn"
          onClick={loadAnalyticsData}
          disabled={isLoading}
        >
          <FiRefreshCw />
          {isLoading ? 'جاري التحديث...' : 'تحديث البيانات'}
        </button>
      </section>

      <CompanyAnalyticsStatsCards cards={analyticsData.stats} />

      <div className="company-analytics-charts-grid">
        <CompanyReportsTrendChart data={analyticsData.reportsTrend} />

        <CompanyStatusDistributionChart
          data={analyticsData.statusDistribution}
        />
      </div>
    </div>
  );
}

export default CompanyAnalyticsPage;
