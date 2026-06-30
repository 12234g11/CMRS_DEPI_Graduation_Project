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

  useEffect(() => {
    let isMounted = true;

    getCompanyProfileData().then((data) => {
      if (!isMounted) return;

      setProfileData(data);
    });

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

      <CompanyProfileHeader profile={profile} />

      <CompanyProfileStatsCards stats={stats} />

      <div className="company-profile-grid company-profile-grid--simple">
        <CompanyProfileInfoCard profile={profile} />

        <CompanyProfileAccountCard profile={profile} />
      </div>
    </div>
  );
}

export default CompanyProfilePage;