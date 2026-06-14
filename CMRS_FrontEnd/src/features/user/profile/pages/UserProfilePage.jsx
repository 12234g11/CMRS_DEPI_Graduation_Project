import { useEffect, useState } from 'react';
import { FiRefreshCcw } from 'react-icons/fi';
import { useAuth } from '../../../auth/hooks/useAuth';
import ProfileHeader from '../components/ProfileHeader';
import ProfileInfoCard from '../components/ProfileInfoCard';
import UserStatsCard from '../components/UserStatsCard';
import {
  getUserProfile,
  updateUserProfile,
} from '../api/userProfileApi';
import '../user-profile.css';

function UserProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [formValues, setFormValues] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);

        const response = await getUserProfile(user);

        if (isMounted) {
          setProfile(response.profile);
          setFormValues(response.profile);
          setAchievements(response.achievements);
          setRecentActivity(response.recentActivity);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleEdit = () => {
    setMessage('');
    setFormValues(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setMessage('');
    setFormValues(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formValues.fullName.trim() || !formValues.email.trim() || !formValues.phone.trim()) {
      setMessage('من فضلك أكمل الاسم والبريد الإلكتروني ورقم الهاتف.');
      return;
    }

    try {
      setIsSaving(true);
      setMessage('');

      const nextProfile = await updateUserProfile(user, {
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        city: formValues.city.trim(),
        bio: formValues.bio.trim(),
      });

      setProfile(nextProfile);
      setFormValues(nextProfile);
      setIsEditing(false);
      setMessage('تم حفظ بيانات الملف الشخصي بنجاح.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile || !formValues) {
    return (
      <div className="dashboard-page user-profile-page">
        <div className="user-profile-loading">
          <FiRefreshCcw />
          <span>جارٍ تحميل الملف الشخصي...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page user-profile-page">
      <ProfileHeader
        profile={profile}
        isEditing={isEditing}
        isSaving={isSaving}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {message ? (
        <div className={`user-profile-message ${isEditing ? 'is-error' : 'is-success'}`}>
          {message}
        </div>
      ) : null}

      <div className="user-profile-grid">
        <ProfileInfoCard
          values={formValues}
          isEditing={isEditing}
          onChange={setFormValues}
        />

        <UserStatsCard
          profile={profile}
          achievements={achievements}
          recentActivity={recentActivity}
        />
      </div>
    </div>
  );
}

export default UserProfilePage;