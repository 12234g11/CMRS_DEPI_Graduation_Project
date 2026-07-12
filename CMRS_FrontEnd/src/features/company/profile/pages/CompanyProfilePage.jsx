import { useEffect, useState } from 'react';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { getCompanyProfileData } from '../api/companyProfileApi';
import CompanyProfileAccountCard from '../components/CompanyProfileAccountCard';
import CompanyProfileHeader from '../components/CompanyProfileHeader';
import CompanyProfileInfoCard from '../components/CompanyProfileInfoCard';
import CompanyProfileStatsCards from '../components/CompanyProfileStatsCards';
import {
  companyProfileMockData,
  getCompanyProfileStats,
} from '../mocks/companyProfileMockData';
import '../company-profile.css';

function CompanyProfilePage() {
  const [profileData, setProfileData] = useState({
    profile: companyProfileMockData,
    stats: getCompanyProfileStats(companyProfileMockData),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadCompanyProfile() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const data = await getCompanyProfileData();

        if (!isMounted) return;

        setProfileData({
          profile: data?.profile ?? companyProfileMockData,
          stats: Array.isArray(data?.stats)
            ? data.stats
            : getCompanyProfileStats(data?.profile ?? companyProfileMockData),
        });
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(
          error?.response?.data?.message ||
            'تعذر تحميل بيانات الملف الشخصي للشركة في الوقت الحالي.'
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCompanyProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const { profile, stats } = profileData;

  return (
    <div className="dashboard-page company-profile-page">
      <PageHeader
        title="الملف الشخصي"
        subtitle="Company Profile - بيانات الشركة وحساب التشغيل"
      />

      {errorMessage ? (
        <div className="company-profile-alert" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <CompanyProfileHeader profile={profile} isLoading={isLoading} />

      <CompanyProfileStatsCards stats={stats} isLoading={isLoading} />

      <div className="company-profile-grid company-profile-grid--simple">
        <CompanyProfileInfoCard profile={profile} isLoading={isLoading} />

        <CompanyProfileAccountCard profile={profile} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default CompanyProfilePage;
