import { adminCompanies } from '../../companies/mocks/adminCompaniesMockData';
import { adminReports } from '../mocks/adminReportsMockData';

function wait(value, delay = 150) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

function getReportArea(report) {
  return report?.location || '';
}

function calculateCompanyMatch(report, company) {
  const reportArea = getReportArea(report);

  const typeMatches = company.problemTypes?.includes(report.type);

  const partialTypeMatch = company.specializations?.some((specialization) =>
    report.type.includes(specialization) || specialization.includes(report.type),
  );

  const areaMatches = company.coverageAreas?.some((area) => reportArea.includes(area));
  const coversGreaterCairo = company.coverageAreas?.includes('القاهرة الكبرى');

  const capacityRatio = company.maxCapacity
    ? company.currentTasks / company.maxCapacity
    : 1;

  const capacityScore = Math.max(0, Math.round((1 - capacityRatio) * 15));
  const ratingScore = Math.round((company.rating / 5) * 10);

  let responseScore = 2;

  if (company.avgResponseHours <= 2) {
    responseScore = 10;
  } else if (company.avgResponseHours <= 4) {
    responseScore = 8;
  } else if (company.avgResponseHours <= 6) {
    responseScore = 5;
  }

  const typeScore = typeMatches ? 40 : partialTypeMatch ? 24 : 0;
  const areaScore = areaMatches ? 25 : coversGreaterCairo ? 16 : 0;

  const score = Math.min(
    100,
    typeScore + areaScore + capacityScore + ratingScore + responseScore,
  );

  const reasons = [];

  if (typeMatches) {
    reasons.push(`متخصصة في ${report.type}`);
  } else if (partialTypeMatch) {
    reasons.push('لديها تخصص قريب من نوع المشكلة');
  } else {
    reasons.push('ليست مطابقة بشكل مباشر لنوع المشكلة');
  }

  if (areaMatches) {
    reasons.push(`تغطي منطقة البلاغ: ${report.location}`);
  } else if (coversGreaterCairo) {
    reasons.push('تغطي نطاق القاهرة الكبرى');
  } else {
    reasons.push('منطقة التغطية ليست الأقرب للبلاغ');
  }

  if (capacityRatio <= 0.5) {
    reasons.push('ضغط العمل الحالي مناسب');
  } else if (capacityRatio <= 0.75) {
    reasons.push('ضغط العمل متوسط');
  } else {
    reasons.push('ضغط العمل مرتفع نسبياً');
  }

  if (company.rating >= 4.5) {
    reasons.push('تقييم الشركة مرتفع');
  }

  if (company.avgResponseHours <= 3) {
    reasons.push('متوسط الاستجابة سريع');
  }

  return {
    ...company,
    matchScore: score,
    matchReasons: reasons,
    capacityRatio,
    workloadTone: capacityRatio <= 0.5 ? 'success' : capacityRatio <= 0.75 ? 'warning' : 'danger',
    workloadLabel: `${company.currentTasks}/${company.maxCapacity} مهام`,
    recommended: score >= 70,
  };
}

function getCompaniesWithMatch(report) {
  if (!report) return [];

  return adminCompanies
    .filter((company) => company.status === 'active')
    .map((company) => calculateCompanyMatch(report, company))
    .sort((a, b) => b.matchScore - a.matchScore);
}

export async function getAdminReports() {
  return wait(adminReports);
}

export async function getAdminReportById(reportId) {
  const report = adminReports.find((item) => String(item.id) === String(reportId));
  return wait(report || null);
}

export async function getAdminMaintenanceCompanies() {
  return wait(adminCompanies);
}

export async function getRecommendedCompaniesForReport(reportId) {
  const report = adminReports.find((item) => String(item.id) === String(reportId));

  const recommendedCompanies = getCompaniesWithMatch(report).filter(
    (company) => company.recommended,
  );

  return wait(recommendedCompanies);
}

export async function getAllCompaniesForReportAssignment(reportId) {
  const report = adminReports.find((item) => String(item.id) === String(reportId));

  return wait(getCompaniesWithMatch(report));
}

export async function updateAdminReport(reportId, payload) {
  return wait({
    id: reportId,
    ...payload,
  });
}

export async function assignCompanyToReport(reportId, payload) {
  const company = adminCompanies.find((item) => item.id === payload.companyId);

  if (!company) {
    throw new Error('الشركة المختارة غير موجودة.');
  }

  return wait({
    reportId,
    companyId: company.id,
    assignedCompany: company.name,
    concernedCompany: company.name,
    status: 'جاري الحل',
    statusTone: 'info',
    adminNote: payload.adminNote || '',
    assignmentSource: payload.assignmentSource || 'manual',
    assignment: {
      companyId: company.id,
      companyName: company.name,
      assignedAt: new Date().toISOString(),
      assignmentStatus: 'بانتظار قبول الشركة',
    },
  });
}