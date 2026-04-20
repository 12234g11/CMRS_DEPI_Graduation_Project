import SectionHeading from './SectionHeading';
import { VISION_ITEMS } from '../constants/landingContent';

function VisionSection() {
  return (
    <section id="vision" className="page-section">
      <div className="container">
        <SectionHeading title="رؤيتنا" subtitle="معًا نحو مدينة أفضل" />

        <div className="vision-grid">
          {VISION_ITEMS.map((item) => (
            <article key={item.id} className="vision-card">
              <span className="vision-card__badge">{item.id}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VisionSection;