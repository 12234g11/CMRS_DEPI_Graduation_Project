import { motion } from 'motion/react';
import SectionHeading from './SectionHeading';

const TOP_ROW = [
  {
    title: 'الخريطة',
    tone: 'solid',
    items: [
      'عرض جميع المشكلات على خريطة تفاعلية.',
      'إظهار البلاغات القريبة من موقع المستخدم.',
      'تجميع البلاغات المتقاربة لتحسين عرض الخريطة.',
    ],
  },
  {
    title: 'المتابعة',
    tone: 'light',
    items: [
      'متابعة حالة البلاغ (تم الإبلاغ – قيد المراجعة – قيد التنفيذ – تم الحل).',
      'استقبال تحديثات عند أي تغيير في حالة البلاغ.',
      'إمكانية متابعة بلاغات المستخدمين الآخرين.',
    ],
  },
  {
    title: 'الإبلاغ',
    tone: 'solid',
    items: [
      'إرسال بلاغ عن أي مشكلة في المدينة خلال ثوانٍ بخطوات بسيطة.',
      'تحديد موقع المشكلة تلقائيًا أو عبر الخريطة التفاعلية.',
      'رفع صور توضح تفاصيل المشكلة لزيادة دقة المعالجة.',
    ],
  },
];

const BOTTOM_ROW = [
  {
    title: 'المستخدم',
    tone: 'light',
    items: [
      'عرض بيانات المستخدم ومعلوماته.',
      'زيادة تقييم المستخدم حسب نشاطه.',
      'تسجيل خروج – تغيير كلمة المرور – حذف الحساب.',
    ],
  },
  {
    title: 'التفاعل',
    tone: 'solid',
    items: [
      'تأكيد صحة البلاغ من المستخدمين.',
      'متابعة بلاغات الآخرين.',
      'تحديد أهمية البلاغ لرفع أولويته.',
    ],
  },
  {
    title: 'الشركات',
    tone: 'light',
    items: [
      'عرض البلاغات حسب التخصص والمحافظة.',
      'فلترة البلاغات حسب النوع والموقع.',
      'تعيين فني أو مهندس لحل المشكلة.',
    ],
  },
];

const rowVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function ServicesShowcaseCard({ title, tone, items }) {
  return (
    <motion.article
      className={`services-showcase__card services-showcase__card--${tone}`}
      variants={cardVariants}
      whileHover={{ y: -4 }}
    >
      <h3>{title}</h3>

      <ul>
        {items.map((item, index) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.article>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="page-section landing-soft-section services-showcase-section">
      <div className="container">
        <SectionHeading
          title="الخدمات"
          subtitle="كل ما تحتاجه للإبلاغ عن مشكلات مدينتك في مكان واحد"
        />

        <div className="services-showcase">
          <motion.div
            className="services-showcase__row services-showcase__row--top"
            variants={rowVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
          >
            {TOP_ROW.map((card) => (
              <ServicesShowcaseCard key={card.title} {...card} />
            ))}
          </motion.div>

          <motion.div
            className="services-showcase__row services-showcase__row--bottom"
            variants={rowVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
          >
            {BOTTOM_ROW.map((card) => (
              <ServicesShowcaseCard key={card.title} {...card} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;