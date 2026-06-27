import { useEffect, useState } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { getAdminProfile } from '../api/adminProfileApi';
import AdminProfileActivityCard from '../components/AdminProfileActivityCard';
import AdminProfileDetailsCard from '../components/AdminProfileDetailsCard';
import AdminProfileHeader from '../components/AdminProfileHeader';
import AdminProfilePermissionsCard from '../components/AdminProfilePermissionsCard';
import AdminProfileStats from '../components/AdminProfileStats';
import { adminProfileMockData } from '../mocks/adminProfileMockData';
import '../admin-profile.css';

function mergeProfileWithUser(profile, user) {
  if (!user) return profile;

  return {
    ...profile,
    name: user.name || user.fullName || profile.name,
    email: user.email || profile.email,
    role: user.role || profile.role,
    governorate:
      user.governorateLabel ||
      user.governorate ||
      user.assignedGovernorate ||
      profile.governorate,
  };
}

function AdminProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() =>
    mergeProfileWithUser(adminProfileMockData, user),
  );

  useEffect(() => {
    let isMounted = true;

    getAdminProfile().then((data) => {
      if (isMounted) {
        setProfile(mergeProfileWithUser(data, user));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="dashboard-page admin-profile-page">
      <section className="admin-profile-hero">
        <div>
          <h1>الملف الشخصي</h1>
          <p>Admin Profile - بيانات حساب الأدمن ونطاق الصلاحيات</p>
        </div>
      </section>

      <AdminProfileHeader profile={profile} />

      <AdminProfileStats scope={profile.workScope} />

      <div className="admin-profile-grid">
        <div className="admin-profile-grid__main">
          <AdminProfileDetailsCard profile={profile} />
          <AdminProfilePermissionsCard permissions={profile.permissions} />
        </div>

        <div className="admin-profile-grid__side">
          <AdminProfileActivityCard activities={profile.recentActivities} />
        </div>
      </div>
    </div>
  );
}

export default AdminProfilePage;