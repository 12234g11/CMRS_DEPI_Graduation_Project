import { adminCompanies } from '../../companies/mocks/adminCompaniesMockData';
import { adminReports } from '../mocks/adminReportsMockData';

let reportsStore = adminReports.map((report) => ({ ...report }));

function wait(value, delay = 180) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

function getStatusTone(status) {
  if (status === 'تم الحل') return 'success';

  if (
    status === 'جاري الحل' ||
    status === 'مقبول' ||
    status === 'تم التعيين'
  ) {
    return 'info';
  }

  if (status === 'مرفوض' || status === 'متعذر التنفيذ') {
    return 'danger';
  }

  return 'warning';
}

function cloneReport(report) {
  return {
    ...report,
    reporter: report.reporter ? { ...report.reporter } : null,
    companyResponse: report.companyResponse ? { ...report.companyResponse } : null,
    timeline: report.timeline ? report.timeline.map((item) => ({ ...item })) : [],
    images: report.images ? [...report.images] : [],
    excludedCompanyIds: report.excludedCompanyIds ? [...report.excludedCompanyIds] : [],
    excludedCompanyNames: report.excludedCompanyNames ? [...report.excludedCompanyNames] : [],
  };
}

function findReport(reportId) {
  return reportsStore.find((report) => String(report.id) === String(reportId));
}

function updateReportById(reportId, updater) {
  reportsStore = reportsStore.map((report) => {
    if (String(report.id) !== String(reportId)) return report;

    const updatedReport =
      typeof updater === 'function'
        ? updater(report)
        : {
            ...report,
            ...updater,
          };

    return {
      ...updatedReport,
      statusTone: getStatusTone(updatedReport.status),
    };
  });

  return cloneReport(findReport(reportId));
}

function createTimelineItem(reportId, data) {
  return {
    id: `${reportId}-timeline-${Date.now()}`,
    date: new Date().toLocaleString('ar-EG'),
    ...data,
  };
}

function getCompanyWorkloadLabel(company) {
  const activeTasks = Number(company.activeTasks || company.currentTasks || 0);
  const maxCapacity = Number(company.maxCapacity || 10);

  return `${activeTasks}/${maxCapacity} مهام`;
}

function buildAssignmentCompany(company, report) {
  const activeTasks = Number(company.activeTasks || company.currentTasks || 0);
  const maxCapacity = Number(company.maxCapacity || 10);
  const capacityRatio = activeTasks / Math.max(maxCapacity, 1);

  const companyProblemTypes = company.problemTypes || [];
  const companySpecializations = company.specializations || [];

  const matchesProblemType = companyProblemTypes.some((type) =>
    report.type.includes(type) || type.includes(report.type),
  );

  const matchesSpecialization = companySpecializations.some((specialization) =>
    report.type.includes(specialization) ||
    company.specialization.includes(specialization),
  );

  const baseScore = matchesProblemType ? 92 : matchesSpecialization ? 82 : 64;
  const workloadPenalty = Math.round(capacityRatio * 12);
  const responseBonus =
    company.avgResponseHours && company.avgResponseHours <= 3 ? 4 : 0;

  const matchScore = Math.max(
    48,
    Math.min(98, baseScore - workloadPenalty + responseBonus),
  );

  return {
    ...company,
    matchScore,
    capacityRatio,
    workloadLabel: getCompanyWorkloadLabel(company),
    workloadTone:
      capacityRatio >= 0.85
        ? 'danger'
        : capacityRatio >= 0.6
          ? 'warning'
          : 'success',
    avgResponseTime: company.avgResponseTime || 'لا توجد بيانات بعد',
    rating: company.rating || 'لا توجد بيانات',
    successRate: company.successRate || 0,
    coverageAreas: company.coverageAreas || [],
    specializations: companySpecializations,
    problemTypes: companyProblemTypes,
    matchReasons: [
      matchesProblemType
        ? 'نوع البلاغ مطابق لتخصص الشركة'
        : 'الشركة قريبة من نوع البلاغ',
      'الشركة تعمل داخل نطاق البلاغ',
      capacityRatio < 0.7
        ? 'ضغط العمل الحالي مناسب'
        : 'يوجد ضغط عمل متوسط ويحتاج متابعة',
    ],
  };
}

