import { useEffect, useState } from 'react';
import { FiRefreshCcw } from 'react-icons/fi';

import ProfileHeader from '../components/ProfileHeader';
import ProfileInfoCard from '../components/ProfileInfoCard';
import UserStatsCard from '../components/UserStatsCard';
import {
  getUserProfile,
  updateUserProfile,
} from '../api/userProfileApi';
import '../user-profile.css';

function createEditableProfile(profile = {}) {
  return {
    fullName: profile.fullName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    city: profile.city || '',
  };
}

function validateProfileForm(values = {}) {
  const errors = {};

  if (!String(values.fullName || '').trim()) {
    errors.fullName = 'الاسم الكامل مطلوب.';
  }

  if (!String(values.email || '').trim()) {
    errors.email = 'البريد الإلكتروني مطلوب.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'برجاء إدخال بريد إلكتروني صحيح.';
  }

  if (!String(values.phone || '').trim()) {
    errors.phone = 'رقم الهاتف مطلوب.';
  } else if (!/^01[0-9]{9}$/.test(values.phone.trim())) {
    errors.phone = 'رقم الهاتف يجب أن يكون رقم مصري صحيح مكون من 11 رقم.';
  }

  if (!String(values.city || '').trim()) {
    errors.city = 'المدينة مطلوبة.';
  }

  return errors;
}

function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formValues, setFormValues] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  async function loadProfile() {
    try {
      setIsLoading(true);
      setMessage('');
      setMessageType('');

      const response = await getUserProfile();

      setProfile(response.profile);
      setFormValues(createEditableProfile(response.profile));
      setAchievements(response.achievements);
      setRecentActivity(response.recentActivity);
    } catch (error) {
      setMessage(error?.message || 'تعذر تحميل بيانات الملف الشخصي.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function handleEdit() {
    setMessage('');
    setMessageType('');
    setFormErrors({});
    setFormValues(createEditableProfile(profile));
    setIsEditing(true);
  }

  function handleCancel() {
    setMessage('');
    setMessageType('');
    setFormErrors({});
    setFormValues(createEditableProfile(profile));
    setIsEditing(false);
  }

  async function handleSave() {
    const nextErrors = validateProfileForm(formValues);

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setMessage('من فضلك راجع البيانات المطلوبة قبل الحفظ.');
      setMessageType('error');
      return;
    }

    try {
      setIsSaving(true);
      setMessage('');
      setMessageType('');

      const response = await updateUserProfile({
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        city: formValues.city.trim(),
      });

      const nextProfile = {
        ...profile,
        ...(response.profile || {}),
        fullName: response.profile?.fullName || formValues.fullName.trim(),
        email: response.profile?.email || formValues.email.trim(),
        phone: response.profile?.phone || formValues.phone.trim(),
        city: response.profile?.city || formValues.city.trim(),
      };

      setProfile(nextProfile);
      setFormValues(createEditableProfile(nextProfile));
      setFormErrors({});
      setIsEditing(false);

      setMessage(response.message || 'تم حفظ بيانات الملف الشخصي بنجاح.');
      setMessageType('success');
    } catch (error) {
      setMessage(error?.message || 'تعذر حفظ بيانات الملف الشخصي.');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="dashboard-page user-profile-page">
        <div className="user-profile-loading">
          <FiRefreshCcw />
          <span>جارٍ تحميل الملف الشخصي...</span>
        </div>
      </div>
    );
  }

  if (!profile || !formValues) {
    return (
      <div className="dashboard-page user-profile-page">
        <div className="user-profile-loading">
          <span>
            {message || 'تعذر تحميل بيانات الملف الشخصي. حاول مرة أخرى لاحقًا.'}
          </span>
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
        <div
          className={`user-profile-message ${
            messageType === 'error' ? 'is-error' : 'is-success'
          }`}
        >
          {message}
        </div>
      ) : null}

      <div className="user-profile-grid">
        <ProfileInfoCard
          values={formValues}
          isEditing={isEditing}
          onChange={setFormValues}
          errors={formErrors}
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