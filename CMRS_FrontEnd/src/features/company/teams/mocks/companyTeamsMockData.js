export const COMPANY_TEAM_STATUSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
};

export const COMPANY_TEAM_AVAILABILITY = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline',
};

export const companyTeamStatusOptions = [
  { value: 'all', label: 'كل الحالات' },
  { value: COMPANY_TEAM_STATUSES.ACTIVE, label: 'نشطة' },
  { value: COMPANY_TEAM_STATUSES.DISABLED, label: 'موقوفة' },
];

export const companyTeamAvailabilityOptions = [
  { value: 'all', label: 'كل حالات التوفر' },
  { value: COMPANY_TEAM_AVAILABILITY.AVAILABLE, label: 'متاحة' },
  { value: COMPANY_TEAM_AVAILABILITY.BUSY, label: 'مشغولة' },
  { value: COMPANY_TEAM_AVAILABILITY.OFFLINE, label: 'غير متاحة' },
];

export const companyTeams = [
  {
    id: 'team-1',
    name: 'فرقة الصيانة 1',
    leadName: 'م. أحمد سامي',
    phone: '+20 100 111 2020',
    membersCount: 5,
    maxCapacity: 5,
    activeTasks: 2,
    completedTasks: 34,
    status: COMPANY_TEAM_STATUSES.ACTIVE,
    statusLabel: 'نشطة',
    statusTone: 'success',
    availability: COMPANY_TEAM_AVAILABILITY.AVAILABLE,
    availabilityLabel: 'متاحة',
    availabilityTone: 'success',
    lastActivity: 'اليوم - 10:30 AM',
    notes: 'فرقة جاهزة للتعامل مع البلاغات المسندة من الشركة حسب أولوية التشغيل.',
  },
  {
    id: 'team-2',
    name: 'فرقة الصيانة 2',
    leadName: 'م. محمود طارق',
    phone: '+20 100 333 9090',
    membersCount: 6,
    maxCapacity: 4,
    activeTasks: 4,
    completedTasks: 41,
    status: COMPANY_TEAM_STATUSES.ACTIVE,
    statusLabel: 'نشطة',
    statusTone: 'success',
    availability: COMPANY_TEAM_AVAILABILITY.BUSY,
    availabilityLabel: 'مشغولة',
    availabilityTone: 'warning',
    lastActivity: 'أمس - 06:15 PM',
    notes: 'فرقة عليها أكثر من مهمة نشطة حاليًا، ويفضل عدم إسناد مهام عاجلة لها إلا عند الضرورة.',
  },
  {
    id: 'team-3',
    name: 'فرقة الطوارئ',
    leadName: 'م. كريم ناصر',
    phone: '+20 100 555 8080',
    membersCount: 4,
    maxCapacity: 6,
    activeTasks: 1,
    completedTasks: 28,
    status: COMPANY_TEAM_STATUSES.ACTIVE,
    statusLabel: 'نشطة',
    statusTone: 'success',
    availability: COMPANY_TEAM_AVAILABILITY.AVAILABLE,
    availabilityLabel: 'متاحة',
    availabilityTone: 'success',
    lastActivity: 'اليوم - 01:20 AM',
    notes: 'فرقة مناسبة للبلاغات العاجلة أو التي تحتاج تدخل سريع.',
  },
  {
    id: 'team-4',
    name: 'فرقة الدعم والمتابعة',
    leadName: 'م. ياسر فتحي',
    phone: '+20 100 777 3030',
    membersCount: 3,
    maxCapacity: 4,
    activeTasks: 0,
    completedTasks: 19,
    status: COMPANY_TEAM_STATUSES.ACTIVE,
    statusLabel: 'نشطة',
    statusTone: 'success',
    availability: COMPANY_TEAM_AVAILABILITY.AVAILABLE,
    availabilityLabel: 'متاحة',
    availabilityTone: 'success',
    lastActivity: '2026-04-07 - 11:45 AM',
    notes: 'فرقة مناسبة لأعمال المتابعة بعد الإصلاح واستكمال الملاحظات البسيطة.',
  },
  {
    id: 'team-5',
    name: 'فرقة احتياطية',
    leadName: 'م. عمرو خالد',
    phone: '+20 100 888 4040',
    membersCount: 4,
    maxCapacity: 5,
    activeTasks: 0,
    completedTasks: 12,
    status: COMPANY_TEAM_STATUSES.DISABLED,
    statusLabel: 'موقوفة',
    statusTone: 'danger',
    availability: COMPANY_TEAM_AVAILABILITY.OFFLINE,
    availabilityLabel: 'غير متاحة',
    availabilityTone: 'danger',
    lastActivity: '2026-04-02 - 09:10 AM',
    notes: 'موقوفة مؤقتًا لحين تحديث بيانات قائد الفرقة.',
  },
];

export function getCompanyTeamsStats(teams = companyTeams) {
  const activeTeams = teams.filter(
    (team) => team.status === COMPANY_TEAM_STATUSES.ACTIVE,
  );

  const availableTeams = teams.filter(
    (team) => team.availability === COMPANY_TEAM_AVAILABILITY.AVAILABLE,
  );

  const totalActiveTasks = teams.reduce(
    (total, team) => total + Number(team.activeTasks || 0),
    0,
  );

  return [
    {
      id: 'total',
      title: 'إجمالي الفرق',
      subtitle: 'Total Teams',
      value: teams.length,
      tone: 'primary',
    },
    {
      id: 'active',
      title: 'فرق نشطة',
      subtitle: 'Active Teams',
      value: activeTeams.length,
      tone: 'success',
    },
    {
      id: 'available',
      title: 'فرق متاحة',
      subtitle: 'Available Teams',
      value: availableTeams.length,
      tone: 'info',
    },
    {
      id: 'tasks',
      title: 'مهام نشطة',
      subtitle: 'Active Tasks',
      value: totalActiveTasks,
      tone: 'warning',
    },
  ];
}