import SectionHeading from './SectionHeading';
import { ABOUT_CARDS } from '../constants/landingContent';

function AboutSection() {
  return (
    <section id="about" className="page-section landing-soft-section">
      <div className="container">
        <SectionHeading title="من نحن" subtitle="نبني مجتمعًا أفضل معًا" />

        <div className="about-section__cards">
          {ABOUT_CARDS.map((item) => (
            <article key={item} className="about-section__card">
              <p>{item}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;