export async function getAdminReports() {
  return wait(reportsStore.map(cloneReport));
}

export async function getAdminReportById(reportId) {
  const report = findReport(reportId);

  return wait(report ? cloneReport(report) : null);
}

export async function updateAdminReport(reportId, payload) {
  const updatedReport = updateReportById(reportId, (report) => ({
    ...report,
    ...payload,
    timeline: [
      ...(report.timeline || []),
      createTimelineItem(reportId, {
        actorType: 'admin',
        actor: 'الأدمن',
        title: 'تم تحديث حالة البلاغ',
        description: `تم تغيير حالة البلاغ إلى ${payload.status}.`,
      }),
    ],
  }));

  return wait(updatedReport);
}

export async function getRecommendedCompaniesForReport(reportId) {
  const report = findReport(reportId);

  if (!report) return wait([]);

  const companies = adminCompanies
    .filter((company) => company.status === 'active' && company.accountStatus === 'active')
    .map((company) => buildAssignmentCompany(company, report))
    .filter((company) => company.matchScore >= 70)
    .sort((a, b) => b.matchScore - a.matchScore);

  return wait(companies);
}

export async function getAllCompaniesForReportAssignment(reportId) {
  const report = findReport(reportId);

  if (!report) return wait([]);

  const companies = adminCompanies
    .filter((company) => company.status === 'active' && company.accountStatus === 'active')
    .map((company) => buildAssignmentCompany(company, report))
    .sort((a, b) => b.matchScore - a.matchScore);

  return wait(companies);
}

export async function assignCompanyToReport(reportId, payload) {
  const report = findReport(reportId);
  const company = adminCompanies.find((item) => item.id === payload.companyId);

  if (!report || !company) return wait(null);

  const result = updateReportById(reportId, {
    assignedCompanyId: company.id,
    assignedCompany: company.name,
    concernedCompany: company.name,
    status: 'تم التعيين',
    statusTone: 'info',
    companyResponse: null,
    assignment: {
      companyId: company.id,
      companyName: company.name,
      adminNote: payload.adminNote || '',
      assignmentSource: payload.assignmentSource,
      assignedAt: new Date().toISOString(),
    },
    timeline: [
      ...(report.timeline || []),
      createTimelineItem(reportId, {
        actorType: 'admin',
        actor: 'الأدمن',
        title: 'تم تعيين شركة',
        description: `تم تعيين البلاغ إلى ${company.name}.`,
      }),
    ],
  });

  return wait({
    companyId: company.id,
    assignedCompany: company.name,
    concernedCompany: company.name,
    status: result.status,
    statusTone: result.statusTone,
    assignment: result.assignment,
  });
}

export async function getPendingCompanyReviewReports() {
  const reports = reportsStore.filter(
    (report) => report.companyResponse?.reviewStatus === 'pending',
  );

  return wait(reports.map(cloneReport));
}

export async function getCompanyResponseForReport(reportId) {
  const report = findReport(reportId);

  return wait(report?.companyResponse || null);
}

export async function acceptCompanyFix(reportId, payload = {}) {
  const report = findReport(reportId);

  const updatedReport = updateReportById(reportId, {
    status: 'تم الحل',
    statusTone: 'success',
    companyResponse: {
      ...report.companyResponse,
      reviewStatus: 'accepted',
      reviewLabel: 'تم قبول الإصلاح',
      adminNote: payload.adminNote || 'تمت مراجعة الإصلاح واعتماده.',
    },
    timeline: [
      ...(report.timeline || []),
      createTimelineItem(reportId, {
        actorType: 'admin',
        actor: 'الأدمن',
        title: 'تم قبول إصلاح الشركة',
        description: 'تم تحويل البلاغ إلى تم الحل وسيظهر للمستخدم بهذه الحالة.',
      }),
    ],
  });

  return wait(updatedReport);
}

