import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-section__overlay" />

      <div className="container hero-section__content">
        <div className="hero-section__copy">
          <h1 className="hero-section__title">
            بلّغ عن <span>مشاكل مدينتك</span> في ثواني
          </h1>

          <p className="hero-section__subtitle">
            <span className="hero-section__subtitle-line hero-section__subtitle-line--first">
              صوّر المشكلة، حدّد موقعها، وتابع حلّها بسهولة من خلال منصة موحدة تربطك
            </span>
            <span className="hero-section__subtitle-line hero-section__subtitle-line--second">
              بالجهات المختصة.
            </span>
          </p>

          <div className="hero-section__actions">
            <Link to="/reports/new" className="landing-btn landing-btn--hero">
              ابدأ الإبلاغ الآن
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;