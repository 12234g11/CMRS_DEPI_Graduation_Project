import {
  companyReports,
  companyTechnicians,
} from '../mocks/companyReportsMockData';

let companyReportsStore = companyReports.map((report) => ({ ...report }));

function wait(value, delay = 180) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

function getStatusTone(status) {
  if (status === 'تم الحل') return 'success';

  if (status === 'متعذر التنفيذ') return 'danger';

  if (
    status === 'تم التعيين' ||
    status === 'جاري التنفيذ'
  ) {
    return 'info';
  }

  return 'warning';
}

function cloneReport(report) {
  return {
    ...report,
    reporter: report.reporter ? { ...report.reporter } : null,
    assignedTeam: report.assignedTeam ? { ...report.assignedTeam } : null,
    companyResponse: report.companyResponse ? { ...report.companyResponse } : null,
    adminReview: report.adminReview ? { ...report.adminReview } : null,
    timeline: report.timeline ? report.timeline.map((item) => ({ ...item })) : [],
    images: report.images ? [...report.images] : [],
  };
}

function findReport(reportId) {
  return companyReportsStore.find(
    (report) => String(report.id) === String(reportId),
  );
}

function createTimelineItem(reportId, data) {
  return {
    id: `${reportId}-timeline-${Date.now()}`,
    date: new Date().toLocaleString('ar-EG'),
    ...data,
  };
}

function updateReportById(reportId, updater) {
  companyReportsStore = companyReportsStore.map((report) => {
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

export async function getCompanyReports() {
  return wait(companyReportsStore.map(cloneReport));
}

export async function getCompanyReportById(reportId) {
  const report = findReport(reportId);

  return wait(report ? cloneReport(report) : null);
}

export async function getCompanyTechnicians() {
  return wait(companyTechnicians.map((item) => ({ ...item })));
}

export async function assignTechnicianToReport(reportId, payload) {
  const technician = companyTechnicians.find(
    (item) => item.id === payload.technicianId,
  );

  if (!technician) return wait(null);

  const updatedReport = updateReportById(reportId, (report) => ({
    ...report,
    assignedTeam: {
      id: technician.id,
      name: technician.name,
      leadName: technician.leadName,
      phone: technician.phone,
    },
    timeline: [
      ...(report.timeline || []),
      createTimelineItem(reportId, {
        actorType: 'company',
        actor: 'الشركة',
        title: 'تم تعيين فرقة صيانة',
        description: `تم تعيين ${technician.name} لهذا البلاغ.`,
      }),
    ],
  }));

  return wait(updatedReport);
}

export async function startCompanyReportWork(reportId) {
  const updatedReport = updateReportById(reportId, (report) => ({
    ...report,
    status: 'جاري التنفيذ',
    statusTone: 'info',
    companyResponse: {
      status: 'started',
      statusLabel: 'بدأ التنفيذ',
      note: 'تم استلام البلاغ وبدأت الشركة التنفيذ.',
      submittedAt: new Date().toLocaleString('ar-EG'),
      images: [],
    },
    timeline: [
      ...(report.timeline || []),
      createTimelineItem(reportId, {
        actorType: 'company',
        actor: 'الشركة',
        title: 'بدأ التنفيذ',
        description: 'تم تحديث حالة البلاغ إلى جاري التنفيذ.',
      }),
    ],
  }));

  return wait(updatedReport);
}

export async function submitCompanyReportSolution(reportId, payload) {
  const updatedReport = updateReportById(reportId, (report) => ({
    ...report,
    status: 'بانتظار مراجعة الأدمن',
    statusTone: 'warning',
    companyResponse: {
      status: 'fixed',
      statusLabel: 'تم الإصلاح',
      note: payload.note,
      submittedAt: new Date().toLocaleString('ar-EG'),
      images: payload.images?.length ? payload.images : report.images,
    },
    adminReview: {
      status: 'pending',
      label: 'بانتظار مراجعة الأدمن',
      note: 'تم إرسال الحل للأدمن وفي انتظار القرار.',
      reviewedAt: '',
    },
    timeline: [
      ...(report.timeline || []),
      createTimelineItem(reportId, {
        actorType: 'company',
        actor: 'الشركة',
        title: 'تم إرسال الحل للأدمن',
        description: payload.note,
      }),
    ],
  }));

  return wait(updatedReport);
}

export async function submitCompanyReportCannotFix(reportId, payload) {
  const updatedReport = updateReportById(reportId, (report) => ({
    ...report,
    status: 'بانتظار مراجعة الأدمن',
    statusTone: 'warning',
    companyResponse: {
      status: 'cannot_fix',
      statusLabel: 'متعذر التنفيذ',
      note: payload.note,
      reason: payload.reason,
      submittedAt: new Date().toLocaleString('ar-EG'),
      images: payload.images?.length ? payload.images : [],
    },
    adminReview: {
      status: 'pending',
      label: 'بانتظار مراجعة الأدمن',
      note: 'تم إرسال تعذر التنفيذ للأدمن وفي انتظار القرار.',
      reviewedAt: '',
    },
    timeline: [
      ...(report.timeline || []),
      createTimelineItem(reportId, {
        actorType: 'company',
        actor: 'الشركة',
        title: 'تم إرسال تعذر التنفيذ',
        description: payload.reason,
      }),
    ],
  }));

  return wait(updatedReport);
}