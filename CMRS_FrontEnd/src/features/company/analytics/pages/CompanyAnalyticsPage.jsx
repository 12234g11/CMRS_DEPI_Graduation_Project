import { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { getCompanyAnalyticsData } from '../api/companyAnalyticsApi';
import CompanyAnalyticsStatsCards from '../components/CompanyAnalyticsStatsCards';
import CompanyReportsTrendChart from '../components/CompanyReportsTrendChart';
import CompanyStatusDistributionChart from '../components/CompanyStatusDistributionChart';
import {
  companyAnalyticsStats,
  companyAnalyticsSummary,
  companyReportsTrendData,
  companyStatusDistributionData,
} from '../mocks/companyAnalyticsMockData';
import '../company-analytics.css';

function CompanyAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    stats: companyAnalyticsStats,
    summary: companyAnalyticsSummary,
    reportsTrend: companyReportsTrendData,
    statusDistribution: companyStatusDistributionData,
  });

  const [isLoading, setIsLoading] = useState(false);

  async function loadAnalyticsData() {
    setIsLoading(true);

    const data = await getCompanyAnalyticsData();

    setAnalyticsData(data);
    setIsLoading(false);
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
          <h2>{analyticsData.summary.companyName}</h2>
          <p>
            ملخص أداء الشركة خلال {analyticsData.summary.periodLabel}. متوسط
            وقت الإغلاق {analyticsData.summary.averageClosingTime} ونسبة
            الإنجاز {analyticsData.summary.completionRate}%.
          </p>
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