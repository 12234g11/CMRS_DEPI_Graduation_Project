import problemExampleImage from '../../../landing/images/problem-example.webp';

export const companyDashboardCompany = {
  id: 'company-lighting-1',
  name: 'شركة الإنارة الحديثة',
  specialization: 'الإنارة والكهرباء',
  governorate: 'القاهرة',
  status: 'active',
};

export const companyDashboardReports = [
  {
    id: 'C-101',
    type: 'إنارة معطلة',
    title: 'عمود إنارة لا يعمل في شارع جانبي',
    description:
      'يوجد عمود إنارة معطل في شارع جانبي والمنطقة مظلمة ليلًا، مما يشكل خطورة على حركة المشاة والسيارات.',
    status: 'تم التعيين',
    statusTone: 'info',
    priority: 'متوسطة',
    priorityTone: 'warning',
    date: '2026-04-03',
    dueDate: '2026-04-06',
    location: 'شارع عباس العقاد، مدينة نصر',
    assignedAt: '2026-04-03 - 11:20 AM',
    adminNote: 'برجاء المعاينة والبدء في التنفيذ في أقرب وقت.',
    rating: 16,
    votesCount: 21,
    images: [problemExampleImage, problemExampleImage],
    position: { lat: 30.0626, lng: 31.3303 },
    reporter: {
      name: 'كريم حسن',
      phone: '+20 100 222 3344',
    },
    companyResponse: null,
  },
  {
    id: 'C-102',
    type: 'أعمدة إنارة متعددة معطلة',
    title: 'أكثر من عمود إنارة لا يعمل في نفس الشارع',
    description:
      'يوجد أكثر من عمود إنارة معطل في نفس الشارع، ويؤثر ذلك على وضوح الرؤية ليلًا.',
    status: 'جاري التنفيذ',
    statusTone: 'info',
    priority: 'عالية',
    priorityTone: 'danger',
    date: '2026-04-04',
    dueDate: '2026-04-07',
    location: 'الهضبة الوسطى، المقطم',
    assignedAt: '2026-04-04 - 09:45 AM',
    adminNote: 'الأولوية عالية بسبب وجود منطقة سكنية وحركة مشاة.',
    rating: 24,
    votesCount: 32,
    images: [problemExampleImage, problemExampleImage],
    position: { lat: 30.0223, lng: 31.3037 },
    reporter: {
      name: 'محمد عادل',
      phone: '+20 100 333 8800',
    },
    companyResponse: {
      status: 'started',
      statusLabel: 'بدأ التنفيذ',
      note: 'تم استلام البلاغ وجاري تجهيز فريق الصيانة.',
      submittedAt: '2026-04-04 - 12:30 PM',
      images: [],
    },
  },
  {
    id: 'C-103',
    type: 'كشاف إنارة مكسور',
    title: 'كشاف إنارة مكسور ويحتاج إلى تغيير',
    description:
      'كشاف إنارة مكسور ويوجد ضعف شديد في الإضاءة في محيط المكان.',
    status: 'بانتظار مراجعة الأدمن',
    statusTone: 'warning',
    priority: 'منخفضة',
    priorityTone: 'success',
    date: '2026-04-05',
    dueDate: '2026-04-08',
    location: 'شارع 26 يوليو، الزمالك',
    assignedAt: '2026-04-05 - 10:10 AM',
    adminNote: 'يرجى رفع صورة واضحة بعد الانتهاء من الإصلاح.',
    rating: 9,
    votesCount: 12,
    images: [problemExampleImage],
    position: { lat: 30.0647, lng: 31.2196 },
    reporter: {
      name: 'هالة سمير',
      phone: '+20 100 777 9999',
    },
    companyResponse: {
      status: 'fixed',
      statusLabel: 'تم الإصلاح',
      note: 'تم تغيير الكشاف وتشغيل الإنارة بنجاح.',
      submittedAt: '2026-04-06 - 02:15 PM',
      images: [problemExampleImage],
    },
  },
  {
    id: 'C-104',
    type: 'إنارة ضعيفة',
    title: 'إنارة ضعيفة أمام مدرسة',
    description:
      'الإضاءة ضعيفة أمام مدرسة وقد تسبب خطورة على الطلاب أثناء الخروج مساءً.',
    status: 'مطلوب استكمال',
    statusTone: 'warning',
    priority: 'متوسطة',
    priorityTone: 'warning',
    date: '2026-04-06',
    dueDate: '2026-04-09',
    location: 'كورنيش المعادي',
    assignedAt: '2026-04-06 - 08:40 AM',
    adminNote: 'تم طلب استكمال بسبب عدم وضوح صورة ما بعد الإصلاح.',
    rating: 13,
    votesCount: 18,
    images: [problemExampleImage],
    position: { lat: 29.9702, lng: 31.2469 },
    reporter: {
      name: 'ياسر أحمد',
      phone: '+20 100 111 2233',
    },
    companyResponse: {
      status: 'needs_completion',
      statusLabel: 'مطلوب استكمال',
      note: 'برجاء رفع صورة أوضح لحالة الإضاءة بعد الإصلاح.',
      submittedAt: '2026-04-07 - 01:00 PM',
      images: [problemExampleImage],
    },
  },
  {
    id: 'C-105',
    type: 'انقطاع إنارة',
    title: 'انقطاع كامل للإنارة في شارع فرعي',
    description:
      'يوجد انقطاع كامل للإنارة في شارع فرعي، ويحتاج الأمر إلى مراجعة الكابلات أو الكشافات.',
    status: 'متعذر التنفيذ',
    statusTone: 'danger',
    priority: 'عالية',
    priorityTone: 'danger',
    date: '2026-04-07',
    dueDate: '2026-04-10',
    location: 'شارع النصر، المعادي',
    assignedAt: '2026-04-07 - 03:25 PM',
    adminNote: 'يرجى المعاينة وتوضيح سبب التعذر إن وجد.',
    rating: 20,
    votesCount: 29,
    images: [problemExampleImage],
    position: { lat: 29.9562, lng: 31.2669 },
    reporter: {
      name: 'نور خالد',
      phone: '+20 100 444 6677',
    },
    companyResponse: {
      status: 'cannot_fix',
      statusLabel: 'متعذر التنفيذ',
      note: 'لا يمكن التنفيذ بدون تصريح فصل تيار من الجهة المختصة.',
      reason: 'احتياج العمل إلى تصريح فصل تيار قبل بدء الصيانة.',
      submittedAt: '2026-04-08 - 11:20 AM',
      images: [problemExampleImage],
    },
  },
  {
    id: 'C-106',
    type: 'إنارة معطلة',
    title: 'عمود إنارة تم إصلاحه واعتماده',
    description:
      'تم التعامل مع البلاغ وتغيير وحدة الإنارة، وتم اعتماد الحل من الأدمن.',
    status: 'تم الحل',
    statusTone: 'success',
    priority: 'منخفضة',
    priorityTone: 'success',
    date: '2026-04-01',
    dueDate: '2026-04-04',
    location: 'شارع الثورة، مصر الجديدة',
    assignedAt: '2026-04-01 - 09:00 AM',
    adminNote: 'تم اعتماد الإصلاح بعد مراجعة الصور.',
    rating: 11,
    votesCount: 14,
    images: [problemExampleImage, problemExampleImage],
    position: { lat: 30.0902, lng: 31.3221 },
    reporter: {
      name: 'عمر إيهاب',
      phone: '+20 100 723 4411',
    },
    companyResponse: {
      status: 'fixed',
      statusLabel: 'تم الإصلاح',
      note: 'تم إصلاح العمود وتشغيل الإنارة بنجاح.',
      submittedAt: '2026-04-02 - 04:20 PM',
      images: [problemExampleImage],
    },
  },
];

