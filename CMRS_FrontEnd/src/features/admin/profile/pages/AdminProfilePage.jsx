import { useEffect, useState } from 'react';
import { FiAlertCircle, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../../auth/hooks/useAuth';
import { getAdminProfile } from '../api/adminProfileApi';
import AdminProfileActivityCard from '../components/AdminProfileActivityCard';
import AdminProfileDetailsCard from '../components/AdminProfileDetailsCard';
import AdminProfileHeader from '../components/AdminProfileHeader';
import AdminProfilePermissionsCard from '../components/AdminProfilePermissionsCard';
import AdminProfileStats from '../components/AdminProfileStats';
import '../admin-profile.css';

function mergeProfileWithUser(profile, user) {
  if (!user) return profile;

  const governorate =
    profile.governorate ||
    user.governorateLabel ||
    user.governorate ||
    user.assignedGovernorate ||
    profile.workScope?.governorate ||
    'غير محدد';

  return {
    ...profile,
    name: profile.name || user.name || user.fullName || profile.email || 'مشرف النظام',
    email: profile.email || user.email || 'غير متاح',
    phone: profile.phone || user.phone || 'غير متاح',
    role: profile.role || user.role || 'Admin',
    governorate,
    workScope: {
      ...profile.workScope,
      governorate: profile.workScope?.governorate || governorate,
    },
  };
}

function AdminProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAdminProfile() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const data = await getAdminProfile();

        if (isMounted) {
          setProfile(mergeProfileWithUser(data, user));
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || 'تعذر تحميل بيانات الملف الشخصي.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAdminProfile();

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

      {isLoading ? (
        <section className="admin-profile-state-card">
          <FiLoader className="admin-profile-state-card__spinner" />
          <h2>جاري تحميل بيانات الملف الشخصي</h2>
          <p>برجاء الانتظار لحظات...</p>
        </section>
      ) : errorMessage ? (
        <section className="admin-profile-state-card admin-profile-state-card--error">
          <FiAlertCircle />
          <h2>تعذر تحميل بيانات الملف الشخصي</h2>
          <p>{errorMessage}</p>
        </section>
      ) : (
        profile && (
          <>
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
          </>
        )
      )}
    </div>
  );
}

export default AdminProfilePage;
