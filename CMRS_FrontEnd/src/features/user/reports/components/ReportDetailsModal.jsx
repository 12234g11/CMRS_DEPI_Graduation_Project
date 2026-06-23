import { useNavigate } from 'react-router-dom';
import {
    FiAlertTriangle,
    FiCalendar,
    FiImage,
    FiInfo,
    FiMapPin,
    FiStar,
    FiX,
} from 'react-icons/fi';
import { ROUTES } from '../../../../shared/navigation';
import ReportStatusBadge from './ReportStatusBadge';

const categorySymbols = {
    lighting: '☀',
    cleaning: '♻',
    'roads-pavements': '⚑',
    'water-drainage': '◌',
    electricity: 'ϟ',
    'public-safety': '◇',
    'trees-gardens': '♣',
    other: '?',
};

function formatReportDate(value) {
    if (!value) return '—';

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return parsedDate.toISOString().slice(0, 10);
}

function DetailBlock({ icon, label, children, className = '' }) {
    return (
        <div className={`user-report-modal__detail-card ${className}`.trim()}>
            <div className="user-report-modal__detail-label">
                {icon}
                <span>{label}</span>
            </div>

            <div className="user-report-modal__detail-value">{children}</div>
        </div>
    );
}

function SummaryCard({ icon, label, children }) {
    return (
        <div className="user-report-modal__summary-card">
            <div className="user-report-modal__summary-label">
                {icon}
                <span>{label}</span>
            </div>

            <div className="user-report-modal__summary-value">{children}</div>
        </div>
    );
}

function ReportDetailsModal({ report, onClose }) {
    const navigate = useNavigate();

    if (!report) return null;

    const title = report.title || report.issue || 'عنوان البلاغ';
    const description = report.description || 'لا يوجد وصف متاح لهذا البلاغ.';
    const location =
        report.locationText ||
        [report.area, report.address].filter(Boolean).join(' - ') ||
        'لم يتم تحديد الموقع';

    const categoryLabel = report.categoryLabel || report.issue || 'أخرى';
    const categorySubtitle = report.categorySubtitle || 'Other';
    const categoryTone = report.categoryTone || report.statusTone || 'warning';
    const categoryIcon = categorySymbols[report.categoryId] || categorySymbols.other;

    const imageSrc =
        report.images?.[0] ||
        report.coverImage ||
        report.image ||
        '';

    const rating = report.rating || 4;

    const handleShowOnMap = () => {
        const markerId = `user-report-${report.id}`;

        onClose?.();

        navigate(ROUTES.DASHBOARD, {
            state: {
                focusMapReport: {
                    reportId: report.id,
                    markerId,
                    title,
                    area: report.area,
                    address: report.address,
                    statusLabel: report.statusLabel,
                    tone: report.statusTone,
                    position: report.position,
                },
            },
        });
    };

    return (
        <div className="user-report-modal" role="dialog" aria-modal="true">
            <button
                type="button"
                className="user-report-modal__backdrop"
                onClick={onClose}
                aria-label="إغلاق تفاصيل البلاغ"
            />

            <article className="user-report-modal__panel">
                <button
                    type="button"
                    className="user-report-modal__close"
                    onClick={onClose}
                    aria-label="إغلاق"
                >
                    <FiX />
                </button>

                <div className="user-report-modal__content">
                    <div className="user-report-modal__details">
                        <DetailBlock icon={<FiInfo />} label="عنوان المشكلة">
                            <strong>{title}</strong>
                        </DetailBlock>

                        <DetailBlock
                            icon={<FiInfo />}
                            label="وصف المشكلة"
                            className="user-report-modal__detail-card--description"
                        >
                            <p>{description}</p>
                        </DetailBlock>

                        <DetailBlock icon={<FiMapPin />} label="الموقع">
                            <strong>{location}</strong>
                        </DetailBlock>

                        <DetailBlock icon={<FiAlertTriangle />} label="نوع المشكلة">
                            <div className="user-report-modal__category-box">
                                <span className={`user-report-modal__category-icon is-${categoryTone}`}>
                                    {categoryIcon}
                                </span>

                                <div>
                                    <strong>{categoryLabel}</strong>
                                    <small>{categorySubtitle}</small>
                                </div>
                            </div>
                        </DetailBlock>
                    </div>

                    <div className="user-report-modal__media">
                        <div className="user-report-modal__image-box">
                            {imageSrc ? (
                                <img src={imageSrc} alt={title} />
                            ) : (
                                <div className="user-report-modal__image-placeholder">
                                    <FiImage />
                                    <span>لا توجد صورة للبلاغ</span>
                                </div>
                            )}
                        </div>

                        <div className="user-report-modal__summary-grid">
                            <SummaryCard icon={<FiCalendar />} label="التاريخ">
                                <strong>{formatReportDate(report.createdAt || report.date)}</strong>
                            </SummaryCard>

                            <SummaryCard icon={<FiInfo />} label="الحالة">
                                <ReportStatusBadge tone={report.statusTone}>
                                    {report.statusLabel || 'قيد المراجعة'}
                                </ReportStatusBadge>
                            </SummaryCard>

                            <SummaryCard icon={<FiStar />} label="التقييم">
                                <div className="user-report-modal__rating">
                                    <span>★</span>
                                    <strong>{rating}</strong>
                                </div>
                            </SummaryCard>
                        </div>
                    </div>
                </div>

                <div className="user-report-modal__map-action-wrap">
                    <button
                        type="button"
                        className="user-report-modal__map-action-btn"
                        onClick={handleShowOnMap}
                    >
                        <FiMapPin />
                        <span>عرض المشكلة على الخريطة</span>
                    </button>
                </div>
            </article>
        </div>
    );
}

export default ReportDetailsModal;