function countReports(predicate) {
  return companyDashboardReports.filter(predicate).length;
}

export const companyDashboardStats = [
  {
    id: 'assigned',
    title: 'البلاغات المسندة',
    subtitle: 'Assigned Reports',
    value: companyDashboardReports.length,
    tone: 'primary',
  },
  {
    id: 'in-progress',
    title: 'جاري التنفيذ',
    subtitle: 'In Progress',
    value: countReports((report) =>
      ['تم التعيين', 'جاري التنفيذ'].includes(report.status),
    ),
    tone: 'info',
  },
  {
    id: 'pending-review',
    title: 'بانتظار مراجعة الأدمن',
    subtitle: 'Pending Review',
    value: countReports((report) => report.status === 'بانتظار مراجعة الأدمن'),
    tone: 'warning',
  },
  {
    id: 'completed',
    title: 'تم الحل',
    subtitle: 'Completed',
    value: countReports((report) => report.status === 'تم الحل'),
    tone: 'success',
  },
];

function createOptionsFromReports(key, defaultLabel) {
  const uniqueValues = [
    ...new Set(companyDashboardReports.map((report) => report[key])),
  ];

  return [
    { value: 'all', label: defaultLabel },
    ...uniqueValues.map((value) => ({
      value,
      label: value,
    })),
  ];
}

export const companyDashboardProblemTypeOptions = createOptionsFromReports(
  'type',
  'كل الأنواع',
);

export const companyDashboardStatusOptions = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'تم التعيين', label: 'تم التعيين' },
  { value: 'جاري التنفيذ', label: 'جاري التنفيذ' },
  { value: 'بانتظار مراجعة الأدمن', label: 'بانتظار مراجعة الأدمن' },
  { value: 'مطلوب استكمال', label: 'مطلوب استكمال' },
  { value: 'متعذر التنفيذ', label: 'متعذر التنفيذ' },
  { value: 'تم الحل', label: 'تم الحل' },
];

export const companyDashboardPriorityOptions = [
  { value: 'all', label: 'كل الأولويات' },
  { value: 'عالية', label: 'عالية' },
  { value: 'متوسطة', label: 'متوسطة' },
  { value: 'منخفضة', label: 'منخفضة' },
];