export async function requestCompanyCompletion(reportId, payload = {}) {
  const report = findReport(reportId);

  const updatedReport = updateReportById(reportId, {
    status: 'مطلوب استكمال',
    statusTone: 'warning',
    companyResponse: {
      ...report.companyResponse,
      reviewStatus: 'needs_completion',
      reviewLabel: 'مطلوب استكمال من الشركة',
      adminNote: payload.adminNote || 'برجاء استكمال المطلوب وإرسال تحديث جديد.',
    },
    timeline: [
      ...(report.timeline || []),
      createTimelineItem(reportId, {
        actorType: 'admin',
        actor: 'الأدمن',
        title: 'تم طلب استكمال من الشركة',
        description:
          payload.adminNote ||
          'طلب الأدمن من الشركة استكمال العمل وإعادة إرسال الرد.',
      }),
    ],
  });

  return wait(updatedReport);
}

export async function acceptCompanyCannotFix(reportId, payload = {}) {
  const report = findReport(reportId);

  const updatedReport = updateReportById(reportId, {
    status: 'متعذر التنفيذ',
    statusTone: 'danger',
    companyResponse: {
      ...report.companyResponse,
      reviewStatus: 'accepted_cannot_fix',
      reviewLabel: 'تم قبول التعذر',
      adminNote: payload.adminNote || 'تم قبول سبب التعذر من الشركة.',
    },
    timeline: [
      ...(report.timeline || []),
      createTimelineItem(reportId, {
        actorType: 'admin',
        actor: 'الأدمن',
        title: 'تم قبول تعذر التنفيذ',
        description:
          payload.adminNote ||
          'تم قبول تعذر التنفيذ وسيتم اتخاذ إجراء إداري لاحق.',
      }),
    ],
  });

  return wait(updatedReport);
}

export async function prepareReportReassignment(reportId, payload = {}) {
  const report = findReport(reportId);

  if (!report) return wait(null);

  const failedCompanyId = report.assignedCompanyId;
  const failedCompanyName =
    report.assignedCompany ||
    report.companyResponse?.companyName ||
    'الشركة السابقة';

  const previousExcludedCompanyIds = report.excludedCompanyIds || [];
  const previousExcludedCompanyNames = report.excludedCompanyNames || [];

  const nextExcludedCompanyIds = failedCompanyId
    ? [...new Set([...previousExcludedCompanyIds, failedCompanyId])]
    : previousExcludedCompanyIds;

  const nextExcludedCompanyNames = failedCompanyName
    ? [...new Set([...previousExcludedCompanyNames, failedCompanyName])]
    : previousExcludedCompanyNames;

  const updatedReport = updateReportById(reportId, {
    status: 'بانتظار إعادة التعيين',
    statusTone: 'warning',
    assignedCompanyId: null,
    assignedCompany: 'غير معين',
    concernedCompany: 'الشركة المعينة',
    excludedCompanyIds: nextExcludedCompanyIds,
    excludedCompanyNames: nextExcludedCompanyNames,
    companyResponse: {
      ...report.companyResponse,
      reviewStatus: 'reassignment_requested',
      reviewLabel: 'تم توجيه البلاغ لإعادة التعيين',
      adminNote: payload.adminNote || 'سيتم إعادة تعيين البلاغ لشركة أخرى.',
    },
    timeline: [
      ...(report.timeline || []),
      createTimelineItem(reportId, {
        actorType: 'admin',
        actor: 'الأدمن',
        title: 'تم توجيه البلاغ لإعادة التعيين',
        description:
          payload.adminNote ||
          `الأدمن قرر إعادة تعيين البلاغ لشركة أخرى، وتم استبعاد ${failedCompanyName} من الاختيارات.`,
      }),
    ],
  });

  return wait(updatedReport);
}