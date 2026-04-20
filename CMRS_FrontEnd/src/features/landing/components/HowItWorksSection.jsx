import SectionHeading from './SectionHeading';
import { HOW_IT_WORKS_STEPS } from '../constants/landingContent';

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="page-section">
      <div className="container">
        <SectionHeading
          title="كيف يعمل النظام"
          subtitle="بلّغ عن أي مشكلة في ثوانٍ وساهم في تحسين مدينتك بسهولة"
        />

        <div className="how-section">
          <div className="how-section__image" aria-hidden="true">
            <div className="how-section__image-overlay">صورة المشكلة</div>
          </div>

          <div className="how-section__flow">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <div key={step} className="how-step-wrap">
                <article className={`how-step ${index % 2 === 0 ? 'is-solid' : 'is-light'}`}>
                  <p>{step}</p>
                </article>

                <span className="how-step__arrow">↓</span>
              </div>
            ))}

            <article className="how-step how-step--wide is-solid">
              <p>يستقبل المستخدم إشعارات بكل تحديثات البلاغ.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;