import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiActivity,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiFileText,
  FiImage,
  FiInfo,
  FiMapPin,
  FiShield,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
} from 'react-icons/fi';

import ReportStatusBadge from '../../reports/components/ReportStatusBadge';

function formatDate(value, includeTime = false) {
  if (!value) return '—';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
        }
      : {}),
  }).format(parsedDate);
}

function DetailBlock({ icon, label, children, className = '' }) {
  return (
    <div className={`user-report-modal__detail-card ${className}`.trim()}>
      <span className="user-report-modal__detail-label">
        {icon}
        {label}
      </span>
      <div className="user-report-modal__detail-value">{children}</div>
    </div>
  );
}

function SummaryCard({ icon, label, children }) {
  return (
    <div className="user-report-modal__summary-card">
      <span className="user-report-modal__summary-label">
        {icon}
        {label}
      </span>
      <div className="user-report-modal__summary-value">{children}</div>
    </div>
  );
}

const ASSIGNMENT_CONFIRMED_STATUSES = new Set([
  'Assigned',
  'InProgress',
  'Resolved',
  'UnableToExecute',
  'NeedsCompletion',
  'PendingAdminApproval',
]);

function getHistoryStatusDate(history = [], statusKey) {
  const matches = history
    .filter((item) => item?.statusKey === statusKey && item?.changedAt)
    .map((item) => ({
      value: item.changedAt,
      timestamp: new Date(item.changedAt).getTime(),
    }));

  if (!matches.length) return null;

  const validMatches = matches.filter((item) => Number.isFinite(item.timestamp));
  if (!validMatches.length) return matches[matches.length - 1].value;

  validMatches.sort((first, second) => first.timestamp - second.timestamp);
  return validMatches[validMatches.length - 1].value;
}

function getExecutionStatePresentation({
  statusKey,
  companyName,
  assignmentConfirmed,
  publicUpdate,
  publicMessage,
  unableToExecuteReason,
  needsCompletionReason,
  wasReassigned,
  currentCompanyName,
  decisionType,
}) {
  if (
    wasReassigned ||
    String(decisionType || '').toLowerCase().includes('reassign')
  ) {
    return {
      tone: 'info',
      icon: 'briefcase',
      title: 'تم تحويل البلاغ إلى جهة تنفيذ أخرى',
      description:
        publicMessage ||
        (currentCompanyName
          ? `تم إسناد البلاغ إلى ${currentCompanyName} لاستكمال التنفيذ.`
          : 'تعذر على الجهة السابقة تنفيذ البلاغ وتم تحويله إلى جهة أخرى.'),
    };
  }

  switch (statusKey) {
    case 'Accepted':
      return {
        tone: 'warning',
        icon: 'check',
        title: 'تم قبول البلاغ',
        description: assignmentConfirmed
          ? 'تم قبول البلاغ وظهرت بيانات تدل على بدء إجراءات الإسناد.'
          : 'البلاغ مقبول وجاهز للإسناد إلى جهة التنفيذ.',
      };

    case 'Assigned':
      return {
        tone: 'info',
        icon: 'briefcase',
        title: 'تم إسناد البلاغ',
        description: companyName
          ? `تم إسناد البلاغ إلى ${companyName}.`
          : 'تم إسناد البلاغ بالفعل، لكن اسم الشركة غير متاح ضمن البيانات العامة الراجعة.',
      };

    case 'InProgress':
      return {
        tone: 'info',
        icon: 'activity',
        title: 'التنفيذ جارٍ الآن',
        description: companyName
          ? `تتولى ${companyName} تنفيذ البلاغ حاليًا.`
          : 'بدأت جهة التنفيذ العمل على البلاغ، لكن اسم الشركة غير متاح ضمن البيانات العامة الراجعة.',
      };

    case 'Resolved':
      return {
        tone: 'success',
        icon: 'check',
        title: 'تم حل البلاغ',
        description: companyName
          ? `أنهت ${companyName} تنفيذ البلاغ وتم تسجيله كمحلول.`
          : 'اكتمل تنفيذ البلاغ وتم تسجيله كمحلول، حتى لو لم تتوفر بيانات اسم الشركة.',
      };

    case 'UnableToExecute':
      return {
        tone: 'secondary',
        icon: 'error',
        title: 'تعذر تنفيذ البلاغ',
        description:
          publicMessage ||
          unableToExecuteReason ||
          'تعذر تنفيذ البلاغ بعد مراجعة الجهة المختصة.',
      };

    case 'NeedsCompletion':
      return {
        tone: 'warning',
        icon: 'info',
        title: 'البلاغ مطلوب استكماله',
        description:
          needsCompletionReason ||
          'يحتاج البلاغ إلى استكمال إجراء أو بيانات قبل متابعة التنفيذ.',
      };

    case 'PendingAdminApproval':
      return {
        tone: 'info',
        icon: 'shield',
        title: 'بانتظار مراجعة الأدمن',
        description:
          'البلاغ موجود حاليًا لدى الأدمن للمراجعة قبل اعتماد الإجراء النهائي.',
      };

    default:
      return {
        tone: 'info',
        icon: 'info',
        title: 'حالة التنفيذ',
        description: publicUpdate || 'لا توجد تفاصيل تنفيذ إضافية متاحة.',
      };
  }
}

