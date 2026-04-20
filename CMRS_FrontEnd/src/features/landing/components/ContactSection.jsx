import SectionHeading from './SectionHeading';

function ContactSection() {
  return (
    <section id="contact" className="page-section landing-contact-section">
      <div className="container">
        <SectionHeading
          title="اتصل بنا"
          subtitle="أي استفسار أو اقتراح، املأ النموذج أدناه وسنعاود الاتصال بك في أقرب وقت ممكن"
        />

        <div className="contact-card">
          <form className="contact-form">
            <div className="contact-form__grid">
              <div className="contact-field">
                <label htmlFor="name">الاسم</label>
                <input id="name" type="text" placeholder="مثال: أحمد محمد" />
              </div>

              <div className="contact-field">
                <label htmlFor="phone">رقم الهاتف</label>
                <input id="phone" type="tel" placeholder="مثال: 0123456789" />
              </div>

              <div className="contact-field">
                <label htmlFor="email">البريد الإلكتروني</label>
                <input id="email" type="email" placeholder="example@mail.com" />
              </div>

              <div className="contact-field">
                <label htmlFor="subject">الموضوع</label>
                <input id="subject" type="text" placeholder="مثال: استفسار عن التطبيق" />
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="message">تفاصيل البلاغ أو الاستفسار</label>
              <textarea id="message" rows="5" placeholder="... اكتب رسالتك هنا" />
            </div>

            <button type="submit" className="landing-btn landing-btn--primary landing-btn--submit">
              ارسال
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;