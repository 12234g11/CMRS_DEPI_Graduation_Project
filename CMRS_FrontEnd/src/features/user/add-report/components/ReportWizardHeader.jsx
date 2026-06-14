import { FiArrowLeft } from 'react-icons/fi';

const steps = [
  { id: 1, label: 'الفئة' },
  { id: 2, label: 'التفاصيل' },
  { id: 3, label: 'الموقع' },
  { id: 4, label: 'إرسال' },
];

function ReportWizardHeader({ currentStep = 1 }) {
  return (
    <div className="add-report-hero">
      <div className="add-report-hero__intro">
        <h1>إضافة بلاغ جديد</h1>
        <p>ساعدنا في تحسين مدينتك - Submit a Report</p>
      </div>

      <div className="add-report-hero__steps">
        <div className={`add-report-hero__step ${currentStep === 1 ? 'is-active' : currentStep > 1 ? 'is-complete' : ''}`}>
          <span className="add-report-hero__step-badge">1</span>
          <span className="add-report-hero__step-label">الفئة</span>
        </div>

        <span className="add-report-hero__step-arrow">←</span>

        <div className={`add-report-hero__step ${currentStep === 2 ? 'is-active' : currentStep > 2 ? 'is-complete' : ''}`}>
          <span className="add-report-hero__step-badge">2</span>
          <span className="add-report-hero__step-label">التفاصيل</span>
        </div>

        <span className="add-report-hero__step-arrow">←</span>

        <div className={`add-report-hero__step ${currentStep === 3 ? 'is-active' : currentStep > 3 ? 'is-complete' : ''}`}>
          <span className="add-report-hero__step-badge">3</span>
          <span className="add-report-hero__step-label">الموقع</span>
        </div>

        <span className="add-report-hero__step-arrow">←</span>

        <div className={`add-report-hero__step ${currentStep === 4 ? 'is-active' : currentStep > 4 ? 'is-complete' : ''}`}>
          <span className="add-report-hero__step-badge">4</span>
          <span className="add-report-hero__step-label">إرسال</span>
        </div>
      </div>
    </div>
  );
}

export default ReportWizardHeader;