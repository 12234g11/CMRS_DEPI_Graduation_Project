export const userProfileFallback = {
  id: 'guest',
  fullName: 'أحمد محمد',
  email: 'ahmed.mohammed@email.com',
  phone: '+966 55 123 4567',
  city: 'الجيزة',
  joinedAt: '2026-01-15T10:30:00.000Z',
  bio: 'مستخدم مهتم بتحسين جودة الخدمات العامة ومتابعة البلاغات القريبة منه.',
  trustScore: 87,
  stats: {
    totalReports: 24,
    solvedReports: 18,
    pendingReports: 4,
    rejectedReports: 2,
    helpfulVotes: 156,
    reportsAccuracy: 92,
    communityParticipation: 78,
    consistency: 91,
    resolutionRate: 81,
  },
};

export const userProfileAchievements = [
  {
    id: 'verified-reporter',
    title: 'مبلّغ موثوق',
    description: 'قدمت بلاغات واضحة ودقيقة أكثر من مرة.',
    tone: 'success',
  },
  {
    id: 'active-member',
    title: 'عضو نشط',
    description: 'تشارك باستمرار في تحسين المنطقة المحيطة بك.',
    tone: 'primary',
  },
  {
    id: 'community-helper',
    title: 'مساعد المجتمع',
    description: 'ساهمت في تأكيد بلاغات مستخدمين آخرين.',
    tone: 'warning',
  },
];

export const userProfileRecentActivity = [
  {
    id: 'activity-001',
    title: 'تم حل بلاغ قمت بإرساله',
    description: 'تم حل مشكلة تراكم القمامة في المعادي.',
    date: '2026-05-09T17:20:00.000Z',
  },
  {
    id: 'activity-002',
    title: 'تم قبول بلاغ جديد',
    description: 'بلاغ عمود الإنارة أصبح ظاهرًا على الخريطة.',
    date: '2026-05-08T21:10:00.000Z',
  },
  {
    id: 'activity-003',
    title: 'حصلت على تقييم إيجابي',
    description: 'قام مستخدمون بتأكيد أن بلاغك كان مفيدًا.',
    date: '2026-05-07T12:40:00.000Z',
  },
];