function ExecutionStateIcon({ type }) {
  if (type === 'briefcase') return <FiBriefcase />;
  if (type === 'activity') return <FiActivity />;
  if (type === 'check') return <FiCheckCircle />;
  if (type === 'error') return <FiXCircle />;
  if (type === 'shield') return <FiShield />;
  return <FiInfo />;
}

function FollowedReportDetailsModal({
  report,
  onClose,
  onUnfollow,
  isUnfollowing = false,
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const images = useMemo(() => {
    const normalizedImages = Array.isArray(report?.reportImages)
      ? report.reportImages
          .map((image) => ({
            id: image.imageId || image.id || image.fullImageUrl,
            url: image.fullImageUrl || image.imageUrl || image.url || '',
          }))
          .filter((image) => image.url)
      : [];

    if (normalizedImages.length) return normalizedImages;

    return report?.coverImage
      ? [{ id: report.coverImage, url: report.coverImage }]
      : [];
  }, [report]);

  if (!report) return null;

  const activeImage = images[activeImageIndex] || images[0] || null;
  const hasMultipleImages = images.length > 1;
  const reporter = report.reporterPublicInfo;
  const reporterStats = reporter?.statistics || {};
  const company = report.assignedCompanyPublicInfo;
  const execution = report.executionInfo;
  const history = Array.isArray(report.statusHistory)
    ? report.statusHistory
    : [];
  const statusKey = report.statusKey;
  const companyName = company?.companyName || '';

  const assignmentConfirmed = Boolean(
    company ||
      execution?.assignedAt ||
      execution?.executionStartedAt ||
      ASSIGNMENT_CONFIRMED_STATUSES.has(statusKey) ||
      history.some((item) =>
        ASSIGNMENT_CONFIRMED_STATUSES.has(item?.statusKey)
      )
  );

  const executionState = getExecutionStatePresentation({
    statusKey,
    companyName,
    assignmentConfirmed,
    publicUpdate: execution?.publicUpdate,
    publicMessage: execution?.publicMessage,
    unableToExecuteReason: execution?.unableToExecuteReason,
    needsCompletionReason: execution?.needsCompletionReason,
    wasReassigned: execution?.wasReassigned,
    currentCompanyName: execution?.currentCompanyName,
    decisionType: execution?.decisionType,
  });

  const assignedAt =
    execution?.assignedAt || getHistoryStatusDate(history, 'Assigned');
  const executionStartedAt =
    execution?.executionStartedAt || getHistoryStatusDate(history, 'InProgress');
  const resolvedAt =
    execution?.resolvedAt || getHistoryStatusDate(history, 'Resolved');
  const currentStatusAt =
    execution?.currentStatusChangedAt ||
    getHistoryStatusDate(history, statusKey) ||
    report.updatedAt;

  const executionMilestones = [
    assignedAt
      ? {
          key: 'assigned',
          label: 'تاريخ التعيين',
          value: assignedAt,
          icon: <FiCalendar />,
        }
      : null,
    executionStartedAt
      ? {
          key: 'started',
          label: 'بدء التنفيذ',
          value: executionStartedAt,
          icon: <FiActivity />,
        }
      : null,
    resolvedAt
      ? {
          key: 'resolved',
          label: 'تاريخ الحل',
          value: resolvedAt,
          icon: <FiCheckCircle />,
        }
      : null,
    execution?.wasReassigned && execution?.reassignedAt
      ? {
          key: 'reassigned',
          label: 'تاريخ إعادة الإسناد',
          value: execution.reassignedAt,
          icon: <FiBriefcase />,
        }
      : null,
    statusKey === 'UnableToExecute' && currentStatusAt
      ? {
          key: 'unable',
          label: 'تاريخ التعذر',
          value: execution?.unableToExecuteAt || currentStatusAt,
          icon: <FiXCircle />,
        }
      : null,
    statusKey === 'NeedsCompletion' && currentStatusAt
      ? {
          key: 'completion',
          label: 'تاريخ طلب الاستكمال',
          value: execution?.needsCompletionAt || currentStatusAt,
          icon: <FiInfo />,
        }
      : null,
    statusKey === 'PendingAdminApproval' && currentStatusAt
      ? {
          key: 'admin-review',
          label: 'بدء مراجعة الأدمن',
          value: execution?.pendingAdminApprovalAt || currentStatusAt,
          icon: <FiShield />,
        }
      : null,
  ].filter(Boolean);

  function showPreviousImage() {
    setActiveImageIndex((currentIndex) =>
      currentIndex <= 0 ? images.length - 1 : currentIndex - 1
    );
  }

  function showNextImage() {
    setActiveImageIndex((currentIndex) =>
      currentIndex >= images.length - 1 ? 0 : currentIndex + 1
    );
  }

  return (
    <div className="user-report-modal followed-report-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="user-report-modal__backdrop"
        onClick={onClose}
        aria-label="إغلاق تفاصيل البلاغ"
      />

      <article className="user-report-modal__panel followed-report-modal__panel">
        <button
          type="button"
          className="user-report-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <header className="followed-report-modal__header">
          <div>
            <ReportStatusBadge tone={report.statusTone}>
              {report.statusLabel}
            </ReportStatusBadge>
            <h2>{report.title}</h2>
            <p>{report.reportNumber || report.reportId}</p>
          </div>

          <button
            type="button"
            className="followed-report-modal__unfollow"
            onClick={() => onUnfollow?.(report)}
            disabled={report.canCurrentUserUnfollow === false || isUnfollowing}
          >
            <FiTrash2 />
            {report.canCurrentUserUnfollow === false
              ? 'إلغاء المتابعة غير متاح'
              : isUnfollowing
                ? 'جاري إلغاء المتابعة...'
                : 'إلغاء المتابعة'}
          </button>
        </header>

        <div className="user-report-modal__content followed-report-modal__content">
          <div className="user-report-modal__details followed-report-modal__details">
            <DetailBlock icon={<FiInfo />} label="عنوان المشكلة">
              <strong>{report.title}</strong>
            </DetailBlock>

            <DetailBlock
              icon={<FiFileText />}
              label="وصف المشكلة"
              className="user-report-modal__detail-card--description"
            >
              <p>{report.description || 'لا يوجد وصف متاح لهذا البلاغ.'}</p>
            </DetailBlock>

            <DetailBlock icon={<FiMapPin />} label="الموقع">
              <strong>{report.locationText || 'لم يتم تحديد الموقع'}</strong>
            </DetailBlock>

            <div className="followed-report-modal__detail-grid">
              <DetailBlock icon={<FiActivity />} label="نوع المشكلة">
                <strong>{report.issueCategoryName || 'أخرى'}</strong>
              </DetailBlock>

              <DetailBlock icon={<FiShield />} label="الأولوية">
                <strong>{report.priorityLabel || 'غير محددة'}</strong>
              </DetailBlock>

              <DetailBlock icon={<FiCalendar />} label="تاريخ البلاغ">
                <strong>{formatDate(report.createdAt)}</strong>
              </DetailBlock>

              <DetailBlock icon={<FiCalendar />} label="تاريخ المتابعة">
                <strong>{formatDate(report.followedAt)}</strong>
              </DetailBlock>
            </div>

            <section className="followed-report-modal__section">
              <div className="followed-report-modal__section-title">
                <FiUser />
                <div>
                  <strong>بيانات عامة عن صاحب البلاغ</strong>
                  <span>لا يتم عرض أي بيانات اتصال أو بيانات شخصية خاصة.</span>
                </div>
              </div>

              {reporter ? (
                <div className="followed-report-modal__public-info-grid">
                  <SummaryCard icon={<FiUser />} label="الاسم المعروض">
                    <strong>{reporter.displayName || 'مستخدم'}</strong>
                  </SummaryCard>

                  <SummaryCard icon={<FiMapPin />} label="المدينة">
                    <strong>{reporter.city || 'غير محددة'}</strong>
                  </SummaryCard>

                  <SummaryCard icon={<FiShield />} label="درجة الثقة">
                    <strong>{reporter.trustScore ?? 0}</strong>
                  </SummaryCard>

                  <SummaryCard icon={<FiCalendar />} label="تاريخ الانضمام">
                    <strong>{formatDate(reporter.joinedAt)}</strong>
                  </SummaryCard>

                  <SummaryCard icon={<FiFileText />} label="إجمالي البلاغات">
                    <strong>{reporterStats.totalReports ?? 0}</strong>
                  </SummaryCard>

                  <SummaryCard icon={<FiCheckCircle />} label="بلاغات مقبولة">
                    <strong>{reporterStats.acceptedReports ?? 0}</strong>
                  </SummaryCard>

                  <SummaryCard icon={<FiCheckCircle />} label="بلاغات تم حلها">
                    <strong>{reporterStats.resolvedReports ?? 0}</strong>
                  </SummaryCard>
                </div>
              ) : (
                <p className="followed-report-modal__empty-note">
                  لا توجد بيانات عامة متاحة عن صاحب البلاغ.
                </p>
              )}
            </section>

            <section className="followed-report-modal__section">
              <div className="followed-report-modal__section-title">
                <FiBriefcase />
                <div>
                  <strong>جهة التنفيذ</strong>
                  <span>المعلومات العامة المتاحة عن الشركة وحالة التنفيذ.</span>
                </div>
              </div>

              <div
                className={`followed-report-modal__execution-state is-${executionState.tone}`}
              >
                <span className="followed-report-modal__execution-state-icon">
                  <ExecutionStateIcon type={executionState.icon} />
                </span>
                <div>
                  <strong>{executionState.title}</strong>
                  <p>{executionState.description}</p>
                </div>
              </div>

              {execution?.publicMessage && statusKey !== 'UnableToExecute' ? (
                <DetailBlock
                  icon={<FiShield />}
                  label="رسالة الإدارة للمستخدم"
                  className="followed-report-modal__status-reason"
                >
                  <p>{execution.publicMessage}</p>
                </DetailBlock>
              ) : null}

              {company ? (
                <div className="followed-report-modal__company-card">
                  <div>
                    <small>الشركة المسند إليها البلاغ</small>
                    <strong>{company.companyName || 'اسم الشركة غير متاح'}</strong>
                  </div>
                  <span>{company.specialization || 'التخصص غير محدد'}</span>
                </div>
              ) : assignmentConfirmed ? (
                <p className="followed-report-modal__empty-note followed-report-modal__empty-note--confirmed">
                  حالة البلاغ وبيانات التنفيذ تؤكدان أنه تم إسناده لجهة تنفيذ،
                  لكن اسم الشركة وتخصصها غير متاحين في البيانات العامة الحالية.
                </p>
              ) : (
                <p className="followed-report-modal__empty-note">
                  لم يتم إسناد البلاغ إلى شركة حتى الآن.
                </p>
              )}

              {executionMilestones.length || execution?.publicUpdate ? (
                <div className="followed-report-modal__execution-grid">
                  {executionMilestones.map((milestone) => (
                    <SummaryCard
                      key={milestone.key}
                      icon={milestone.icon}
                      label={milestone.label}
                    >
                      <strong>{formatDate(milestone.value, true)}</strong>
                    </SummaryCard>
                  ))}

                  {execution?.publicUpdate ? (
                    <DetailBlock icon={<FiInfo />} label="آخر تحديث معلن">
                      <p>{execution.publicUpdate}</p>
                    </DetailBlock>
                  ) : null}
                </div>
              ) : null}

              {statusKey === 'UnableToExecute' ? (
                <DetailBlock
                  icon={<FiXCircle />}
                  label="سبب تعذر التنفيذ"
                  className="followed-report-modal__status-reason"
                >
                  <p>
                    {execution?.publicMessage ||
                      execution?.unableToExecuteReason ||
                      'تعذر تنفيذ البلاغ بعد مراجعة الجهة المختصة.'}
                  </p>
                </DetailBlock>
              ) : null}

              {statusKey === 'NeedsCompletion' ? (
                <DetailBlock
                  icon={<FiInfo />}
                  label="سبب طلب الاستكمال"
                  className="followed-report-modal__status-reason"
                >
                  <p>
                    {execution?.needsCompletionReason ||
                      'لم يتم إتاحة تفاصيل عامة إضافية عن المطلوب استكماله.'}
                  </p>
                </DetailBlock>
              ) : null}

              {statusKey === 'PendingAdminApproval' ? (
                <DetailBlock
                  icon={<FiShield />}
                  label="مراجعة الأدمن"
                  className="followed-report-modal__status-reason"
                >
                  <p>
                    البلاغ بانتظار مراجعة الأدمن واعتماد الإجراء النهائي، ولن
                    يتم اعتباره محلولًا نهائيًا قبل انتهاء المراجعة.
                  </p>
                </DetailBlock>
              ) : null}
            </section>

            {history.length ? (
              <section className="followed-report-modal__section">
                <div className="followed-report-modal__section-title">
                  <FiActivity />
                  <div>
                    <strong>سجل الحالة العام</strong>
                    <span>بدون أسماء موظفين أو ملاحظات داخلية.</span>
                  </div>
                </div>

                <div className="followed-report-modal__timeline">
                  {history.map((item, index) => (
                    <div
                      key={`${item.statusKey}-${item.changedAt || index}`}
                      className="followed-report-modal__timeline-item"
                    >
                      <i aria-hidden="true" />
                      <div>
                        <strong>{item.statusLabel}</strong>
                        <span>{formatDate(item.changedAt, true)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="user-report-modal__media followed-report-modal__media">
            <div className="user-report-modal__image-box">
              {activeImage ? (
                <>
                  <div
                    className="user-report-modal__image-main"
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsImageViewerOpen(true)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setIsImageViewerOpen(true);
                      }
                    }}
                    aria-label="عرض الصورة بالحجم الكامل"
                  >
                    <img src={activeImage.url} alt={report.title} />
                    <span className="user-report-modal__image-hint">
                      <FiEye />
                      مرر على الصورة للمعاينة واضغط لعرضها كاملة
                    </span>
                  </div>

                  {hasMultipleImages ? (
                    <>
                      <button
                        type="button"
                        className="user-report-modal__image-nav user-report-modal__image-nav--prev"
                        onClick={showPreviousImage}
                        aria-label="الصورة السابقة"
                      >
                        <FiChevronLeft />
                      </button>
                      <button
                        type="button"
                        className="user-report-modal__image-nav user-report-modal__image-nav--next"
                        onClick={showNextImage}
                        aria-label="الصورة التالية"
                      >
                        <FiChevronRight />
                      </button>
                    </>
                  ) : null}

                  <span className="user-report-modal__image-count">
                    صورة {activeImageIndex + 1} من {images.length}
                  </span>

                  {hasMultipleImages ? (
                    <div className="user-report-modal__thumbs">
                      {images.map((image, index) => (
                        <button
                          key={image.id}
                          type="button"
                          className={`user-report-modal__thumb ${
                            index === activeImageIndex ? 'is-active' : ''
                          }`}
                          onClick={() => setActiveImageIndex(index)}
                          aria-label={`عرض الصورة ${index + 1}`}
                        >
                          <img src={image.url} alt="" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="user-report-modal__image-placeholder">
                  <FiImage />
                  <span>لا توجد صور لهذا البلاغ</span>
                </div>
              )}
            </div>

            <div className="user-report-modal__summary-grid">
              <SummaryCard icon={<FiInfo />} label="الحالة">
                <ReportStatusBadge tone={report.statusTone}>
                  {report.statusLabel}
                </ReportStatusBadge>
              </SummaryCard>

              <SummaryCard icon={<FiCalendar />} label="آخر تحديث">
                <strong>{formatDate(report.updatedAt, true)}</strong>
              </SummaryCard>
            </div>

            <div className="user-report-modal__engagement-grid">
              <SummaryCard icon={<FiUsers />} label="المتابعات">
                <strong>{report.followersCount ?? 0}</strong>
              </SummaryCard>

              <SummaryCard icon={<FiCheckCircle />} label="التصديق">
                <strong>{report.upvoteCount ?? 0}</strong>
              </SummaryCard>

              <SummaryCard icon={<FiXCircle />} label="التكذيب">
                <strong>{report.downvoteCount ?? 0}</strong>
              </SummaryCard>
            </div>
          </div>
        </div>
      </article>

      {isImageViewerOpen && activeImage
        ? createPortal(
            <div className="user-report-image-viewer" role="dialog" aria-modal="true">
              <button
                type="button"
                className="user-report-image-viewer__backdrop"
                onClick={() => setIsImageViewerOpen(false)}
                aria-label="إغلاق عرض الصورة"
              />

              <div className="user-report-image-viewer__panel">
                <button
                  type="button"
                  className="user-report-image-viewer__close"
                  onClick={() => setIsImageViewerOpen(false)}
                  aria-label="إغلاق"
                >
                  <FiX />
                </button>

                {hasMultipleImages ? (
                  <button
                    type="button"
                    className="user-report-image-viewer__nav user-report-image-viewer__nav--prev"
                    onClick={showPreviousImage}
                    aria-label="الصورة السابقة"
                  >
                    <FiChevronLeft />
                  </button>
                ) : null}

                <img src={activeImage.url} alt={report.title} />

                {hasMultipleImages ? (
                  <button
                    type="button"
                    className="user-report-image-viewer__nav user-report-image-viewer__nav--next"
                    onClick={showNextImage}
                    aria-label="الصورة التالية"
                  >
                    <FiChevronRight />
                  </button>
                ) : null}

                <div className="user-report-image-viewer__footer">
                  <strong>{report.title}</strong>
                  <span>
                    صورة {activeImageIndex + 1} من {images.length}
                  </span>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default FollowedReportDetailsModal;
